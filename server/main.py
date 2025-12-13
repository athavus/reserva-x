from contextlib import (
    asynccontextmanager
)
from typing import List

from database import create_db_and_tables, get_session
from fastapi import Depends, FastAPI
from models import User
from sqlmodel import Session, select


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app: FastAPI = FastAPI(
    title="Embedded Schedules",
    description="API para a aplicação de horários para o laboratório embedded",
    lifespan=lifespan
)

@app.post("/users/", response_model=User)
def create_user(user: User, session: Session = Depends(get_session)):
    """Recebe um User, salva no banco e retorna o objeto criado."""
    db_user = User.model_validate(user)

    # AQUI É ONDE TEM QUE SER IMPLEMENTADO O HASH DA SENHA.

    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


@app.get("/users/", response_model=List[User])
def read_users(session: Session = Depends(get_session)):
    """Retorna a lista de todos os usuários."""
    statement = select(User)
    results = session.exec(statement).all()
    return results


@app.get("/users/{user_id}", response_model=User)
def read_user_by_id(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    return user
