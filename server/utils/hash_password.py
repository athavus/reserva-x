import bcrypt


def hash_password(password: str) -> str:
    """
    Gera o hash de uma senha usando bcrypt.
    
    Args:
        password: Senha em texto plano
        
    Returns:
        Hash da senha
    """
    # bcrypt.hashpw espera bytes, então codificamos a senha
    password_bytes = password.encode('utf-8')
    # Gera o salt e o hash
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt)
    # Retorna como string
    return hashed_password.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica se uma senha em texto plano corresponde ao hash armazenado.
    
    Args:
        plain_password: Senha em texto plano fornecida pelo usuário
        hashed_password: Hash da senha armazenado no banco
        
    Returns:
        True se a senha corresponde, False caso contrário
    """
    try:
        # bcrypt.checkpw espera bytes para ambos os argumentos
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False
