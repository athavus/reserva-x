"""
Testes para as rotas de autenticação usando unittest.
Execute com: python -m unittest server/tests/test_auth.py
"""
import unittest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
import sys
import os

# Adiciona o diretório server ao path para imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app
from database import get_session


class TestAuth(unittest.TestCase):
    """Testes para autenticação."""
    
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
    
    def tearDown(self):
        """Limpeza executada após cada teste."""
        self.session.close()
        app.dependency_overrides.clear()
        
        # Limpar todas as tabelas
        SQLModel.metadata.drop_all(self.engine)
        SQLModel.metadata.create_all(self.engine)
    
    def test_register_user(self):
        """Testa o registro de um novo usuário."""
        response = self.client.post(
            "/auth/register",
            json={
                "email": "teste@example.com",
                "password": "senha12345",
                "role": "aluno",
                "project_name": "Projeto Teste"
            }
        )
        
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["email"], "teste@example.com")
        self.assertEqual(data["role"], "aluno")
        self.assertNotIn("hashed_password", data)  # Senha não deve ser retornada
    
    def test_register_duplicate_email(self):
        """Testa registro com e-mail duplicado."""
        # Primeiro registro
        self.client.post(
            "/auth/register",
            json={
                "email": "duplicado@example.com",
                "password": "senha12345",
                "role": "aluno",
                "project_name": "Projeto"
            }
        )
        
        # Tentativa de registro com mesmo e-mail
        response = self.client.post(
            "/auth/register",
            json={
                "email": "duplicado@example.com",
                "password": "outrasenha",
                "role": "professor",
                "project_name": "Outro Projeto"
            }
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn("já cadastrado", response.json()["detail"])
    
    def test_register_invalid_email(self):
        """Testa registro com e-mail inválido."""
        response = self.client.post(
            "/auth/register",
            json={
                "email": "email_invalido",
                "password": "senha12345",
                "role": "aluno",
                "project_name": "Projeto"
            }
        )
        
        self.assertEqual(response.status_code, 422)  # Validation error
    
    def test_register_short_password(self):
        """Testa registro com senha muito curta."""
        response = self.client.post(
            "/auth/register",
            json={
                "email": "teste@example.com",
                "password": "123",  # Menos de 8 caracteres
                "role": "aluno",
                "project_name": "Projeto"
            }
        )
        
        self.assertEqual(response.status_code, 422)  # Validation error
    
    def test_login_success(self):
        """Testa login com credenciais corretas."""
        # Registrar usuário
        self.client.post(
            "/auth/register",
            json={
                "email": "login@example.com",
                "password": "senha12345",
                "role": "aluno",
                "project_name": "Projeto"
            }
        )
        
        # Fazer login
        response = self.client.post(
            "/auth/login",
            json={
                "email": "login@example.com",
                "password": "senha12345"
            }
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["token_type"], "bearer")
        self.assertIsInstance(data["access_token"], str)
        self.assertGreater(len(data["access_token"]), 0)
    
    def test_login_wrong_password(self):
        """Testa login com senha incorreta."""
        # Registrar usuário
        self.client.post(
            "/auth/register",
            json={
                "email": "errado@example.com",
                "password": "senha12345",
                "role": "aluno",
                "project_name": "Projeto"
            }
        )
        
        # Tentar login com senha errada
        response = self.client.post(
            "/auth/login",
            json={
                "email": "errado@example.com",
                "password": "senhaerrada"
            }
        )
        
        self.assertEqual(response.status_code, 401)
        self.assertIn("incorretos", response.json()["detail"])
    
    def test_login_nonexistent_user(self):
        """Testa login com usuário que não existe."""
        response = self.client.post(
            "/auth/login",
            json={
                "email": "naoexiste@example.com",
                "password": "senha12345"
            }
        )
        
        self.assertEqual(response.status_code, 401)
        self.assertIn("incorretos", response.json()["detail"])
    
    def test_get_me_with_valid_token(self):
        """Testa a rota /auth/me com token válido."""
        # Registrar e fazer login
        self.client.post(
            "/auth/register",
            json={
                "email": "me@example.com",
                "password": "senha12345",
                "role": "professor",
                "project_name": "Projeto"
            }
        )
        
        login_response = self.client.post(
            "/auth/login",
            json={
                "email": "me@example.com",
                "password": "senha12345"
            }
        )
        
        token = login_response.json()["access_token"]
        
        # Acessar /auth/me com token
        response = self.client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["email"], "me@example.com")
        self.assertEqual(data["role"], "professor")
        self.assertTrue(data["is_active"])
    
    def test_get_me_without_token(self):
        """Testa /auth/me sem token."""
        response = self.client.get("/auth/me")
        
        self.assertEqual(response.status_code, 401)  # Unauthorized sem Bearer token
    
    def test_get_me_with_invalid_token(self):
        """Testa /auth/me com token inválido."""
        response = self.client.get(
            "/auth/me",
            headers={"Authorization": "Bearer token_invalido_123"}
        )
        
        self.assertEqual(response.status_code, 401)
    
    def test_register_both_roles(self):
        """Testa registro de aluno e professor."""
        # Registrar aluno
        response_aluno = self.client.post(
            "/auth/register",
            json={
                "email": "aluno@example.com",
                "password": "senha12345",
                "role": "aluno",
                "project_name": "Projeto A"
            }
        )
        
        # Registrar professor
        response_prof = self.client.post(
            "/auth/register",
            json={
                "email": "prof@example.com",
                "password": "senha12345",
                "role": "professor",
                "project_name": "Projeto B"
            }
        )
        
        self.assertEqual(response_aluno.status_code, 201)
        self.assertEqual(response_prof.status_code, 201)
        self.assertEqual(response_aluno.json()["role"], "aluno")
        self.assertEqual(response_prof.json()["role"], "professor")


if __name__ == "__main__":
    unittest.main()
