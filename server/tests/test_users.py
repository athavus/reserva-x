"""
Testes para as rotas de usuários usando unittest.
Execute com: python -m unittest server/tests/test_users.py
"""
import unittest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool
import sys
import os

# Adiciona o diretório server ao path para imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
from database import get_session
from models import User, Role
from utils.hash_password import hash_password
from utils.jwt import create_access_token


class TestUsersRoutes(unittest.TestCase):
    """Testes para rotas de usuários."""
    
    @classmethod
    def setUpClass(cls):
        """Configuração executada uma vez antes de todos os testes."""
        # Criar engine de teste em memória
        cls.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        SQLModel.metadata.create_all(cls.engine)
    
    def setUp(self):
        """Configuração executada antes de cada teste."""
        # Criar nova sessão para cada teste
        self.session = Session(self.engine)
        
        # Override da dependência get_session
        def get_session_override():
            return self.session
        
        app.dependency_overrides[get_session] = get_session_override
        self.client = TestClient(app)
        
        # Criar usuários de teste
        # Professor para testes que precisam de professor
        self.professor_user = User(
            email="professor@test.com",
            hashed_password=hash_password("senha12345"),
            role=Role.professor,
            project_name="Projeto Teste",
            is_active=True
        )
        self.session.add(self.professor_user)
        
        # Aluno para testes
        self.aluno_user = User(
            email="aluno@test.com",
            hashed_password=hash_password("senha12345"),
            role=Role.aluno,
            project_name="Projeto Teste",
            is_active=True
        )
        self.session.add(self.aluno_user)
        
        self.session.commit()
        self.session.refresh(self.professor_user)
        self.session.refresh(self.aluno_user)
        
        # Criar tokens
        professor_token = create_access_token(data={"sub": self.professor_user.email})
        aluno_token = create_access_token(data={"sub": self.aluno_user.email})
        
        self.professor_headers = {"Authorization": f"Bearer {professor_token}"}
        self.aluno_headers = {"Authorization": f"Bearer {aluno_token}"}
    
    def tearDown(self):
        """Limpeza executada após cada teste."""
        self.session.close()
        app.dependency_overrides.clear()
        
        # Limpar todas as tabelas
        SQLModel.metadata.drop_all(self.engine)
        SQLModel.metadata.create_all(self.engine)
    
    # ========== Testes para GET /users/ ==========
    
    def test_list_users_as_professor(self):
        """Testa listar usuários como professor."""
        response = self.client.get(
            "/users/",
            headers=self.professor_headers
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 2)  # Pelo menos professor e aluno
    
    def test_list_users_as_aluno(self):
        """Testa listar usuários como aluno (deve falhar)."""
        response = self.client.get(
            "/users/",
            headers=self.aluno_headers
        )
        
        self.assertEqual(response.status_code, 403)
        self.assertIn("professores", response.json()["detail"])
    
    def test_list_users_without_auth(self):
        """Testa listar usuários sem autenticação."""
        response = self.client.get("/users/")
        self.assertEqual(response.status_code, 401)
    
    # ========== Testes para GET /users/{user_id} ==========
    
    def test_read_user_by_id_as_owner(self):
        """Testa buscar próprio usuário."""
        response = self.client.get(
            f"/users/{self.aluno_user.id}",
            headers=self.aluno_headers
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], self.aluno_user.id)
        self.assertEqual(data["email"], self.aluno_user.email)
        self.assertEqual(data["role"], "aluno")
    
    def test_read_user_by_id_as_professor(self):
        """Testa professor buscando outro usuário."""
        response = self.client.get(
            f"/users/{self.aluno_user.id}",
            headers=self.professor_headers
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], self.aluno_user.id)
    
    def test_read_user_by_id_as_aluno_other_user(self):
        """Testa aluno tentando buscar outro usuário (deve falhar)."""
        response = self.client.get(
            f"/users/{self.professor_user.id}",
            headers=self.aluno_headers
        )
        
        self.assertEqual(response.status_code, 403)
        self.assertIn("permissão", response.json()["detail"])
    
    def test_read_user_by_id_nonexistent(self):
        """Testa buscar usuário que não existe."""
        response = self.client.get(
            "/users/999",
            headers=self.professor_headers
        )
        
        self.assertEqual(response.status_code, 404)
        self.assertIn("não encontrado", response.json()["detail"])
    
    def test_read_user_by_id_without_auth(self):
        """Testa buscar usuário sem autenticação."""
        response = self.client.get(f"/users/{self.aluno_user.id}")
        self.assertEqual(response.status_code, 401)
    
    # ========== Testes para PATCH /users/{user_id}/activate ==========
    
    def test_activate_user_as_professor(self):
        """Testa ativar usuário como professor."""
        # Criar usuário inativo
        inactive_user = User(
            email="inativo@test.com",
            hashed_password=hash_password("senha12345"),
            role=Role.aluno,
            project_name="Projeto",
            is_active=False
        )
        self.session.add(inactive_user)
        self.session.commit()
        self.session.refresh(inactive_user)
        
        response = self.client.patch(
            f"/users/{inactive_user.id}/activate",
            headers=self.professor_headers
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["is_active"])
        
        # Verificar no banco
        self.session.refresh(inactive_user)
        self.assertTrue(inactive_user.is_active)
    
    def test_activate_user_as_aluno(self):
        """Testa ativar usuário como aluno (deve falhar)."""
        response = self.client.patch(
            f"/users/{self.professor_user.id}/activate",
            headers=self.aluno_headers
        )
        
        self.assertEqual(response.status_code, 403)
        self.assertIn("professores", response.json()["detail"])
    
    def test_activate_nonexistent_user(self):
        """Testa ativar usuário que não existe."""
        response = self.client.patch(
            "/users/999/activate",
            headers=self.professor_headers
        )
        
        self.assertEqual(response.status_code, 404)
    
    def test_activate_user_without_auth(self):
        """Testa ativar usuário sem autenticação."""
        response = self.client.patch(f"/users/{self.aluno_user.id}/activate")
        self.assertEqual(response.status_code, 401)
    
    # ========== Testes para PATCH /users/{user_id}/deactivate ==========
    
    def test_deactivate_user_as_professor(self):
        """Testa desativar usuário como professor."""
        response = self.client.patch(
            f"/users/{self.aluno_user.id}/deactivate",
            headers=self.professor_headers
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertFalse(data["is_active"])
        
        # Verificar no banco
        self.session.refresh(self.aluno_user)
        self.assertFalse(self.aluno_user.is_active)
    
    def test_deactivate_user_as_aluno(self):
        """Testa desativar usuário como aluno (deve falhar)."""
        response = self.client.patch(
            f"/users/{self.professor_user.id}/deactivate",
            headers=self.aluno_headers
        )
        
        self.assertEqual(response.status_code, 403)
        self.assertIn("professores", response.json()["detail"])
    
    def test_deactivate_nonexistent_user(self):
        """Testa desativar usuário que não existe."""
        response = self.client.patch(
            "/users/999/deactivate",
            headers=self.professor_headers
        )
        
        self.assertEqual(response.status_code, 404)
    
    def test_deactivate_user_without_auth(self):
        """Testa desativar usuário sem autenticação."""
        response = self.client.patch(f"/users/{self.aluno_user.id}/deactivate")
        self.assertEqual(response.status_code, 401)
    
    # ========== Testes para DELETE /users/{user_id} ==========
    
    def test_delete_user_as_professor(self):
        """Testa deletar usuário como professor."""
        # Criar usuário para deletar
        user_to_delete = User(
            email="deletar@test.com",
            hashed_password=hash_password("senha12345"),
            role=Role.aluno,
            project_name="Projeto",
            is_active=True
        )
        self.session.add(user_to_delete)
        self.session.commit()
        self.session.refresh(user_to_delete)
        user_id = user_to_delete.id
        
        response = self.client.delete(
            f"/users/{user_id}",
            headers=self.professor_headers
        )
        
        self.assertEqual(response.status_code, 204)
        
        # Verificar que foi deletado
        deleted_user = self.session.get(User, user_id)
        self.assertIsNone(deleted_user)
    
    def test_delete_user_as_aluno(self):
        """Testa deletar usuário como aluno (deve falhar)."""
        response = self.client.delete(
            f"/users/{self.professor_user.id}",
            headers=self.aluno_headers
        )
        
        self.assertEqual(response.status_code, 403)
        self.assertIn("professores", response.json()["detail"])
    
    def test_delete_nonexistent_user(self):
        """Testa deletar usuário que não existe."""
        response = self.client.delete(
            "/users/999",
            headers=self.professor_headers
        )
        
        self.assertEqual(response.status_code, 404)
    
    def test_delete_user_without_auth(self):
        """Testa deletar usuário sem autenticação."""
        response = self.client.delete(f"/users/{self.aluno_user.id}")
        self.assertEqual(response.status_code, 401)


if __name__ == "__main__":
    unittest.main()
