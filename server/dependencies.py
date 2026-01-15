"""
Dependências de autenticação para proteger rotas.
"""
from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlmodel import Session, select
from database import get_session
from models import User, Role
from schemas import TokenData
from utils.jwt import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: Annotated[Session, Depends(get_session)]
) -> User:
    """
    Extrai e valida o usuário atual a partir do token JWT.
    
    Args:
        token: Token JWT extraído do header Authorization
        session: Sessão do banco de dados
        
    Returns:
        User: Usuário autenticado
        
    Raises:
        HTTPException: Se o token for inválido ou o usuário não existir
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    statement = select(User).where(User.email == token_data.email)
    user = session.exec(statement).first()
    
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo"
        )
    
    return user


async def get_current_admin(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    """
    Verifica se o usuário atual é um administrador.
    
    Args:
        current_user: Usuário autenticado
        
    Returns:
        User: Usuário administrador
        
    Raises:
        HTTPException: Se o usuário não for administrador
    """
    if current_user.role != Role.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores podem realizar esta ação."
        )
    return current_user


async def get_current_professor_or_admin(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    """
    Verifica se o usuário atual é um professor ou administrador.
    
    Args:
        current_user: Usuário autenticado
        
    Returns:
        User: Usuário professor ou admin
        
    Raises:
        HTTPException: Se o usuário não for professor nem admin
    """
    if current_user.role not in [Role.professor, Role.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas professores e administradores podem realizar esta ação."
        )
    return current_user
