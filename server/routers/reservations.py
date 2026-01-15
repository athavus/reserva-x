"""
Rotas para gerenciamento de reservas de laboratórios e computadores.
"""
from datetime import datetime, timezone, timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, and_, or_
from database import get_session
from dependencies import get_current_user, get_current_admin, get_current_professor_or_admin
from models import (
    Reservation, ReservationStatus, ReservationType, 
    User, Laboratory, Computer, UserLaboratoryAccess, Role
)
from schemas import (
    ReservationCreate, ReservationUpdate, ReservationResponse,
    ReservationApprove, ReservationReject
)

router = APIRouter(
    prefix="/reservations",
    tags=["Reservations"],
)


def check_user_has_access(user: User, laboratory_id: int, session: Session) -> bool:
    """Verifica se um usuário tem acesso a um laboratório."""
    # Admin tem acesso a tudo
    if user.role == Role.admin:
        return True
    
    # Verifica se tem permissão explícita
    statement = select(UserLaboratoryAccess).where(
        UserLaboratoryAccess.user_id == user.id,
        UserLaboratoryAccess.laboratory_id == laboratory_id
    )
    access = session.exec(statement).first()
    return access is not None


def check_time_conflicts(
    laboratory_id: int,
    start_time: datetime,
    end_time: datetime,
    session: Session,
    computer_id: int | None = None,
    exclude_reservation_id: int | None = None
) -> Reservation | None:
    """
    Verifica se há conflitos de horário para uma reserva.
    Retorna a primeira reserva conflitante encontrada ou None.
    """
    # Query base: reservas aprovadas no mesmo laboratório
    statement = select(Reservation).where(
        Reservation.laboratory_id == laboratory_id,
        Reservation.status == ReservationStatus.approved,
        # Conflito de horário: overlap de intervalos
        or_(
            and_(Reservation.start_time <= start_time, Reservation.end_time > start_time),
            and_(Reservation.start_time < end_time, Reservation.end_time >= end_time),
            and_(Reservation.start_time >= start_time, Reservation.end_time <= end_time)
        )
    )
    
    # Exclui a própria reserva se for atualização
    if exclude_reservation_id:
        statement = statement.where(Reservation.id != exclude_reservation_id)
    
    # Se for reserva de computador, só conflita com:
    # 1. Reservas de sala completa
    # 2. Reservas do mesmo computador
    if computer_id:
        statement = statement.where(
            or_(
                Reservation.reservation_type == ReservationType.room,
                Reservation.computer_id == computer_id
            )
        )
    else:
        # Se for reserva de sala completa, conflita com qualquer reserva
        pass
    
    conflict = session.exec(statement).first()
    return conflict


def check_multiple_reservations(user_id: int, session: Session) -> bool:
    """
    Verifica se o usuário já tem uma reserva pendente (RNF04).
    Retorna True se já existe uma reserva pendente.
    """
    statement = select(Reservation).where(
        Reservation.user_id == user_id,
        Reservation.status == ReservationStatus.pending
    )
    existing = session.exec(statement).first()
    return existing is not None


@router.post(
    "/",
    response_model=ReservationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Solicitar reserva",
    description="Permite que professor ou aluno solicite reserva de espaço ou computador (RF01, RF17)"
)
async def create_reservation(
    reservation: ReservationCreate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Cria uma nova solicitação de reserva."""
    # RNF04: Verifica se usuário já tem uma reserva pendente
    if check_multiple_reservations(current_user.id, session):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você já possui uma reserva pendente. Aguarde a aprovação antes de criar outra."
        )
    
    # Verifica se o laboratório existe
    laboratory = session.get(Laboratory, reservation.laboratory_id)
    if not laboratory or not laboratory.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Laboratório não encontrado ou inativo"
        )
    
    # Verifica se o usuário tem acesso ao laboratório
    if not check_user_has_access(current_user, reservation.laboratory_id, session):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para reservar este laboratório"
        )
    
    # Validações específicas por tipo de reserva
    if reservation.reservation_type == "computer":
        # RF17: Reserva de computador específico
        if not reservation.computer_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Para reserva de computador, o computer_id é obrigatório"
            )
        
        computer = session.get(Computer, reservation.computer_id)
        if not computer or not computer.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Computador não encontrado ou inativo"
            )
        
        if computer.laboratory_id != reservation.laboratory_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Computador não pertence ao laboratório especificado"
            )
    
    elif reservation.reservation_type == "room":
        # RF01: Reserva de sala completa (apenas professor)
        if current_user.role == Role.aluno:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas professores podem reservar salas completas"
            )
        
        if reservation.computer_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Para reserva de sala completa, não especifique computer_id"
            )
    
    # Validações de tempo
    now = datetime.now(timezone.utc)
    
    # Garantir que start_time e end_time sejam aware para comparação
    if reservation.start_time.tzinfo is None:
        reservation.start_time = reservation.start_time.replace(tzinfo=timezone.utc)
    
    # Permite uma pequena margem (5 min) para evitar erros por diferença de relógio
    if reservation.start_time < (now - timedelta(minutes=5)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível criar reserva no passado"
        )
    
    if reservation.end_time <= reservation.start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Horário de término deve ser posterior ao início"
        )
    
    # Verifica conflitos de horário
    conflict = check_time_conflicts(
        reservation.laboratory_id,
        reservation.start_time,
        reservation.end_time,
        session,
        reservation.computer_id
    )
    
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Conflito de horário com reserva existente (ID: {conflict.id})"
        )
    
    # Cria a reserva
    db_reservation = Reservation(
        user_id=current_user.id,
        laboratory_id=reservation.laboratory_id,
        computer_id=reservation.computer_id,
        reservation_type=ReservationType(reservation.reservation_type),
        start_time=reservation.start_time,
        end_time=reservation.end_time,
        title=reservation.title,
        description=reservation.description,
        is_confidential=reservation.is_confidential
    )
    
    session.add(db_reservation)
    session.commit()
    session.refresh(db_reservation)
    
    return db_reservation


@router.get(
    "/",
    response_model=list[ReservationResponse],
    summary="Listar reservas",
    description="Lista reservas com filtros opcionais (RF03)"
)
async def list_reservations(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
    laboratory_id: int | None = Query(None, description="Filtrar por laboratório"),
    status: str | None = Query(None, description="Filtrar por status (pending, approved, rejected)"),
    start_date: datetime | None = Query(None, description="Data início do período"),
    end_date: datetime | None = Query(None, description="Data fim do período"),
    my_reservations: bool = Query(False, description="Apenas minhas reservas")
):
    """Lista reservas com filtros opcionais."""
    statement = select(Reservation)
    
    # Filtro por laboratório
    if laboratory_id:
        statement = statement.where(Reservation.laboratory_id == laboratory_id)
    
    # Filtro por status
    if status:
        try:
            status_enum = ReservationStatus(status)
            statement = statement.where(Reservation.status == status_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status inválido. Use: pending, approved, rejected"
            )
    
    # Filtro por período
    if start_date:
        statement = statement.where(Reservation.start_time >= start_date)
    if end_date:
        statement = statement.where(Reservation.end_time <= end_date)
    
    # Filtro: apenas minhas reservas
    if my_reservations:
        statement = statement.where(Reservation.user_id == current_user.id)
    
    # Ordena por data de início
    statement = statement.order_by(Reservation.start_time)
    
    reservations = session.exec(statement).all()
    
    # Filtra informações confidenciais para não-proprietários
    result = []
    for reservation in reservations:
        # Se a reserva é confidencial e o usuário não é o dono nem admin
        if reservation.is_confidential:
            if reservation.user_id != current_user.id and current_user.role != Role.admin:
                # Oculta informações sensíveis
                reservation.title = "[Reserva Confidencial]"
                reservation.description = None
        result.append(reservation)
    
    return result


@router.get(
    "/{reservation_id}",
    response_model=ReservationResponse,
    summary="Obter reserva",
    description="Obtém detalhes de uma reserva específica"
)
async def get_reservation(
    reservation_id: int,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Obtém uma reserva pelo ID."""
    reservation = session.get(Reservation, reservation_id)
    
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserva não encontrada"
        )
    
    # Verifica permissão para ver detalhes confidenciais
    if reservation.is_confidential:
        if reservation.user_id != current_user.id and current_user.role != Role.admin:
            reservation.title = "[Reserva Confidencial]"
            reservation.description = None
    
    return reservation


@router.patch(
    "/{reservation_id}",
    response_model=ReservationResponse,
    summary="Editar reserva",
    description="Permite que criador ou admin edite uma reserva (RF02, RF12)"
)
async def update_reservation(
    reservation_id: int,
    reservation_update: ReservationUpdate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Atualiza dados de uma reserva."""
    db_reservation = session.get(Reservation, reservation_id)
    
    if not db_reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserva não encontrada"
        )
    
    # Verifica permissão (criador ou admin)
    if db_reservation.user_id != current_user.id and current_user.role != Role.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para editar esta reserva"
        )
    
    # RNF03: Não pode editar 30 minutos antes do horário
    now = datetime.now(timezone.utc)
    start_time = db_reservation.start_time
    if start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=timezone.utc)
        
    time_until_start = (start_time - now).total_seconds() / 60
    if time_until_start < 30:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível editar reserva com menos de 30 minutos antes do horário"
        )
    
    # Atualiza apenas os campos fornecidos
    update_data = reservation_update.model_dump(exclude_unset=True)
    
    # Se alterou horários, valida e verifica conflitos
    new_start = update_data.get("start_time", db_reservation.start_time)
    new_end = update_data.get("end_time", db_reservation.end_time)
    
    # Garantir que sejam aware para comparação
    if new_start.tzinfo is None:
        new_start = new_start.replace(tzinfo=timezone.utc)
    if new_end.tzinfo is None:
        new_end = new_end.replace(tzinfo=timezone.utc)
        
    if "start_time" in update_data or "end_time" in update_data:
        if new_start < (now - timedelta(minutes=5)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível alterar para horário no passado"
            )
        
        if new_end <= new_start:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Horário de término deve ser posterior ao início"
            )
        
        # Verifica conflitos
        conflict = check_time_conflicts(
            db_reservation.laboratory_id,
            new_start,
            new_end,
            session,
            db_reservation.computer_id,
            exclude_reservation_id=reservation_id
        )
        
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Conflito de horário com reserva existente (ID: {conflict.id})"
            )
    
    for key, value in update_data.items():
        setattr(db_reservation, key, value)
    
    db_reservation.updated_at = datetime.now(timezone.utc)
    
    session.add(db_reservation)
    session.commit()
    session.refresh(db_reservation)
    
    return db_reservation


@router.delete(
    "/{reservation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Cancelar reserva",
    description="Permite que criador remova sua solicitação (RF04)"
)
async def delete_reservation(
    reservation_id: int,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Cancela/remove uma reserva."""
    db_reservation = session.get(Reservation, reservation_id)
    
    if not db_reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserva não encontrada"
        )
    
    # Verifica permissão (apenas criador pode cancelar)
    if db_reservation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas o criador da reserva pode cancelá-la"
        )
    
    # RNF03: Não pode cancelar 30 minutos antes do horário
    now = datetime.now(timezone.utc)
    start_time = db_reservation.start_time
    if start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=timezone.utc)
        
    time_until_start = (start_time - now).total_seconds() / 60
    if time_until_start < 30:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível cancelar reserva com menos de 30 minutos antes do horário"
        )
    
    db_reservation.status = ReservationStatus.cancelled
    db_reservation.updated_at = datetime.now(timezone.utc)
    
    session.add(db_reservation)
    session.commit()
    
    return None


@router.post(
    "/{reservation_id}/approve",
    response_model=ReservationResponse,
    summary="Aprovar reserva",
    description="Permite que administrador aprove uma reserva (RF10)"
)
async def approve_reservation(
    reservation_id: int,
    session: Annotated[Session, Depends(get_session)],
    current_admin: Annotated[User, Depends(get_current_admin)]
):
    """Aprova uma reserva pendente."""
    db_reservation = session.get(Reservation, reservation_id)
    
    if not db_reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserva não encontrada"
        )
    
    if db_reservation.status != ReservationStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Reserva já foi processada (status: {db_reservation.status})"
        )
    
    # Verifica novamente se não há conflitos (pode ter surgido desde a criação)
    conflict = check_time_conflicts(
        db_reservation.laboratory_id,
        db_reservation.start_time,
        db_reservation.end_time,
        session,
        db_reservation.computer_id,
        exclude_reservation_id=reservation_id
    )
    
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Conflito de horário com reserva {conflict.id}. Não é possível aprovar."
        )
    
    db_reservation.status = ReservationStatus.approved
    db_reservation.reviewed_by = current_admin.id
    db_reservation.reviewed_at = datetime.now(timezone.utc)
    db_reservation.updated_at = datetime.now(timezone.utc)
    
    session.add(db_reservation)
    session.commit()
    session.refresh(db_reservation)
    
    return db_reservation


@router.post(
    "/{reservation_id}/reject",
    response_model=ReservationResponse,
    summary="Reprovar reserva",
    description="Permite que administrador reprove uma reserva (RF11)"
)
async def reject_reservation(
    reservation_id: int,
    rejection: ReservationReject,
    session: Annotated[Session, Depends(get_session)],
    current_admin: Annotated[User, Depends(get_current_admin)]
):
    """Reprova uma reserva pendente."""
    db_reservation = session.get(Reservation, reservation_id)
    
    if not db_reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserva não encontrada"
        )
    
    if db_reservation.status != ReservationStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Reserva já foi processada (status: {db_reservation.status})"
        )
    
    db_reservation.status = ReservationStatus.rejected
    db_reservation.reviewed_by = current_admin.id
    db_reservation.reviewed_at = datetime.now(timezone.utc)
    db_reservation.rejection_reason = rejection.rejection_reason
    db_reservation.updated_at = datetime.now(timezone.utc)
    
    session.add(db_reservation)
    session.commit()
    session.refresh(db_reservation)
    
    return db_reservation
