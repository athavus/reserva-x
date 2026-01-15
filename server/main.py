"""
Aplicação principal FastAPI para gerenciamento de horários do laboratório.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import create_db_and_tables
from routers.auth import router as auth_router
from routers.users import router as users_router
from routers.laboratories import router as laboratories_router
from routers.computers import router as computers_router
from routers.access import router as access_router
from routers.reservations import router as reservations_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerencia o ciclo de vida da aplicação."""
    # Startup: cria tabelas no banco
    try:
        create_db_and_tables()
    except Exception as e:
        print(f"\n⚠️  Aviso: Não foi possível criar/verificar tabelas: {e}")
        print("   A aplicação continuará, mas algumas funcionalidades podem não funcionar.\n")
    yield
    # Shutdown: adicione aqui qualquer limpeza necessária


app = FastAPI(
    title="Embedded Schedules",
    description="API para gerenciamento de horários do laboratório embedded",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(laboratories_router)
app.include_router(computers_router)
app.include_router(access_router)
app.include_router(reservations_router)


@app.get(
    "/",
    tags=["Root"],
    summary="Rota raiz",
    description="Retorna informações básicas sobre a API"
)
def read_root():
    """Retorna informações básicas sobre a API."""
    return {
        "message": "Bem-vindo à API Embedded Schedules",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "auth": "/auth",
            "users": "/users",
            "laboratories": "/laboratories",
            "computers": "/computers",
            "access": "/access",
            "reservations": "/reservations"
        }
    }


@app.get(
    "/health",
    tags=["Health"],
    summary="Health check",
    description="Verifica se a API está funcionando"
)
def health_check():
    """Verifica o status da aplicação."""
    return {"status": "ok"}
