"""
Rotas para gerenciamento de acessos de usuários a laboratórios.
"""
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database import get_session
from dependencies import get_current_admin, get_current_user
from models import User, Laboratory, UserLaboratoryAccess, AccessRequest
from schemas import (
    UserLaboratoryAccessCreate, UserLaboratoryAccessResponse,
    AccessRequestCreate, AccessRequestResponse, AccessRequestProcess
)
from datetime import datetime, timezone

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


@router.post(
    "/requests",
    response_model=AccessRequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Solicitar acesso a laboratório",
    description="Permite que o usuário solicite acesso a um laboratório ao qual não tem permissão"
)
async def request_laboratory_access(
    request: AccessRequestCreate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Cria uma nova solicitação de acesso."""
    # Verifica se já tem acesso
    statement = select(UserLaboratoryAccess).where(
        UserLaboratoryAccess.user_id == current_user.id,
        UserLaboratoryAccess.laboratory_id == request.laboratory_id
    )
    existing_access = session.exec(statement).first()
    if existing_access:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você já possui acesso a este laboratório"
        )
    
    # Verifica se já tem solicitação pendente
    statement = select(AccessRequest).where(
        AccessRequest.user_id == current_user.id,
        AccessRequest.laboratory_id == request.laboratory_id,
        AccessRequest.is_processed == False
    )
    existing_request = session.exec(statement).first()
    if existing_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe uma solicitação de acesso pendente para este laboratório"
        )
    
    db_request = AccessRequest(
        user_id=current_user.id,
        laboratory_id=request.laboratory_id,
        reason=request.reason
    )
    
    session.add(db_request)
    session.commit()
    session.refresh(db_request)
    
    return db_request


@router.get(
    "/requests",
    response_model=list[AccessRequestResponse],
    summary="Listar solicitações de acesso",
    description="Lista solicitações pendentes (admin)"
)
async def list_access_requests(
    session: Annotated[Session, Depends(get_session)],
    current_admin: Annotated[User, Depends(get_current_admin)],
    pending_only: bool = True
):
    """Lista solicitações de acesso para o administrador."""
    statement = select(AccessRequest)
    if pending_only:
        statement = statement.where(AccessRequest.is_processed == False)
    
    requests = session.exec(statement).all()
    return requests


@router.post(
    "/requests/{request_id}/process",
    response_model=AccessRequestResponse,
    summary="Processar solicitação de acesso",
    description="Aprovar ou rejeitar uma solicitação de acesso (admin)"
)
async def process_access_request(
    request_id: int,
    process_data: AccessRequestProcess,
    session: Annotated[Session, Depends(get_session)],
    current_admin: Annotated[User, Depends(get_current_admin)]
):
    """Aprova ou rejeita uma solicitação de acesso."""
    db_request = session.get(AccessRequest, request_id)
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solicitação não encontrada"
        )
    
    if db_request.is_processed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta solicitação já foi processada"
        )
    
    db_request.is_processed = True
    db_request.is_approved = process_data.approved
    db_request.processed_at = datetime.now(timezone.utc)
    db_request.processed_by = current_admin.id
    
    if process_data.approved:
        # Cria o acesso efetivo
        access = UserLaboratoryAccess(
            user_id=db_request.user_id,
            laboratory_id=db_request.laboratory_id,
            granted_by=current_admin.id
        )
        session.add(access)
    
    session.add(db_request)
    session.commit()
    session.refresh(db_request)
    
    return db_request
