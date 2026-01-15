from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from sqlmodel import Field, Relationship, SQLModel


class Role(str, Enum):
    aluno = "aluno"
    professor = "professor"
    admin = "admin"


class ReservationStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class ReservationType(str, Enum):
    room = "room"  # Reserva de sala completa
    computer = "computer"  # Reserva de computador específico


class User(SQLModel, table=True):
    model_config = {
        "title": "Usuário",
        "description": (
            "Representa um usuário do sistema. "
            "Pode ser um aluno ou um professor, vinculado a um projeto específico."
        )
    }
    id: Optional[int] = Field(
        default=None,
        primary_key=True,
        description="Identificador único do usuário"
    )
    email: str = Field(
        index=True,
        unique=True,
        description="Endereço de e-mail do usuário",
    )
    hashed_password: str = Field(
        description="Senha do usuário armazenada de forma segura (hash)",
        min_length=8,
    )
    role: Role = Field(
        description="Perfil do usuário no sistema",
    )
    project_name: str = Field(
        index=True,
        description="Nome do projeto ao qual o usuário está vinculado",
    )
    is_active: bool = Field(
        default=True,
        description="Indica se o usuário está ativo no sistema",
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Data e hora de criação do usuário (UTC)",
    )


class RegistrationRequest(SQLModel, table=True):
    model_config = {
        "title": "Solicitação de Cadastro",
        "description": "Solicitação enviada por um usuário para criar uma conta em um projeto."
    }
    id: Optional[int] = Field(
        default=None,
        primary_key=True,
        description="Identificador único da solicitação"
    )
    email: str = Field(
        index=True,
        unique=True,
        description="E-mail do usuário solicitante",
    )
    project_name: str = Field(
        index=True,
        description="Nome do projeto ao qual o usuário deseja se vincular",
    )
    password: str = Field(
        description="Senha em texto plano enviada na solicitação (será hasheada)",
        min_length=8,
    )
    is_processed: bool = Field(
        default=False,
        description="Indica se a solicitação já foi analisada por um administrador",
    )
    submitted_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Data e hora em que a solicitação foi enviada",
    )


class Laboratory(SQLModel, table=True):
    """Representa uma sala ou laboratório"""
    model_config = {
        "title": "Laboratório",
        "description": "Representa uma sala ou laboratório disponível para reserva"
    }
    
    id: Optional[int] = Field(
        default=None,
        primary_key=True,
        description="Identificador único do laboratório"
    )
    name: str = Field(
        index=True,
        unique=True,
        description="Nome do laboratório",
        min_length=1,
        max_length=100
    )
    description: Optional[str] = Field(
        default=None,
        description="Descrição do laboratório",
        max_length=500
    )
    capacity: int = Field(
        description="Capacidade máxima de pessoas",
        gt=0
    )
    is_active: bool = Field(
        default=True,
        description="Indica se o laboratório está disponível para reservas"
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Data de criação do laboratório"
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Data da última atualização"
    )


class Computer(SQLModel, table=True):
    """Representa um computador em um laboratório"""
    model_config = {
        "title": "Computador",
        "description": "Representa um computador disponível em um laboratório"
    }
    
    id: Optional[int] = Field(
        default=None,
        primary_key=True,
        description="Identificador único do computador"
    )
    name: str = Field(
        index=True,
        description="Nome/identificação do computador",
        min_length=1,
        max_length=50
    )
    laboratory_id: int = Field(
        foreign_key="laboratory.id",
        description="ID do laboratório onde o computador está localizado"
    )
    specifications: Optional[str] = Field(
        default=None,
        description="Especificações técnicas do computador",
        max_length=500
    )
    is_active: bool = Field(
        default=True,
        description="Indica se o computador está disponível para reservas"
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Data de cadastro do computador"
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Data da última atualização"
    )


class UserLaboratoryAccess(SQLModel, table=True):
    """Relacionamento entre usuários e laboratórios que eles podem acessar"""
    model_config = {
        "title": "Acesso de Usuário a Laboratório",
        "description": "Define quais laboratórios um usuário pode acessar"
    }
    
    id: Optional[int] = Field(
        default=None,
        primary_key=True,
        description="Identificador único"
    )
    user_id: int = Field(
        foreign_key="user.id",
        description="ID do usuário"
    )
    laboratory_id: int = Field(
        foreign_key="laboratory.id",
        description="ID do laboratório"
    )
    granted_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Data em que o acesso foi concedido"
    )
    granted_by: int = Field(
        foreign_key="user.id",
        description="ID do administrador que concedeu o acesso"
    )


class Reservation(SQLModel, table=True):
    """Representa uma reserva de sala ou computador"""
    model_config = {
        "title": "Reserva",
        "description": "Representa uma solicitação de reserva de espaço ou equipamento"
    }
    
    id: Optional[int] = Field(
        default=None,
        primary_key=True,
        description="Identificador único da reserva"
    )
    user_id: int = Field(
        foreign_key="user.id",
        index=True,
        description="ID do usuário que criou a reserva"
    )
    laboratory_id: int = Field(
        foreign_key="laboratory.id",
        index=True,
        description="ID do laboratório reservado"
    )
    computer_id: Optional[int] = Field(
        default=None,
        foreign_key="computer.id",
        description="ID do computador reservado (se aplicável)"
    )
    reservation_type: ReservationType = Field(
        description="Tipo de reserva (sala completa ou computador)"
    )
    start_time: datetime = Field(
        index=True,
        description="Data e hora de início da reserva"
    )
    end_time: datetime = Field(
        index=True,
        description="Data e hora de término da reserva"
    )
    title: str = Field(
        description="Título/descrição da atividade",
        min_length=1,
        max_length=200
    )
    description: Optional[str] = Field(
        default=None,
        description="Descrição detalhada da atividade",
        max_length=1000
    )
    is_confidential: bool = Field(
        default=False,
        description="Indica se a atividade é confidencial"
    )
    status: ReservationStatus = Field(
        default=ReservationStatus.pending,
        index=True,
        description="Status da reserva (pendente, aprovada, rejeitada)"
    )
    reviewed_by: Optional[int] = Field(
        default=None,
        foreign_key="user.id",
        description="ID do administrador que revisou a reserva"
    )
    reviewed_at: Optional[datetime] = Field(
        default=None,
        description="Data e hora da revisão"
    )
    rejection_reason: Optional[str] = Field(
        default=None,
        description="Motivo da rejeição (se aplicável)",
        max_length=500
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Data de criação da reserva"
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Data da última atualização"
    )
