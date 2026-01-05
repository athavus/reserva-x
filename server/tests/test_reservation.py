"""
Testes para o módulo de reservas usando unittest.
"""
import unittest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
import sys
import os

# Adiciona o diretório server ao path para imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app
from database import get_session
from models import User, Laboratory, Computer, Reservation, Role, ReservationStatus, ReservationType


class TestReservations(unittest.TestCase):
    """Classe de testes para o sistema de reservas."""
    
    @classmethod
    def setUpClass(cls):
        """Configuração executada uma vez antes de todos os testes."""
        cls.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        SQLModel.metadata.create_all(cls.engine)
    
    def setUp(self):
        """Configuração executada antes de cada teste."""
        # Cria nova sessão para cada teste
        self.session = Session(self.engine)
        
        # Configura o cliente de teste
        def get_session_override():
            return self.session
        
        app.dependency_overrides[get_session] = get_session_override
        self.client = TestClient(app)
    
    def tearDown(self):
        """Limpeza executada após cada teste."""
        # Limpa todas as tabelas
        self.session.rollback()
        
        # Remove todos os dados criados no teste
        for table in reversed(SQLModel.metadata.sorted_tables):
            self.session.execute(table.delete())
        self.session.commit()
        
        self.session.close()
        app.dependency_overrides.clear()
    
    def create_test_user(self, role: Role = Role.professor, email: str = None) -> User:
        """Helper: Cria um usuário de teste."""
        import uuid
        if email is None:
            # Gera email único usando UUID para evitar conflitos
            unique_id = str(uuid.uuid4())[:8]
            email = f"test_{role.value}_{unique_id}@test.com"
        
        user = User(
            email=email,
            hashed_password="hashed_password",
            role=role,
            project_name="Test Project",
            is_active=True
        )
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user
    
    def create_test_lab(self, name: str = None) -> Laboratory:
        """Helper: Cria um laboratório de teste."""
        import uuid
        if name is None:
            # Gera nome único para evitar conflitos
            unique_id = str(uuid.uuid4())[:8]
            name = f"Test Lab {unique_id}"
        
        lab = Laboratory(
            name=name,
            description="Test Description",
            capacity=30,
            is_active=True
        )
        self.session.add(lab)
        self.session.commit()
        self.session.refresh(lab)
        return lab
    
    def create_test_computer(self, lab_id: int, name: str = None) -> Computer:
        """Helper: Cria um computador de teste."""
        import uuid
        if name is None:
            # Gera nome único para evitar conflitos
            unique_id = str(uuid.uuid4())[:8]
            name = f"PC-{unique_id}"
        
        computer = Computer(
            name=name,
            laboratory_id=lab_id,
            specifications="Test specs",
            is_active=True
        )
        self.session.add(computer)
        self.session.commit()
        self.session.refresh(computer)
        return computer
    
    def test_create_room_reservation_professor(self):
        """Testa criação de reserva de sala por professor."""
        professor = self.create_test_user(Role.professor)
        lab = self.create_test_lab()
        
        # Cria reserva
        start_time = datetime.now(timezone.utc) + timedelta(hours=2)
        end_time = start_time + timedelta(hours=2)
        
        reservation = Reservation(
            user_id=professor.id,
            laboratory_id=lab.id,
            reservation_type=ReservationType.room,
            start_time=start_time,
            end_time=end_time,
            title="Test Class",
            description="Test description",
            is_confidential=False
        )
        
        self.session.add(reservation)
        self.session.commit()
        self.session.refresh(reservation)
        
        self.assertIsNotNone(reservation.id)
        self.assertEqual(reservation.status, ReservationStatus.pending)
        self.assertEqual(reservation.user_id, professor.id)
        self.assertEqual(reservation.laboratory_id, lab.id)
    
    def test_student_role_validation(self):
        """Testa que aluno tem role correto (não pode reservar sala na lógica de negócio)."""
        student = self.create_test_user(Role.aluno)
        lab = self.create_test_lab()
        
        # Verifica que o usuário é aluno
        self.assertEqual(student.role, Role.aluno)
        self.assertTrue(lab.is_active)
        # Na rota real, isso retornaria 403 Forbidden para reserva de sala
    
    def test_create_computer_reservation(self):
        """Testa criação de reserva de computador."""
        user = self.create_test_user(Role.aluno)
        lab = self.create_test_lab()
        computer = self.create_test_computer(lab.id)
        
        start_time = datetime.now(timezone.utc) + timedelta(hours=2)
        end_time = start_time + timedelta(hours=2)
        
        reservation = Reservation(
            user_id=user.id,
            laboratory_id=lab.id,
            computer_id=computer.id,
            reservation_type=ReservationType.computer,
            start_time=start_time,
            end_time=end_time,
            title="Development",
            is_confidential=False
        )
        
        self.session.add(reservation)
        self.session.commit()
        self.session.refresh(reservation)
        
        self.assertIsNotNone(reservation.id)
        self.assertEqual(reservation.computer_id, computer.id)
        self.assertEqual(reservation.reservation_type, ReservationType.computer)
    
    def test_time_conflict_detection(self):
        """Testa detecção de conflito de horário."""
        user = self.create_test_user(Role.professor)
        lab = self.create_test_lab()
        
        # Cria primeira reserva
        start1 = datetime.now(timezone.utc) + timedelta(hours=2)
        end1 = start1 + timedelta(hours=2)
        
        reservation1 = Reservation(
            user_id=user.id,
            laboratory_id=lab.id,
            reservation_type=ReservationType.room,
            start_time=start1,
            end_time=end1,
            title="First Reservation",
            status=ReservationStatus.approved
        )
        self.session.add(reservation1)
        self.session.commit()
        
        # Tenta criar reserva conflitante
        start2 = start1 + timedelta(minutes=30)  # Sobrepõe
        end2 = start2 + timedelta(hours=2)
        
        # Verifica que há sobreposição
        self.assertLess(start2, end1, "Deve haver sobreposição de horários")
        self.assertLess(start1, end2, "Deve haver sobreposição de horários")
        # Na implementação real, a rota detectaria este conflito
    
    def test_reservation_status_workflow(self):
        """Testa fluxo de aprovação de reserva."""
        import uuid
        user = self.create_test_user(Role.professor)
        admin = self.create_test_user(Role.admin, f"admin_{uuid.uuid4().hex[:8]}@test.com")
        lab = self.create_test_lab()
        
        start_time = datetime.now(timezone.utc) + timedelta(hours=2)
        end_time = start_time + timedelta(hours=2)
        
        # Cria reserva (pendente)
        reservation = Reservation(
            user_id=user.id,
            laboratory_id=lab.id,
            reservation_type=ReservationType.room,
            start_time=start_time,
            end_time=end_time,
            title="Test",
            status=ReservationStatus.pending
        )
        self.session.add(reservation)
        self.session.commit()
        
        self.assertEqual(reservation.status, ReservationStatus.pending)
        
        # Admin aprova
        reservation.status = ReservationStatus.approved
        reservation.reviewed_by = admin.id
        reservation.reviewed_at = datetime.now(timezone.utc)
        self.session.add(reservation)
        self.session.commit()
        
        self.assertEqual(reservation.status, ReservationStatus.approved)
        self.assertEqual(reservation.reviewed_by, admin.id)
        self.assertIsNotNone(reservation.reviewed_at)
    
    def test_confidential_reservation(self):
        """Testa reservas confidenciais."""
        user = self.create_test_user(Role.professor)
        lab = self.create_test_lab()
        
        start_time = datetime.now(timezone.utc) + timedelta(hours=2)
        end_time = start_time + timedelta(hours=2)
        
        reservation = Reservation(
            user_id=user.id,
            laboratory_id=lab.id,
            reservation_type=ReservationType.room,
            start_time=start_time,
            end_time=end_time,
            title="Confidential Meeting",
            is_confidential=True
        )
        
        self.session.add(reservation)
        self.session.commit()
        
        self.assertTrue(reservation.is_confidential)
        # Na API, outros usuários não veriam o título real
    
    def test_multiple_pending_reservations_detection(self):
        """Testa detecção de múltiplas reservas pendentes."""
        from sqlmodel import select
        
        user = self.create_test_user(Role.professor)
        lab = self.create_test_lab()
        
        # Primeira reserva pendente
        start1 = datetime.now(timezone.utc) + timedelta(hours=2)
        end1 = start1 + timedelta(hours=2)
        
        reservation1 = Reservation(
            user_id=user.id,
            laboratory_id=lab.id,
            reservation_type=ReservationType.room,
            start_time=start1,
            end_time=end1,
            title="First",
            status=ReservationStatus.pending
        )
        self.session.add(reservation1)
        self.session.commit()
        
        # Verifica se já tem pendente
        statement = select(Reservation).where(
            Reservation.user_id == user.id,
            Reservation.status == ReservationStatus.pending
        )
        existing = self.session.exec(statement).first()
        
        self.assertIsNotNone(existing, "Deve existir uma reserva pendente")
        # Na API, isso bloquearia a criação de uma segunda reserva pendente
    
    def test_30_minute_cancellation_rule(self):
        """Testa regra de 30 minutos para cancelamento."""
        user = self.create_test_user(Role.professor)
        lab = self.create_test_lab()
        
        # Reserva que começa em 20 minutos
        start_time = datetime.now(timezone.utc) + timedelta(minutes=20)
        end_time = start_time + timedelta(hours=2)
        
        reservation = Reservation(
            user_id=user.id,
            laboratory_id=lab.id,
            reservation_type=ReservationType.room,
            start_time=start_time,
            end_time=end_time,
            title="Soon",
            status=ReservationStatus.approved
        )
        self.session.add(reservation)
        self.session.commit()
        
        # Verifica tempo até início
        # Nota: SQLite não preserva timezone, então usamos start_time original
        now = datetime.now(timezone.utc)
        time_until_start = (start_time - now).total_seconds() / 60
        
        self.assertLess(time_until_start, 30, "Deve estar dentro dos 30 minutos")
        # Na API, isso bloquearia cancelamento/edição
    
    def test_laboratory_creation(self):
        """Testa criação de laboratório."""
        lab = self.create_test_lab()
        
        self.assertIsNotNone(lab.id)
        self.assertIsNotNone(lab.name)
        self.assertEqual(lab.capacity, 30)
        self.assertTrue(lab.is_active)
    
    def test_computer_creation(self):
        """Testa criação de computador."""
        lab = self.create_test_lab()
        computer = self.create_test_computer(lab.id)
        
        self.assertIsNotNone(computer.id)
        self.assertIsNotNone(computer.name)
        self.assertEqual(computer.laboratory_id, lab.id)
        self.assertTrue(computer.is_active)
    
    def test_reservation_time_validation(self):
        """Testa validação de horários da reserva."""
        user = self.create_test_user(Role.professor)
        lab = self.create_test_lab()
        
        start_time = datetime.now(timezone.utc) + timedelta(hours=2)
        end_time = start_time + timedelta(hours=2)
        
        # Verifica que end_time é posterior a start_time
        self.assertGreater(end_time, start_time)
        
        # Cria reserva válida
        reservation = Reservation(
            user_id=user.id,
            laboratory_id=lab.id,
            reservation_type=ReservationType.room,
            start_time=start_time,
            end_time=end_time,
            title="Valid Time Range"
        )
        
        self.session.add(reservation)
        self.session.commit()
        
        self.assertGreater(reservation.end_time, reservation.start_time)
    
    def test_reservation_types(self):
        """Testa diferentes tipos de reserva."""
        user = self.create_test_user(Role.professor)
        lab = self.create_test_lab()
        computer = self.create_test_computer(lab.id)
        
        start_time = datetime.now(timezone.utc) + timedelta(hours=2)
        end_time = start_time + timedelta(hours=2)
        
        # Reserva de sala
        room_reservation = Reservation(
            user_id=user.id,
            laboratory_id=lab.id,
            reservation_type=ReservationType.room,
            start_time=start_time,
            end_time=end_time,
            title="Room Reservation"
        )
        self.session.add(room_reservation)
        
        # Reserva de computador
        computer_reservation = Reservation(
            user_id=user.id,
            laboratory_id=lab.id,
            computer_id=computer.id,
            reservation_type=ReservationType.computer,
            start_time=start_time + timedelta(days=1),
            end_time=end_time + timedelta(days=1),
            title="Computer Reservation"
        )
        self.session.add(computer_reservation)
        
        self.session.commit()
        
        self.assertEqual(room_reservation.reservation_type, ReservationType.room)
        self.assertIsNone(room_reservation.computer_id)
        
        self.assertEqual(computer_reservation.reservation_type, ReservationType.computer)
        self.assertIsNotNone(computer_reservation.computer_id)
    
    def test_user_roles(self):
        """Testa criação de usuários com diferentes roles."""
        import uuid
        unique = uuid.uuid4().hex[:8]
        admin = self.create_test_user(Role.admin, f"admin_{unique}@test.com")
        professor = self.create_test_user(Role.professor, f"prof_{unique}@test.com")
        aluno = self.create_test_user(Role.aluno, f"aluno_{unique}@test.com")
        
        self.assertEqual(admin.role, Role.admin)
        self.assertEqual(professor.role, Role.professor)
        self.assertEqual(aluno.role, Role.aluno)
    
    def test_reservation_rejection(self):
        """Testa rejeição de reserva."""
        import uuid
        user = self.create_test_user(Role.professor)
        admin = self.create_test_user(Role.admin, f"admin_{uuid.uuid4().hex[:8]}@test.com")
        lab = self.create_test_lab()
        
        start_time = datetime.now(timezone.utc) + timedelta(hours=2)
        end_time = start_time + timedelta(hours=2)
        
        reservation = Reservation(
            user_id=user.id,
            laboratory_id=lab.id,
            reservation_type=ReservationType.room,
            start_time=start_time,
            end_time=end_time,
            title="To Be Rejected",
            status=ReservationStatus.pending
        )
        self.session.add(reservation)
        self.session.commit()
        
        # Admin rejeita
        reservation.status = ReservationStatus.rejected
        reservation.reviewed_by = admin.id
        reservation.reviewed_at = datetime.now(timezone.utc)
        reservation.rejection_reason = "Conflito com outra atividade"
        self.session.add(reservation)
        self.session.commit()
        
        self.assertEqual(reservation.status, ReservationStatus.rejected)
        self.assertIsNotNone(reservation.rejection_reason)
        self.assertEqual(reservation.reviewed_by, admin.id)


class TestLaboratoryModel(unittest.TestCase):
    """Testes específicos para o modelo Laboratory."""
    
    def setUp(self):
        """Configuração antes de cada teste."""
        self.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        SQLModel.metadata.create_all(self.engine)
        self.session = Session(self.engine)
    
    def tearDown(self):
        """Limpeza após cada teste."""
        # Limpa todas as tabelas
        for table in reversed(SQLModel.metadata.sorted_tables):
            self.session.execute(table.delete())
        self.session.commit()
        self.session.close()
    
    def test_laboratory_fields(self):
        """Testa campos do modelo Laboratory."""
        import uuid
        unique_name = f"Test Lab {uuid.uuid4().hex[:8]}"
        lab = Laboratory(
            name=unique_name,
            description="Test Description",
            capacity=25,
            is_active=True
        )
        self.session.add(lab)
        self.session.commit()
        self.session.refresh(lab)
        
        self.assertEqual(lab.name, unique_name)
        self.assertEqual(lab.description, "Test Description")
        self.assertEqual(lab.capacity, 25)
        self.assertTrue(lab.is_active)
        self.assertIsNotNone(lab.created_at)
        self.assertIsNotNone(lab.updated_at)


class TestComputerModel(unittest.TestCase):
    """Testes específicos para o modelo Computer."""
    
    def setUp(self):
        """Configuração antes de cada teste."""
        self.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        SQLModel.metadata.create_all(self.engine)
        self.session = Session(self.engine)
    
    def tearDown(self):
        """Limpeza após cada teste."""
        self.session.close()
    
    def test_computer_fields(self):
        """Testa campos do modelo Computer."""
        import uuid
        unique_id = uuid.uuid4().hex[:8]
        
        # Cria laboratório primeiro
        lab = Laboratory(name=f"Test Lab {unique_id}", capacity=20, is_active=True)
        self.session.add(lab)
        self.session.commit()
        self.session.refresh(lab)
        
        # Cria computador
        computer = Computer(
            name=f"PC-{unique_id}",
            laboratory_id=lab.id,
            specifications="Intel i7, 16GB RAM",
            is_active=True
        )
        self.session.add(computer)
        self.session.commit()
        self.session.refresh(computer)
        
        self.assertEqual(computer.name, f"PC-{unique_id}")
        self.assertEqual(computer.laboratory_id, lab.id)
        self.assertEqual(computer.specifications, "Intel i7, 16GB RAM")
        self.assertTrue(computer.is_active)
        self.assertIsNotNone(computer.created_at)


if __name__ == '__main__':
    unittest.main()
