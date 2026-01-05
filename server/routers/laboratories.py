"""
Rotas para gerenciamento de laboratórios.
"""
from datetime import datetime, timezone
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database import get_session
from dependencies import get_current_user, get_current_admin
from models import Laboratory, User
from schemas import LaboratoryCreate, LaboratoryUpdate, LaboratoryResponse

router = APIRouter(
    prefix="/laboratories",
    tags=["Laboratories"],
)


@router.post(
    "/",
    response_model=LaboratoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastrar laboratório",
    description="Permite que o administrador cadastre um novo laboratório (RF13)"
)
async def create_laboratory(
    laboratory: LaboratoryCreate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_admin)]
):
    """Cadastra um novo laboratório no sistema."""
    # Verifica se já existe laboratório com esse nome
    statement = select(Laboratory).where(Laboratory.name == laboratory.name)
    existing = session.exec(statement).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Laboratório com nome '{laboratory.name}' já existe"
        )
    
    db_laboratory = Laboratory(
        name=laboratory.name,
        description=laboratory.description,
        capacity=laboratory.capacity
    )
    
    session.add(db_laboratory)
    session.commit()
    session.refresh(db_laboratory)
    
    return db_laboratory


@router.get(
    "/",
    response_model=list[LaboratoryResponse],
    summary="Listar laboratórios",
    description="Lista todos os laboratórios cadastrados"
)
async def list_laboratories(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
    include_inactive: bool = False
):
    """Lista todos os laboratórios do sistema."""
    statement = select(Laboratory)
    
    if not include_inactive:
        statement = statement.where(Laboratory.is_active == True)
    
    laboratories = session.exec(statement).all()
    return laboratories


@router.get(
    "/{laboratory_id}",
    response_model=LaboratoryResponse,
    summary="Obter laboratório",
    description="Obtém detalhes de um laboratório específico"
)
async def get_laboratory(
    laboratory_id: int,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Obtém um laboratório pelo ID."""
    laboratory = session.get(Laboratory, laboratory_id)
    
    if not laboratory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Laboratório não encontrado"
        )
    
    return laboratory


@router.patch(
    "/{laboratory_id}",
    response_model=LaboratoryResponse,
    summary="Editar laboratório",
    description="Permite que o administrador edite dados de um laboratório (RF15)"
)
async def update_laboratory(
    laboratory_id: int,
    laboratory_update: LaboratoryUpdate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_admin)]
):
    """Atualiza dados de um laboratório."""
    db_laboratory = session.get(Laboratory, laboratory_id)
    
    if not db_laboratory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Laboratório não encontrado"
        )
    
    # Atualiza apenas os campos fornecidos
    update_data = laboratory_update.model_dump(exclude_unset=True)
    
    # Se mudou o nome, verifica se já existe outro com esse nome
    if "name" in update_data and update_data["name"] != db_laboratory.name:
        statement = select(Laboratory).where(Laboratory.name == update_data["name"])
        existing = session.exec(statement).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Laboratório com nome '{update_data['name']}' já existe"
            )
    
    for key, value in update_data.items():
        setattr(db_laboratory, key, value)
    
    db_laboratory.updated_at = datetime.now(timezone.utc)
    
    session.add(db_laboratory)
    session.commit()
    session.refresh(db_laboratory)
    
    return db_laboratory


@router.delete(
    "/{laboratory_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Deletar laboratório",
    description="Permite que o administrador delete um laboratório (RF14)"
)
async def delete_laboratory(
    laboratory_id: int,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_admin)]
):
    """Deleta um laboratório do sistema."""
    db_laboratory = session.get(Laboratory, laboratory_id)
    
    if not db_laboratory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Laboratório não encontrado"
        )
    
    session.delete(db_laboratory)
    session.commit()
    
    return None
