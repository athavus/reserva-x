"""
Rotas para gerenciamento de computadores.
"""
from datetime import datetime, timezone
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database import get_session
from dependencies import get_current_user, get_current_admin
from models import Computer, Laboratory, User
from schemas import ComputerCreate, ComputerUpdate, ComputerResponse

router = APIRouter(
    prefix="/computers",
    tags=["Computers"],
)


@router.post(
    "/",
    response_model=ComputerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastrar computador",
    description="Permite que o administrador cadastre um computador em um laboratório (RF19)"
)
async def create_computer(
    computer: ComputerCreate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_admin)]
):
    """Cadastra um novo computador em um laboratório."""
    # Verifica se o laboratório existe
    laboratory = session.get(Laboratory, computer.laboratory_id)
    if not laboratory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Laboratório não encontrado"
        )
    
    # Verifica se já existe computador com esse nome no laboratório
    statement = select(Computer).where(
        Computer.name == computer.name,
        Computer.laboratory_id == computer.laboratory_id
    )
    existing = session.exec(statement).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Computador '{computer.name}' já existe neste laboratório"
        )
    
    db_computer = Computer(
        name=computer.name,
        laboratory_id=computer.laboratory_id,
        specifications=computer.specifications
    )
    
    session.add(db_computer)
    session.commit()
    session.refresh(db_computer)
    
    return db_computer


@router.get(
    "/",
    response_model=list[ComputerResponse],
    summary="Listar computadores",
    description="Lista todos os computadores cadastrados"
)
async def list_computers(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
    laboratory_id: int | None = None,
    include_inactive: bool = False
):
    """Lista computadores, opcionalmente filtrados por laboratório."""
    statement = select(Computer)
    
    if laboratory_id is not None:
        statement = statement.where(Computer.laboratory_id == laboratory_id)
    
    if not include_inactive:
        statement = statement.where(Computer.is_active == True)
    
    computers = session.exec(statement).all()
    return computers


@router.get(
    "/{computer_id}",
    response_model=ComputerResponse,
    summary="Obter computador",
    description="Obtém detalhes de um computador específico"
)
async def get_computer(
    computer_id: int,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Obtém um computador pelo ID."""
    computer = session.get(Computer, computer_id)
    
    if not computer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Computador não encontrado"
        )
    
    return computer


@router.patch(
    "/{computer_id}",
    response_model=ComputerResponse,
    summary="Editar computador",
    description="Permite que o administrador edite dados de um computador (RF21)"
)
async def update_computer(
    computer_id: int,
    computer_update: ComputerUpdate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_admin)]
):
    """Atualiza dados de um computador."""
    db_computer = session.get(Computer, computer_id)
    
    if not db_computer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Computador não encontrado"
        )
    
    # Atualiza apenas os campos fornecidos
    update_data = computer_update.model_dump(exclude_unset=True)
    
    # Se mudou o nome, verifica se já existe outro com esse nome no lab
    if "name" in update_data and update_data["name"] != db_computer.name:
        statement = select(Computer).where(
            Computer.name == update_data["name"],
            Computer.laboratory_id == db_computer.laboratory_id,
            Computer.id != computer_id
        )
        existing = session.exec(statement).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Computador '{update_data['name']}' já existe neste laboratório"
            )
    
    for key, value in update_data.items():
        setattr(db_computer, key, value)
    
    db_computer.updated_at = datetime.now(timezone.utc)
    
    session.add(db_computer)
    session.commit()
    session.refresh(db_computer)
    
    return db_computer


@router.delete(
    "/{computer_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Deletar computador",
    description="Permite que o administrador delete um computador (RF20)"
)
async def delete_computer(
    computer_id: int,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_admin)]
):
    """Deleta um computador do sistema."""
    db_computer = session.get(Computer, computer_id)
    
    if not db_computer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Computador não encontrado"
        )
    
    session.delete(db_computer)
    session.commit()
    
    return None
