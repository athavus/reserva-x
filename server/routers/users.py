"""
Rotas de gerenciamento de usuários (protegidas por autenticação).
"""

from typing import List

from database import get_session
from dependencies import get_current_active_user, require_professor
from fastapi import APIRouter, Depends, HTTPException, status
from models import User
from schemas import UserResponse
from sqlmodel import Session, select

router = APIRouter(
    prefix="/users",
    tags=["Usuários"],
)


@router.get(
    "/",
    summary="Listar todos os usuários",
    description="Retorna a lista com todos os usuários (apenas professores)",
    response_model=List[UserResponse],
)
def read_users(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_professor),  # Apenas professores
):
    """
    Lista todos os usuários do sistema.
    Apenas professores podem acessar esta rota.

    Args:
        session: Sessão do banco de dados
        current_user: Usuário autenticado (deve ser professor)

    Returns:
        Lista de usuários
    """
    statement = select(User)
    results = session.exec(statement).all()
    return results


@router.get(
    "/{user_id}",
    summary="Buscar usuário por ID",
    description="Retorna os dados de um usuário específico",
    response_model=UserResponse,
)
def read_user_by_id(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    """
    Busca um usuário pelo ID.
    Usuários podem ver seus próprios dados, professores podem ver qualquer usuário.

    Args:
        user_id: ID do usuário a ser buscado
        session: Sessão do banco de dados
        current_user: Usuário autenticado

    Returns:
        Dados do usuário

    Raises:
        HTTPException: Se o usuário não for encontrado ou não tiver permissão
    """
    user = session.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado"
        )

    # Usuários só podem ver seus próprios dados, exceto professores
    if current_user.id != user_id and current_user.role != "professor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar este usuário",
        )

    return user


@router.patch(
    "/{user_id}/activate",
    summary="Ativar usuário",
    description="Ativa um usuário inativo (apenas professores)",
    response_model=UserResponse,
)
def activate_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_professor),
):
    """
    Ativa um usuário inativo.
    Apenas professores podem executar esta ação.

    Args:
        user_id: ID do usuário a ser ativado
        session: Sessão do banco de dados
        current_user: Usuário autenticado (deve ser professor)

    Returns:
        Dados do usuário atualizado

    Raises:
        HTTPException: Se o usuário não for encontrado
    """
    user = session.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado"
        )

    user.is_active = True
    session.add(user)
    session.commit()
    session.refresh(user)

    return user


@router.patch(
    "/{user_id}/deactivate",
    summary="Desativar usuário",
    description="Desativa um usuário ativo (apenas professores)",
    response_model=UserResponse,
)
def deactivate_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_professor),
):
    """
    Desativa um usuário ativo.
    Apenas professores podem executar esta ação.

    Args:
        user_id: ID do usuário a ser desativado
        session: Sessão do banco de dados
        current_user: Usuário autenticado (deve ser professor)

    Returns:
        Dados do usuário atualizado

    Raises:
        HTTPException: Se o usuário não for encontrado
    """
    user = session.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado"
        )

    user.is_active = False
    session.add(user)
    session.commit()
    session.refresh(user)

    return user


@router.delete(
    "/{user_id}",
    summary="Deletar usuário",
    description="Remove um usuário do sistema (apenas professores)",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_professor),
):
    """
    Deleta um usuário do sistema.
    Apenas professores podem executar esta ação.

    Args:
        user_id: ID do usuário a ser deletado
        session: Sessão do banco de dados
        current_user: Usuário autenticado (deve ser professor)

    Raises:
        HTTPException: Se o usuário não for encontrado
    """
    user = session.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado"
        )

    session.delete(user)
    session.commit()
