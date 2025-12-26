"""
Rotas de autenticação: login, registro, etc.
"""
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database import get_session
from models import User
from schemas import LoginRequest, Token, UserCreate, UserResponse
from utils.hash_password import hash_password, verify_password
from utils.jwt import create_access_token
from dependencies import get_current_active_user

router = APIRouter(
    prefix="/auth",
    tags=["Autenticação"],
)


@router.post(
    "/register",
    summary="Registrar novo usuário",
    description="Cria um novo usuário no sistema com senha hasheada",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    user_data: UserCreate,
    session: Session = Depends(get_session)
):
    """
    Registra um novo usuário no sistema.
    
    Args:
        user_data: Dados do usuário a ser criado
        session: Sessão do banco de dados
        
    Returns:
        Dados do usuário criado
        
    Raises:
        HTTPException: Se o e-mail já estiver cadastrado
    """
    # Verifica se o e-mail já está cadastrado
    statement = select(User).where(User.email == user_data.email)
    existing_user = session.exec(statement).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="E-mail já cadastrado"
        )
    
    # Cria o usuário com senha hasheada
    db_user = User(
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        role=user_data.role,
        project_name=user_data.project_name,
        is_active=True
    )
    
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    
    return db_user


@router.post(
    "/login",
    summary="Fazer login",
    description="Autentica um usuário e retorna um token JWT",
    response_model=Token,
)
def login(
    login_data: LoginRequest,
    session: Session = Depends(get_session)
):
    """
    Autentica um usuário e retorna um token de acesso.
    
    Args:
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
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo"
        )
    
    # Cria o token de acesso
    access_token = create_access_token(data={"sub": user.email})
    
    return Token(access_token=access_token, token_type="bearer")


@router.get(
    "/me",
    summary="Obter usuário atual",
    description="Retorna os dados do usuário autenticado",
    response_model=UserResponse,
)
def get_me(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    """
    Retorna os dados do usuário autenticado.
    
    Args:
        current_user: Usuário atual obtido do token
        
    Returns:
        Dados do usuário
    """
    return current_user
