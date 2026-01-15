"""
Schemas Pydantic para validação de dados de entrada/saída.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


# ==================== USER SCHEMAS ====================

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


# ==================== AUTH SCHEMAS ====================

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


# ==================== REGISTRATION SCHEMAS ====================

class RegistrationRequestCreate(BaseModel):
    """Schema para criar uma solicitação de cadastro"""
    email: EmailStr = Field(description="E-mail do usuário solicitante")
    password: str = Field(min_length=8, description="Senha do usuário")
    project_name: str = Field(description="Nome do projeto ao qual deseja se vincular")


class RegistrationRequestResponse(BaseModel):
    """Schema para resposta de solicitação de cadastro"""
    id: int
    email: str
    project_name: str
    is_processed: bool
    submitted_at: datetime
    
    class Config:
        from_attributes = True


class RegistrationRequestApprove(BaseModel):
    """Schema para aprovar uma solicitação de cadastro"""
    role: str = Field(description="Perfil do usuário (aluno ou professor)")


# ==================== LABORATORY SCHEMAS ====================

class LaboratoryCreate(BaseModel):
    """Schema para criação de laboratório"""
    name: str = Field(min_length=1, max_length=100, description="Nome do laboratório")
    description: Optional[str] = Field(None, max_length=500, description="Descrição")
    capacity: int = Field(gt=0, description="Capacidade máxima")


class LaboratoryUpdate(BaseModel):
    """Schema para atualização de laboratório"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    capacity: Optional[int] = Field(None, gt=0)
    is_active: Optional[bool] = None


class LaboratoryResponse(BaseModel):
    """Schema para resposta de laboratório"""
    id: int
    name: str
    description: Optional[str]
    capacity: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ==================== COMPUTER SCHEMAS ====================

class ComputerCreate(BaseModel):
    """Schema para criação de computador"""
    name: str = Field(min_length=1, max_length=50, description="Nome do computador")
    laboratory_id: int = Field(description="ID do laboratório")
    specifications: Optional[str] = Field(None, max_length=500, description="Especificações")


class ComputerUpdate(BaseModel):
    """Schema para atualização de computador"""
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    specifications: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class ComputerResponse(BaseModel):
    """Schema para resposta de computador"""
    id: int
    name: str
    laboratory_id: int
    specifications: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ==================== ACCESS SCHEMAS ====================

class UserLaboratoryAccessCreate(BaseModel):
    """Schema para conceder acesso de usuário a laboratório"""
    user_id: int = Field(description="ID do usuário")
    laboratory_id: int = Field(description="ID do laboratório")


class UserLaboratoryAccessResponse(BaseModel):
    """Schema para resposta de acesso"""
    id: int
    user_id: int
    laboratory_id: int
    granted_at: datetime
    granted_by: int
    
    class Config:
        from_attributes = True


# ==================== RESERVATION SCHEMAS ====================

class ReservationCreate(BaseModel):
    """Schema para criação de reserva"""
    laboratory_id: int = Field(description="ID do laboratório")
    computer_id: Optional[int] = Field(None, description="ID do computador (opcional)")
    reservation_type: str = Field(description="Tipo: 'room' ou 'computer'")
    start_time: datetime = Field(description="Data/hora de início")
    end_time: datetime = Field(description="Data/hora de término")
    title: str = Field(min_length=1, max_length=200, description="Título da atividade")
    description: Optional[str] = Field(None, max_length=1000, description="Descrição detalhada")
    is_confidential: bool = Field(default=False, description="Atividade confidencial?")
    
    @field_validator('reservation_type')
    @classmethod
    def validate_reservation_type(cls, v):
        if v not in ['room', 'computer']:
            raise ValueError("reservation_type deve ser 'room' ou 'computer'")
        return v
    
    @field_validator('end_time')
    @classmethod
    def validate_end_time(cls, v, info):
        if 'start_time' in info.data and v <= info.data['start_time']:
            raise ValueError("end_time deve ser posterior a start_time")
        return v


class ReservationUpdate(BaseModel):
    """Schema para atualização de reserva"""
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    is_confidential: Optional[bool] = None
    
    @field_validator('end_time')
    @classmethod
    def validate_end_time(cls, v, info):
        if v and 'start_time' in info.data and info.data['start_time']:
            if v <= info.data['start_time']:
                raise ValueError("end_time deve ser posterior a start_time")
        return v


class ReservationApprove(BaseModel):
    """Schema para aprovar reserva"""
    pass


class ReservationReject(BaseModel):
    """Schema para rejeitar reserva"""
    rejection_reason: str = Field(min_length=1, max_length=500, description="Motivo da rejeição")


class ReservationResponse(BaseModel):
    """Schema para resposta de reserva"""
    id: int
    user_id: int
    laboratory_id: int
    computer_id: Optional[int]
    reservation_type: str
    start_time: datetime
    end_time: datetime
    title: str
    description: Optional[str]
    is_confidential: bool
    status: str
    reviewed_by: Optional[int]
    reviewed_at: Optional[datetime]
    rejection_reason: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ==================== AVAILABILITY SCHEMAS ====================

class AvailabilityQuery(BaseModel):
    """Schema para consultar disponibilidade"""
    laboratory_id: int = Field(description="ID do laboratório")
    date: datetime = Field(description="Data para consultar disponibilidade")


class TimeSlot(BaseModel):
    """Representa um horário disponível"""
    start_time: datetime
    end_time: datetime
    is_available: bool
    reservation_id: Optional[int] = None
    reservation_title: Optional[str] = None


class AvailabilityResponse(BaseModel):
    """Schema para resposta de disponibilidade"""
    laboratory_id: int
    laboratory_name: str
    date: datetime
    time_slots: list[TimeSlot]
