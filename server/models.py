from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class Role(str, Enum):
    aluno = "aluno"
    professor = "professor"


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
