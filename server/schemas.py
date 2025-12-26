"""
Schemas Pydantic para validação de dados de entrada/saída.
"""
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Schema para criação de usuário"""
    email: EmailStr = Field(description="E-mail do usuário")
    password: str = Field(min_length=8, description="Senha do usuário")
    role: str = Field(description="Perfil do usuário (aluno ou professor)")
    project_name: str = Field(description="Nome do projeto")


class UserResponse(BaseModel):
    """Schema para resposta de dados do usuário"""
    id: int
    email: str
    role: str
    project_name: str
    is_active: bool
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    """Schema para resposta de token"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema para dados extraídos do token"""
    email: str | None = None


class LoginRequest(BaseModel):
    """Schema para requisição de login"""
    email: EmailStr = Field(description="E-mail do usuário")
    password: str = Field(description="Senha do usuário")
