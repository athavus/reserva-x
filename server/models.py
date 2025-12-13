from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class Role(str, Enum):
    aluno = "aluno"
    professor = "professor"


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str

    role: Role
    project_name: str = Field(index=True)
    is_active: bool = Field(default=True)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class RegistrationRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    email: str = Field(index=True, unique=True)
    project_name: str = Field(index=True)
    password: str

    is_processed: bool = Field(default=False)

    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
