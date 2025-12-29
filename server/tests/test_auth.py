"""
Testes para as rotas de autenticação usando unittest.
Execute com: python -m unittest server/tests/test_auth.py
"""
import unittest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool
import sys
import os

# Adiciona o diretório server ao path para imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app
from database import get_session
from models import User, RegistrationRequest, Role
from utils.hash_password import hash_password
from utils.jwt import create_access_token


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
        
        # Criar um usuário admin para testes que precisam de admin
        admin_user = User(
            email="admin@test.com",
            hashed_password=hash_password("admin12345"),
            role=Role.admin,
            project_name="Admin Project",
            is_active=True
        )
        self.session.add(admin_user)
        self.session.commit()
        self.session.refresh(admin_user)
        
        # Criar token para o admin
        admin_token = create_access_token(data={"sub": admin_user.email})
        self.admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    def tearDown(self):
        """Limpeza executada após cada teste."""
        self.session.close()
        app.dependency_overrides.clear()
        
        # Limpar todas as tabelas
        SQLModel.metadata.drop_all(self.engine)
        SQLModel.metadata.create_all(self.engine)
    
    # ========== Testes para RF05 - Solicitar cadastro ==========
    
    def test_request_registration(self):
        """Testa a solicitação de cadastro (RF05)."""
        response = self.client.post(
            "/auth/request-registration",
            json={
                "email": "novo@example.com",
                "password": "senha12345",
                "project_name": "Projeto Teste"
            }
        )
        
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["email"], "novo@example.com")
        self.assertEqual(data["project_name"], "Projeto Teste")
        self.assertFalse(data["is_processed"])
        self.assertIn("submitted_at", data)
    
    def test_request_registration_duplicate_email(self):
        """Testa solicitação com e-mail já cadastrado."""
        # Criar usuário existente
        existing_user = User(
            email="existente@example.com",
            hashed_password=hash_password("senha12345"),
            role=Role.aluno,
            project_name="Projeto",
            is_active=True
        )
        self.session.add(existing_user)
        self.session.commit()
        
        # Tentar solicitar cadastro com mesmo e-mail
        response = self.client.post(
            "/auth/request-registration",
            json={
                "email": "existente@example.com",
                "password": "outrasenha",
                "project_name": "Outro Projeto"
            }
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn("já cadastrado", response.json()["detail"])
    
    def test_request_registration_duplicate_pending_request(self):
        """Testa solicitação com e-mail que já tem solicitação pendente."""
        # Criar solicitação pendente
        request = RegistrationRequest(
            email="pendente@example.com",
            password="senha12345",
            project_name="Projeto",
            is_processed=False
        )
        self.session.add(request)
        self.session.commit()
        
        # Tentar criar outra solicitação com mesmo e-mail
        response = self.client.post(
            "/auth/request-registration",
            json={
                "email": "pendente@example.com",
                "password": "outrasenha",
                "project_name": "Outro Projeto"
            }
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn("solicitação pendente", response.json()["detail"])
    
    def test_request_registration_invalid_email(self):
        """Testa solicitação com e-mail inválido."""
        response = self.client.post(
            "/auth/request-registration",
            json={
                "email": "email_invalido",
                "password": "senha12345",
                "project_name": "Projeto"
            }
        )
        
        self.assertEqual(response.status_code, 422)  # Validation error
    
    def test_request_registration_short_password(self):
        """Testa solicitação com senha muito curta."""
        response = self.client.post(
            "/auth/request-registration",
            json={
                "email": "teste@example.com",
                "password": "123",  # Menos de 8 caracteres
                "project_name": "Projeto"
            }
        )
        
        self.assertEqual(response.status_code, 422)  # Validation error
    
    # ========== Testes para RF07 - Listar solicitações (Admin) ==========
    
    def test_list_registration_requests_as_admin(self):
        """Testa listar solicitações pendentes como admin (RF07)."""
        # Criar algumas solicitações
        request1 = RegistrationRequest(
            email="req1@example.com",
            password="senha12345",
            project_name="Projeto 1",
            is_processed=False
        )
        request2 = RegistrationRequest(
            email="req2@example.com",
            password="senha12345",
            project_name="Projeto 2",
            is_processed=False
        )
        self.session.add(request1)
        self.session.add(request2)
        self.session.commit()
        
        # Listar como admin
        response = self.client.get(
            "/auth/registration-requests",
            headers=self.admin_headers
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]["email"], "req1@example.com")
        self.assertEqual(data[1]["email"], "req2@example.com")
    
    def test_list_registration_requests_only_pending(self):
        """Testa que apenas solicitações pendentes são listadas."""
        # Criar solicitações pendentes e processadas
        pending = RegistrationRequest(
            email="pendente@example.com",
            password="senha12345",
            project_name="Projeto",
            is_processed=False
        )
        processed = RegistrationRequest(
            email="processada@example.com",
            password="senha12345",
            project_name="Projeto",
            is_processed=True
        )
        self.session.add(pending)
        self.session.add(processed)
        self.session.commit()
        
        response = self.client.get(
            "/auth/registration-requests",
            headers=self.admin_headers
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["email"], "pendente@example.com")
    
    def test_list_registration_requests_without_auth(self):
        """Testa listar solicitações sem autenticação."""
        response = self.client.get("/auth/registration-requests")
        self.assertEqual(response.status_code, 401)
    
    def test_list_registration_requests_as_non_admin(self):
        """Testa listar solicitações como não-admin."""
        # Criar usuário não-admin
        user = User(
            email="user@test.com",
            hashed_password=hash_password("senha12345"),
            role=Role.aluno,
            project_name="Projeto",
            is_active=True
        )
        self.session.add(user)
        self.session.commit()
        
        token = create_access_token(data={"sub": user.email})
        headers = {"Authorization": f"Bearer {token}"}
        
        response = self.client.get(
            "/auth/registration-requests",
            headers=headers
        )
        
        self.assertEqual(response.status_code, 403)
        self.assertIn("administradores", response.json()["detail"])
    
    # ========== Testes para RF07 - Aprovar solicitação (Admin) ==========
    
    def test_approve_registration_request(self):
        """Testa aprovar uma solicitação de cadastro (RF07)."""
        # Criar solicitação
        request = RegistrationRequest(
            email="aprovado@example.com",
            password="senha12345",
            project_name="Projeto Aprovado",
            is_processed=False
        )
        self.session.add(request)
        self.session.commit()
        self.session.refresh(request)
        
        # Aprovar como admin
        response = self.client.post(
            f"/auth/registration-requests/{request.id}/approve",
            json={"role": "aluno"},
            headers=self.admin_headers
        )
        
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["email"], "aprovado@example.com")
        self.assertEqual(data["role"], "aluno")
        self.assertEqual(data["project_name"], "Projeto Aprovado")
        self.assertTrue(data["is_active"])
        
        # Verificar que a solicitação foi marcada como processada
        self.session.refresh(request)
        self.assertTrue(request.is_processed)
        
        # Verificar que o usuário foi criado
        statement = select(User).where(User.email == "aprovado@example.com")
        user = self.session.exec(statement).first()
        self.assertIsNotNone(user)
        self.assertEqual(user.role, Role.aluno)
    
    def test_approve_registration_request_as_professor(self):
        """Testa aprovar solicitação criando usuário como professor."""
        request = RegistrationRequest(
            email="prof@example.com",
            password="senha12345",
            project_name="Projeto Prof",
            is_processed=False
        )
        self.session.add(request)
        self.session.commit()
        self.session.refresh(request)
        
        response = self.client.post(
            f"/auth/registration-requests/{request.id}/approve",
            json={"role": "professor"},
            headers=self.admin_headers
        )
        
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["role"], "professor")
    
    def test_approve_registration_request_invalid_role(self):
        """Testa aprovar com role inválido."""
        request = RegistrationRequest(
            email="teste@example.com",
            password="senha12345",
            project_name="Projeto",
            is_processed=False
        )
        self.session.add(request)
        self.session.commit()
        self.session.refresh(request)
        
        response = self.client.post(
            f"/auth/registration-requests/{request.id}/approve",
            json={"role": "role_invalido"},
            headers=self.admin_headers
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn("Role inválido", response.json()["detail"])
    
    def test_approve_nonexistent_request(self):
        """Testa aprovar solicitação que não existe."""
        response = self.client.post(
            "/auth/registration-requests/999/approve",
            json={"role": "aluno"},
            headers=self.admin_headers
        )
        
        self.assertEqual(response.status_code, 404)
    
    def test_approve_already_processed_request(self):
        """Testa aprovar solicitação já processada."""
        request = RegistrationRequest(
            email="processada@example.com",
            password="senha12345",
            project_name="Projeto",
            is_processed=True
        )
        self.session.add(request)
        self.session.commit()
        self.session.refresh(request)
        
        response = self.client.post(
            f"/auth/registration-requests/{request.id}/approve",
            json={"role": "aluno"},
            headers=self.admin_headers
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn("já foi processada", response.json()["detail"])
    
    def test_approve_without_auth(self):
        """Testa aprovar sem autenticação."""
        response = self.client.post(
            "/auth/registration-requests/1/approve",
            json={"role": "aluno"}
        )
        self.assertEqual(response.status_code, 401)
    
    # ========== Testes para RF07 - Rejeitar solicitação (Admin) ==========
    
    def test_reject_registration_request(self):
        """Testa rejeitar uma solicitação de cadastro (RF07)."""
        request = RegistrationRequest(
            email="rejeitado@example.com",
            password="senha12345",
            project_name="Projeto Rejeitado",
            is_processed=False
        )
        self.session.add(request)
        self.session.commit()
        self.session.refresh(request)
        
        # Rejeitar como admin
        response = self.client.delete(
            f"/auth/registration-requests/{request.id}/reject",
            headers=self.admin_headers
        )
        
        self.assertEqual(response.status_code, 204)
        
        # Verificar que a solicitação foi marcada como processada
        self.session.refresh(request)
        self.assertTrue(request.is_processed)
        
        # Verificar que o usuário NÃO foi criado
        statement = select(User).where(User.email == "rejeitado@example.com")
        user = self.session.exec(statement).first()
        self.assertIsNone(user)
    
    def test_reject_nonexistent_request(self):
        """Testa rejeitar solicitação que não existe."""
        response = self.client.delete(
            "/auth/registration-requests/999/reject",
            headers=self.admin_headers
        )
        
        self.assertEqual(response.status_code, 404)
    
    def test_reject_already_processed_request(self):
        """Testa rejeitar solicitação já processada."""
        request = RegistrationRequest(
            email="processada@example.com",
            password="senha12345",
            project_name="Projeto",
            is_processed=True
        )
        self.session.add(request)
        self.session.commit()
        self.session.refresh(request)
        
        response = self.client.delete(
            f"/auth/registration-requests/{request.id}/reject",
            headers=self.admin_headers
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn("já foi processada", response.json()["detail"])
    
    def test_reject_without_auth(self):
        """Testa rejeitar sem autenticação."""
        response = self.client.delete("/auth/registration-requests/1/reject")
        self.assertEqual(response.status_code, 401)
    
    # ========== Testes para RF09 - Login ==========
    
    def test_login_success(self):
        """Testa login com credenciais corretas (RF09)."""
        # Criar usuário via aprovação de solicitação
        request = RegistrationRequest(
            email="login@example.com",
            password="senha12345",
            project_name="Projeto",
            is_processed=False
        )
        self.session.add(request)
        self.session.commit()
        self.session.refresh(request)
        
        # Aprovar solicitação
        self.client.post(
            f"/auth/registration-requests/{request.id}/approve",
            json={"role": "aluno"},
            headers=self.admin_headers
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
        # Criar usuário
        user = User(
            email="errado@example.com",
            hashed_password=hash_password("senha12345"),
            role=Role.aluno,
            project_name="Projeto",
            is_active=True
        )
        self.session.add(user)
        self.session.commit()
        
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
    
    def test_login_inactive_user(self):
        """Testa login com usuário inativo."""
        user = User(
            email="inativo@example.com",
            hashed_password=hash_password("senha12345"),
            role=Role.aluno,
            project_name="Projeto",
            is_active=False
        )
        self.session.add(user)
        self.session.commit()
        
        response = self.client.post(
            "/auth/login",
            json={
                "email": "inativo@example.com",
                "password": "senha12345"
            }
        )
        
        self.assertEqual(response.status_code, 403)
        self.assertIn("inativo", response.json()["detail"])
    
    # ========== Testes para /auth/me ==========
    
    def test_get_me_with_valid_token(self):
        """Testa a rota /auth/me com token válido."""
        # Criar usuário e fazer login
        user = User(
            email="me@example.com",
            hashed_password=hash_password("senha12345"),
            role=Role.professor,
            project_name="Projeto",
            is_active=True
        )
        self.session.add(user)
        self.session.commit()
        
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
        self.assertEqual(response.status_code, 401)
    
    def test_get_me_with_invalid_token(self):
        """Testa /auth/me com token inválido."""
        response = self.client.get(
            "/auth/me",
            headers={"Authorization": "Bearer token_invalido_123"}
        )
        
        self.assertEqual(response.status_code, 401)
    
    # ========== Teste de fluxo completo ==========
    
    def test_complete_flow(self):
        """Testa o fluxo completo: solicitar -> aprovar -> login."""
        # 1. Solicitar cadastro
        request_response = self.client.post(
            "/auth/request-registration",
            json={
                "email": "completo@example.com",
                "password": "senha12345",
                "project_name": "Projeto Completo"
            }
        )
        self.assertEqual(request_response.status_code, 201)
        request_id = request_response.json()["id"]
        
        # 2. Admin aprova
        approve_response = self.client.post(
            f"/auth/registration-requests/{request_id}/approve",
            json={"role": "aluno"},
            headers=self.admin_headers
        )
        self.assertEqual(approve_response.status_code, 201)
        
        # 3. Usuário faz login
        login_response = self.client.post(
            "/auth/login",
            json={
                "email": "completo@example.com",
                "password": "senha12345"
            }
        )
        self.assertEqual(login_response.status_code, 200)
        token = login_response.json()["access_token"]
        
        # 4. Usuário acessa /me
        me_response = self.client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(me_response.status_code, 200)
        self.assertEqual(me_response.json()["email"], "completo@example.com")


if __name__ == "__main__":
    unittest.main()
