"""
Rotas de autenticação: login, registro, etc.
"""

from typing import Annotated, List

from database import get_session
from dependencies import get_current_active_user, require_admin
from fastapi import APIRouter, Depends, HTTPException, status
from models import RegistrationRequest, Role, User
from schemas import (
    LoginRequest,
    RegistrationRequestApprove,
    RegistrationRequestCreate,
    RegistrationRequestResponse,
    Token,
    UserResponse,
)
from sqlmodel import Session, select
from utils.hash_password import hash_password, verify_password
from utils.jwt import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Autenticação"],
)


@router.post(
    "/request-registration",
    summary="Solicitar cadastro (RF05)",
    description="Permite que um usuário não autenticado solicite ao administrador que faça o cadastro",
    response_model=RegistrationRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
def request_registration(
    request_data: RegistrationRequestCreate, session: Session = Depends(get_session)
):
    """
    Cria uma solicitação de cadastro para ser analisada por um administrador.

    Params:
        request_data: Dados da solicitação de cadastro
        session: Sessão do banco de dados

    Returns:
        Dados da solicitação criada

    Raises:
        HTTPException: Se o e-mail já estiver cadastrado ou já houver uma solicitação pendente
    """
    # Verifica se o e-mail já está cadastrado como usuário
    statement = select(User).where(User.email == request_data.email)
    existing_user = session.exec(statement).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="E-mail já cadastrado no sistema",
        )

    # Verifica se já existe uma solicitação pendente para este e-mail
    statement = select(RegistrationRequest).where(
        RegistrationRequest.email == request_data.email,
        RegistrationRequest.is_processed == False,
    )
    existing_request = session.exec(statement).first()

    if existing_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe uma solicitação pendente para este e-mail",
        )

    # Cria a solicitação
    registration_request = RegistrationRequest(
        email=request_data.email,
        password=request_data.password,  # Será hasheada quando aprovada
        project_name=request_data.project_name,
        is_processed=False,
    )

    session.add(registration_request)
    session.commit()
    session.refresh(registration_request)

    return registration_request


@router.post(
    "/login",
    summary="Fazer login",
    description="Autentica um usuário e retorna um token JWT",
    response_model=Token,
)
def login(login_data: LoginRequest, session: Session = Depends(get_session)):
    """
    Autentica um usuário e retorna um token de acesso.

    Params:
        login_data: Credenciais de login
        session: Sessão do banco de dados

    Returns:
        Token de acesso JWT

    Raises:
        HTTPException: Se as credenciais forem inválidas
    """
    # Busca o usuário pelo e-mail
    statement = select(User).where(User.email == login_data.email)
    user = session.exec(statement).first()

    # Verifica se o usuário existe e a senha está correta
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verifica se o usuário está ativo
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Usuário inativo"
        )

    # Cria o token de acesso
    access_token = create_access_token(data={"sub": user.email})

    return Token(access_token=access_token, token_type="bearer")


@router.get(
    "/registration-requests",
    summary="Listar solicitações de cadastro (RF07)",
    description="Lista todas as solicitações de cadastro pendentes (apenas administradores)",
    response_model=List[RegistrationRequestResponse],
)
def list_registration_requests(
    session: Session = Depends(get_session),
    current_user: Annotated[User, Depends(require_admin)] = None,
):
    """
    Lista todas as solicitações de cadastro pendentes.
    Apenas administradores podem acessar esta rota.

    Params:
        session: Sessão do banco de dados
        current_user: Usuário autenticado (deve ser administrador)

    Returns:
        Lista de solicitações pendentes
    """
    statement = select(RegistrationRequest).where(
        RegistrationRequest.is_processed == False
    )
    requests = session.exec(statement).all()
    return requests


@router.post(
    "/registration-requests/{request_id}/approve",
    summary="Aprovar solicitação de cadastro (RF07)",
    description="Aprova uma solicitação de cadastro e cria o usuário (apenas administradores)",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def approve_registration_request(
    request_id: int,
    approval_data: RegistrationRequestApprove,
    session: Session = Depends(get_session),
    current_user: Annotated[User, Depends(require_admin)] = None,
):
    """
    Aprova uma solicitação de cadastro e cria o usuário no sistema.
    Apenas administradores podem executar esta ação.

    Params:
        request_id: ID da solicitação a ser aprovada
        approval_data: Dados de aprovação (role do usuário)
        session: Sessão do banco de dados
        current_user: Usuário autenticado (deve ser administrador)

    Returns:
        Dados do usuário criado

    Raises:
        HTTPException: Se a solicitação não for encontrada, já foi processada ou o role for inválido
    """
    # Busca a solicitação
    registration_request = session.get(RegistrationRequest, request_id)

    if not registration_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Solicitação não encontrada"
        )

    if registration_request.is_processed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta solicitação já foi processada",
        )

    # Valida o role
    try:
        role = Role(approval_data.role)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role inválido. Deve ser 'aluno' ou 'professor'",
        )

    # Verifica se o e-mail já está cadastrado (pode ter sido criado entre a solicitação e a aprovação)
    statement = select(User).where(User.email == registration_request.email)
    existing_user = session.exec(statement).first()

    if existing_user:
        # Marca a solicitação como processada mesmo que o usuário já exista
        registration_request.is_processed = True
        session.add(registration_request)
        session.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="E-mail já cadastrado no sistema",
        )

    # Cria o usuário com senha hasheada
    db_user = User(
        email=registration_request.email,
        hashed_password=hash_password(registration_request.password),
        role=role,
        project_name=registration_request.project_name,
        is_active=True,
    )

    session.add(db_user)

    # Marca a solicitação como processada
    registration_request.is_processed = True
    session.add(registration_request)

    session.commit()
    session.refresh(db_user)

    return db_user


@router.delete(
    "/registration-requests/{request_id}/reject",
    summary="Rejeitar solicitação de cadastro (RF07)",
    description="Rejeita uma solicitação de cadastro (apenas administradores)",
    status_code=status.HTTP_204_NO_CONTENT,
)
def reject_registration_request(
    request_id: int,
    session: Session = Depends(get_session),
    current_user: Annotated[User, Depends(require_admin)] = None,
):
    """
    Rejeita uma solicitação de cadastro marcando-a como processada.
    Apenas administradores podem executar esta ação.

    Params:
        request_id: ID da solicitação a ser rejeitada
        session: Sessão do banco de dados
        current_user: Usuário autenticado (deve ser administrador)

    Raises:
        HTTPException: Se a solicitação não for encontrada ou já foi processada
    """
    # Busca a solicitação
    registration_request = session.get(RegistrationRequest, request_id)

    if not registration_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Solicitação não encontrada"
        )

    if registration_request.is_processed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta solicitação já foi processada",
        )

    # Marca a solicitação como processada (rejeitada)
    registration_request.is_processed = True
    session.add(registration_request)
    session.commit()


@router.get(
    "/me",
    summary="Obter usuário atual",
    description="Retorna os dados do usuário autenticado",
    response_model=UserResponse,
)
def get_me(current_user: Annotated[User, Depends(get_current_active_user)]):
    """
    Retorna os dados do usuário autenticado.

    Params:
        current_user: Usuário atual obtido do token

    Returns:
        Dados do usuário
    """
    return current_user
