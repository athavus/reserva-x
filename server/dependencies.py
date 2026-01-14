"""
Dependências de autenticação para proteger rotas.
"""
from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from database import get_session
from models import User
from utils.jwt import decode_access_token

# Schema de segurança Bearer
security = HTTPBearer()


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    session: Session = Depends(get_session)
) -> User:
    """
    Dependência que extrai e valida o usuário atual a partir do token JWT.
    
    Args:
        credentials: Credenciais HTTP Bearer
        session: Sessão do banco de dados
        
    Returns:
        Usuário autenticado
        
    Raises:
        HTTPException: Se o token for inválido ou o usuário não existir
    """
    # Se o middleware do FastAPI security já não levantou erro, validamos o token
    token = credentials.credentials
    
    # Decodifica o token
    email = decode_access_token(token)
    
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não foi possível validar as credenciais",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Busca o usuário no banco
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo"
        )
    
    return user


def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    """
    Dependência que garante que o usuário está ativo.
    
    Args:
        current_user: Usuário atual obtido do token
        
    Returns:
        Usuário ativo
        
    Raises:
        HTTPException: Se o usuário estiver inativo
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário inativo"
        )
    return current_user


def require_professor(
    current_user: Annotated[User, Depends(get_current_active_user)]
) -> User:
    """
    Dependência que garante que o usuário é um professor.
    
    Args:
        current_user: Usuário atual
        
    Returns:
        Usuário professor
        
    Raises:
        HTTPException: Se o usuário não for professor
    """
    if current_user.role != "professor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas professores podem acessar este recurso"
        )
    return current_user


def require_admin(
    current_user: Annotated[User, Depends(get_current_active_user)]
) -> User:
    """
    Dependência que garante que o usuário é um administrador.
    
    Args:
        current_user: Usuário atual
        
    Returns:
        Usuário administrador
        
    Raises:
        HTTPException: Se o usuário não for administrador
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem acessar este recurso"
        )
    return current_user
