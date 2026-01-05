"""
Rotas para gerenciamento de acessos de usuários a laboratórios.
"""
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database import get_session
from dependencies import get_current_admin
from models import User, Laboratory, UserLaboratoryAccess
from schemas import UserLaboratoryAccessCreate, UserLaboratoryAccessResponse

router = APIRouter(
    prefix="/access",
    tags=["Access Control"],
)


@router.post(
    "/",
    response_model=UserLaboratoryAccessResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Conceder acesso a laboratório",
    description="Permite que o administrador cadastre os laboratórios que um usuário pode acessar (RF18)"
)
async def grant_laboratory_access(
    access: UserLaboratoryAccessCreate,
    session: Annotated[Session, Depends(get_session)],
    current_admin: Annotated[User, Depends(get_current_admin)]
):
    """Concede acesso de um usuário a um laboratório."""
    # Verifica se o usuário existe
    user = session.get(User, access.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Verifica se o laboratório existe
    laboratory = session.get(Laboratory, access.laboratory_id)
    if not laboratory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Laboratório não encontrado"
        )
    
    # Verifica se o acesso já existe
    statement = select(UserLaboratoryAccess).where(
        UserLaboratoryAccess.user_id == access.user_id,
        UserLaboratoryAccess.laboratory_id == access.laboratory_id
    )
    existing = session.exec(statement).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário já possui acesso a este laboratório"
        )
    
    db_access = UserLaboratoryAccess(
        user_id=access.user_id,
        laboratory_id=access.laboratory_id,
        granted_by=current_admin.id
    )
    
    session.add(db_access)
    session.commit()
    session.refresh(db_access)
    
    return db_access


@router.get(
    "/user/{user_id}",
    response_model=list[UserLaboratoryAccessResponse],
    summary="Listar acessos de um usuário",
    description="Lista todos os laboratórios que um usuário pode acessar"
)
async def list_user_access(
    user_id: int,
    session: Annotated[Session, Depends(get_session)],
    current_admin: Annotated[User, Depends(get_current_admin)]
):
    """Lista todos os acessos de um usuário específico."""
    # Verifica se o usuário existe
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    statement = select(UserLaboratoryAccess).where(
        UserLaboratoryAccess.user_id == user_id
    )
    accesses = session.exec(statement).all()
    
    return accesses


@router.get(
    "/laboratory/{laboratory_id}",
    response_model=list[UserLaboratoryAccessResponse],
    summary="Listar usuários com acesso a laboratório",
    description="Lista todos os usuários que têm acesso a um laboratório"
)
async def list_laboratory_access(
    laboratory_id: int,
    session: Annotated[Session, Depends(get_session)],
    current_admin: Annotated[User, Depends(get_current_admin)]
):
    """Lista todos os usuários com acesso a um laboratório específico."""
    # Verifica se o laboratório existe
    laboratory = session.get(Laboratory, laboratory_id)
    if not laboratory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Laboratório não encontrado"
        )
    
    statement = select(UserLaboratoryAccess).where(
        UserLaboratoryAccess.laboratory_id == laboratory_id
    )
    accesses = session.exec(statement).all()
    
    return accesses


@router.delete(
    "/{access_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Revogar acesso",
    description="Permite que o administrador revogue o acesso de um usuário a um laboratório"
)
async def revoke_laboratory_access(
    access_id: int,
    session: Annotated[Session, Depends(get_session)],
    current_admin: Annotated[User, Depends(get_current_admin)]
):
    """Revoga o acesso de um usuário a um laboratório."""
    db_access = session.get(UserLaboratoryAccess, access_id)
    
    if not db_access:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Acesso não encontrado"
        )
    
    session.delete(db_access)
    session.commit()
    
    return None
