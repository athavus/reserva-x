from fastapi import FastAPI
from typing import Dict

app: FastAPI = FastAPI(
    title="Embedded Schedules",
    description="API para a aplicação de horários para o laboratório embedded"
)
