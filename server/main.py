from contextlib import asynccontextmanager

from fastapi import FastAPI

from database import create_db_and_tables
from routers.users import router as users_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(
    title="Embedded Schedules",
    description="API para a aplicação de horários para o laboratório embedded",
    lifespan=lifespan,
)

app.include_router(users_router)
