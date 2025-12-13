import os
from typing import Generator

from dotenv import load_dotenv
from sqlmodel import Session, SQLModel, create_engine

load_dotenv()

SUPABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
SUPABASE_HOST = os.getenv("DATABASE_HOST")

if not SUPABASE_PASSWORD or not SUPABASE_HOST:
    raise ValueError("Variáveis de Ambiente não encontradas")

DATABASE_URL = f"postgresql://postgres:{SUPABASE_PASSWORD}@{SUPABASE_HOST}/postgres"

engine = create_engine(
    DATABASE_URL,
    echo=True,
)


def create_db_and_tables():
    """
    Cria o banco de dados e todas as suas tabelas no Supabase
    """
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
