"""
Script para popular o banco de dados com dados de teste.
Execute: python seed_database.py
"""
from datetime import datetime, timezone, timedelta
from sqlmodel import Session
from database import engine, create_db_and_tables
from models import (
    User, Role, Laboratory, Computer, 
    UserLaboratoryAccess, Reservation, ReservationType, ReservationStatus
)
from utils.hash_password import hash_password


def seed_database():
    """Popula o banco com dados de teste."""
    
    print("🌱 Iniciando seed do banco de dados...")
    
    # Cria tabelas se não existirem
    create_db_and_tables()
    
    with Session(engine) as session:
        # Verifica se já tem dados
        existing_users = session.query(User).first()
        if existing_users:
            print("⚠️  Banco já possui dados. Deseja continuar? (s/n)")
            response = input().lower()
            if response != 's':
                print("❌ Seed cancelado.")
                return
        
        print("\n📝 Criando usuários...")
        
        # Cria usuários
        admin = User(
            email="admin@embedded.com",
            hashed_password=hash_password("admin123"),
            role=Role.admin,
            project_name="Administração",
            is_active=True
        )
        session.add(admin)
        
        # Admin RESERVAX (para o frontend)
        admin_reservax = User(
            email="admin@reservax.com",
            hashed_password=hash_password("admin123"),
            role=Role.admin,
            project_name="RESERVAX Admin",
            is_active=True
        )
        session.add(admin_reservax)
        
        professor1 = User(
            email="prof.silva@embedded.com",
            hashed_password=hash_password("prof123"),
            role=Role.professor,
            project_name="IoT Research",
            is_active=True
        )
        session.add(professor1)
        
        professor2 = User(
            email="prof.santos@embedded.com",
            hashed_password=hash_password("prof123"),
            role=Role.professor,
            project_name="Robotics Lab",
            is_active=True
        )
        session.add(professor2)
        
        aluno1 = User(
            email="joao.almeida@embedded.com",
            hashed_password=hash_password("aluno123"),
            role=Role.aluno,
            project_name="Smart Home System",
            is_active=True
        )
        session.add(aluno1)
        
        aluno2 = User(
            email="maria.costa@embedded.com",
            hashed_password=hash_password("aluno123"),
            role=Role.aluno,
            project_name="Drone Control",
            is_active=True
        )
        session.add(aluno2)
        
        aluno3 = User(
            email="pedro.lima@embedded.com",
            hashed_password=hash_password("aluno123"),
            role=Role.aluno,
            project_name="Automotive Systems",
            is_active=True
        )
        session.add(aluno3)
        
        session.commit()
        print(f"✅ Criados 7 usuários (2 admin, 2 professores, 3 alunos)")
        
        print("\n🏢 Criando laboratórios...")
        
        # Cria laboratórios
        lab_a = Laboratory(
            name="Lab A - Eletrônica",
            description="Laboratório de eletrônica básica e prototipagem",
            capacity=25,
            is_active=True
        )
        session.add(lab_a)
        
        lab_b = Laboratory(
            name="Lab B - Sistemas Embarcados",
            description="Laboratório especializado em microcontroladores",
            capacity=20,
            is_active=True
        )
        session.add(lab_b)
        
        lab_c = Laboratory(
            name="Lab C - IoT",
            description="Laboratório de Internet das Coisas",
            capacity=15,
            is_active=True
        )
        session.add(lab_c)
        
        session.commit()
        session.refresh(lab_a)
        session.refresh(lab_b)
        session.refresh(lab_c)
        print(f"✅ Criados 3 laboratórios")
        
        print("\n💻 Criando computadores...")
        
        # Cria computadores no Lab A
        computers_lab_a = []
        for i in range(1, 6):
            comp = Computer(
                name=f"PC-A{i:02d}",
                laboratory_id=lab_a.id,
                specifications=f"Intel i7, 16GB RAM, RTX 3060" if i <= 3 else "Intel i5, 8GB RAM",
                is_active=True
            )
            session.add(comp)
            computers_lab_a.append(comp)
        
        # Cria computadores no Lab B
        computers_lab_b = []
        for i in range(1, 5):
            comp = Computer(
                name=f"PC-B{i:02d}",
                laboratory_id=lab_b.id,
                specifications="AMD Ryzen 5, 32GB RAM, Ideal para compilação",
                is_active=True
            )
            session.add(comp)
            computers_lab_b.append(comp)
        
        # Cria computadores no Lab C
        computers_lab_c = []
        for i in range(1, 4):
            comp = Computer(
                name=f"PC-C{i:02d}",
                laboratory_id=lab_c.id,
                specifications="Intel i9, 64GB RAM, GPU para ML",
                is_active=True
            )
            session.add(comp)
            computers_lab_c.append(comp)
        
        session.commit()
        print(f"✅ Criados 12 computadores (5 no Lab A, 4 no Lab B, 3 no Lab C)")
        
        # Refresh users para pegar IDs
        session.refresh(admin)
        session.refresh(professor1)
        session.refresh(professor2)
        session.refresh(aluno1)
        session.refresh(aluno2)
        session.refresh(aluno3)
        
        print("\n🔐 Configurando acessos...")
        
        # Concede acessos
        accesses = [
            # Professor 1 tem acesso a todos os labs
            UserLaboratoryAccess(user_id=professor1.id, laboratory_id=lab_a.id, granted_by=admin.id),
            UserLaboratoryAccess(user_id=professor1.id, laboratory_id=lab_b.id, granted_by=admin.id),
            UserLaboratoryAccess(user_id=professor1.id, laboratory_id=lab_c.id, granted_by=admin.id),
            
            # Professor 2 tem acesso aos labs A e B
            UserLaboratoryAccess(user_id=professor2.id, laboratory_id=lab_a.id, granted_by=admin.id),
            UserLaboratoryAccess(user_id=professor2.id, laboratory_id=lab_b.id, granted_by=admin.id),
            
            # Alunos têm acessos específicos
            UserLaboratoryAccess(user_id=aluno1.id, laboratory_id=lab_a.id, granted_by=admin.id),
            UserLaboratoryAccess(user_id=aluno1.id, laboratory_id=lab_c.id, granted_by=admin.id),
            
            UserLaboratoryAccess(user_id=aluno2.id, laboratory_id=lab_b.id, granted_by=admin.id),
            
            UserLaboratoryAccess(user_id=aluno3.id, laboratory_id=lab_a.id, granted_by=admin.id),
            UserLaboratoryAccess(user_id=aluno3.id, laboratory_id=lab_b.id, granted_by=admin.id),
        ]
        
        for access in accesses:
            session.add(access)
        
        session.commit()
        print(f"✅ Configurados 10 acessos")
        
        print("\n📅 Criando reservas de exemplo...")
        
        # Reservas aprovadas (histórico)
        now = datetime.now(timezone.utc)
        
        # Reserva de sala pelo Professor 1 (amanhã, 14h-16h)
        reservation1 = Reservation(
            user_id=professor1.id,
            laboratory_id=lab_a.id,
            reservation_type=ReservationType.room,
            start_time=now + timedelta(days=1, hours=14-now.hour),
            end_time=now + timedelta(days=1, hours=16-now.hour),
            title="Aula Prática - Circuitos Digitais",
            description="Aula sobre flip-flops e registradores",
            is_confidential=False,
            status=ReservationStatus.approved,
            reviewed_by=admin.id,
            reviewed_at=now
        )
        session.add(reservation1)
        
        # Reserva de computador pelo Aluno 1 (amanhã, 10h-12h)
        reservation2 = Reservation(
            user_id=aluno1.id,
            laboratory_id=lab_a.id,
            computer_id=computers_lab_a[0].id,
            reservation_type=ReservationType.computer,
            start_time=now + timedelta(days=1, hours=10-now.hour),
            end_time=now + timedelta(days=1, hours=12-now.hour),
            title="Desenvolvimento TCC",
            description="Implementação do firmware do projeto Smart Home",
            is_confidential=False,
            status=ReservationStatus.approved,
            reviewed_by=admin.id,
            reviewed_at=now
        )
        session.add(reservation2)
        
        # Reserva pendente do Aluno 2
        reservation3 = Reservation(
            user_id=aluno2.id,
            laboratory_id=lab_b.id,
            computer_id=computers_lab_b[0].id,
            reservation_type=ReservationType.computer,
            start_time=now + timedelta(days=2, hours=14-now.hour),
            end_time=now + timedelta(days=2, hours=16-now.hour),
            title="Testes de Integração",
            description="Testes do sistema de controle de drone",
            is_confidential=False,
            status=ReservationStatus.pending
        )
        session.add(reservation3)
        
        # Reserva confidencial do Professor 2 (aprovada)
        reservation4 = Reservation(
            user_id=professor2.id,
            laboratory_id=lab_b.id,
            reservation_type=ReservationType.room,
            start_time=now + timedelta(days=3, hours=10-now.hour),
            end_time=now + timedelta(days=3, hours=12-now.hour),
            title="Reunião de Pesquisa",
            description="Discussão sobre resultados preliminares do projeto",
            is_confidential=True,
            status=ReservationStatus.approved,
            reviewed_by=admin.id,
            reviewed_at=now
        )
        session.add(reservation4)
        
        # Reserva de computador no Lab C
        reservation5 = Reservation(
            user_id=aluno1.id,
            laboratory_id=lab_c.id,
            computer_id=computers_lab_c[0].id,
            reservation_type=ReservationType.computer,
            start_time=now + timedelta(days=4, hours=15-now.hour),
            end_time=now + timedelta(days=4, hours=18-now.hour),
            title="Treinamento de Modelo ML",
            description="Treinamento de rede neural para reconhecimento de padrões",
            is_confidential=False,
            status=ReservationStatus.approved,
            reviewed_by=admin.id,
            reviewed_at=now
        )
        session.add(reservation5)
        
        session.commit()
        print(f"✅ Criadas 5 reservas (4 aprovadas, 1 pendente)")
        
        print("\n" + "="*60)
        print("✨ Seed concluído com sucesso!")
        print("="*60)
        print("\n📊 Resumo:")
        print(f"   • 6 usuários criados")
        print(f"   • 3 laboratórios configurados")
        print(f"   • 12 computadores cadastrados")
        print(f"   • 10 permissões de acesso")
        print(f"   • 5 reservas de exemplo")
        
        print("\n🔑 Credenciais de teste:")
        print("\n   Admin:")
        print("   Email: admin@embedded.com")
        print("   Senha: admin123")
        print("\n   Professor:")
        print("   Email: prof.silva@embedded.com")
        print("   Senha: prof123")
        print("\n   Aluno:")
        print("   Email: joao.almeida@embedded.com")
        print("   Senha: aluno123")
        
        print("\n🚀 Inicie o servidor: uvicorn main:app --reload")
        print("📖 Acesse a documentação: http://localhost:8000/docs")
        print()


if __name__ == "__main__":
    try:
        seed_database()
    except Exception as e:
        print(f"\n❌ Erro durante o seed: {e}")
        import traceback
        traceback.print_exc()
