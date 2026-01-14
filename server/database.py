import os
from typing import Generator
from urllib.parse import quote_plus, urlparse, urlunparse

from dotenv import load_dotenv
from sqlmodel import Session, SQLModel, create_engine

load_dotenv()

SUPABASE = os.getenv("DATABASE")


def encode_password_in_url(url: str) -> str:
    """
    Codifica caracteres especiais na senha de uma URL de conexão PostgreSQL.
    Isso é necessário quando a senha contém caracteres como @, #, etc.
    """
    parsed = urlparse(url)
    
    # Se a URL já está completa, codifica apenas a parte da senha
    if parsed.password:
        # Reconstrói a URL com a senha codificada
        encoded_password = quote_plus(parsed.password)
        netloc = f"{parsed.username}:{encoded_password}@{parsed.hostname}"
        if parsed.port:
            netloc += f":{parsed.port}"
        
        encoded_url = urlunparse((
            parsed.scheme,
            netloc,
            parsed.path,
            parsed.params,
            parsed.query,
            parsed.fragment
        ))
        return encoded_url
    
    return url


# Só cria o engine se DATABASE estiver definido (para não falhar em testes)
if SUPABASE:
    DATABASE_URL = encode_password_in_url(SUPABASE)
    engine = create_engine(
        DATABASE_URL,
        echo=True,
    )
else:
    # Engine None para testes - será sobrescrito pelos testes
    engine = None


def create_db_and_tables():
    """
    Cria o banco de dados e todas as suas tabelas no Supabase
    """
    if not SUPABASE:
        error_msg = (
            "❌ Variáveis de Ambiente não encontradas!\n\n"
            "Por favor, crie um arquivo .env na raiz do projeto com:\n"
            "DATABASE=sua_connection_string_completa\n"
            "SECRET_KEY=sua_chave_secreta_jwt\n\n"
            "Você pode copiar o arquivo .env.example se existir."
        )
        raise ValueError(error_msg)
    
    if not engine:
        raise ValueError("Engine não foi inicializado. Verifique a configuração do DATABASE no .env")
    
    try:
        SQLModel.metadata.create_all(engine)
        print("✓ Tabelas criadas/verificadas com sucesso no Supabase!")
    except Exception as e:
        error_msg = (
            f"\n❌ Erro ao conectar ao banco de dados Supabase:\n"
            f"   {str(e)}\n\n"
            f"Verifique:\n"
            f"1. Se o arquivo .env existe e está configurado corretamente\n"
            f"2. Se DATABASE está correto (connection string completa)\n"
            f"3. Se a senha do banco não foi alterada no Supabase\n"
            f"4. Se o host do Supabase está correto\n\n"
            f"Para obter as credenciais:\n"
            f"- Acesse o Supabase Dashboard\n"
            f"- Vá em Settings > Database\n"
            f"- Copie a Connection string ou use os valores individuais\n"
        )
        print(error_msg)
        raise


def get_session() -> Generator[Session, None, None]:
    if not engine:
        raise ValueError(
            "Engine não foi inicializado. "
            "Verifique se o arquivo .env está configurado corretamente com DATABASE."
        )
    with Session(engine) as session:
        yield session
