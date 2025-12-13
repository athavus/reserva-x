from contextlib import (
    asynccontextmanager,  # Importação necessária para o novo padrão de startup
)
from typing import List

# --- CORREÇÃO AQUI: Removido o ponto (.) antes de database e models ---
from database import create_db_and_tables, get_session
from fastapi import Depends, FastAPI
from models import User
from sqlmodel import Session, select


# --- DICA EXTRA: O padrão moderno para startup no FastAPI é usar lifespan ---
# O @app.on_event("startup") está obsoleto (deprecated). Use isso no lugar:
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Código que roda ANTES do app iniciar
    create_db_and_tables()
    yield
    # Código que roda DEPOIS do app desligar (se precisar)


# Passamos o lifespan para o FastAPI
app: FastAPI = FastAPI(
    title="Embedded Schedules",
    description="API para a aplicação de horários para o laboratório embedded",
    lifespan=lifespan,
)


@app.get("/", summary="Rota de Hello World básica para teste da aplicação")
def hello_world():
    return {"message": "Hello World"}


# (O @app.on_event("startup") foi removido pois usamos o lifespan acima)


@app.post("/users/", response_model=User)
def create_user(user: User, session: Session = Depends(get_session)):
    """Recebe um User Pydantic, salva no banco e retorna o objeto criado."""
    # Valida e converte
    db_user = User.model_validate(user)

    # OBS: É boa prática fazer o hash da senha AQUI antes de salvar.
    # Por enquanto, vamos salvar como veio (apenas para teste de conexão)

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
