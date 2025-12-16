from typing import List

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from database import get_session
from models import User

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)

@router.post(
    "/",
    summary="Criar usuários",
    description="Rota para criar usuários e salvar as mesmas no banco de dados",
    response_model=User,
)
def create_user(user: User, session: Session = Depends(get_session)):
    """Recebe um User, salva no banco e retorna o objeto criado."""
    db_user = User.model_validate(user)

    # AQUI É ONDE TEM QUE SER IMPLEMENTADO O HASH DA SENHA.

    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


@router.get(
    "/",
    summary="Listar todos os usuários",
    description="Entrega a lista com todos os usuários da aplicação",
    response_model=List[User],
)
def read_users(session: Session = Depends(get_session)):
    statement = select(User)
    results = session.exec(statement).all()
    return results


@router.get(
    "/{user_id}",
    summary="Busca um usuário pelo ID",
    description="Busca os dados de um usuário através de seu id",
    response_model=User,
)
def read_user_by_id(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    return user
