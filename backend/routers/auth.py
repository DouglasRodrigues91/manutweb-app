from fastapi import APIRouter, HTTPException, status
from database import get_database
from models import UserCreate, UserLogin, UserResponse, Token
from auth import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    db = get_database()
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
        
    hashed_password = get_password_hash(user.password)
    
    new_user = {
        "email": user.email,
        "password": hashed_password,
        "nome": user.nome,
        "role": user.role
    }
    
    result = await db.users.insert_one(new_user)
    
    return UserResponse(
        id=str(result.inserted_id),
        email=user.email,
        nome=user.nome,
        role=user.role
    )

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    db = get_database()
    
    db_user = await db.users.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
        
    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
        
    user_response = UserResponse(
        id=str(db_user["_id"]),
        email=db_user["email"],
        nome=db_user["nome"],
        role=db_user.get("role", "Técnico")
    )
        
    access_token = create_access_token(data={"sub": db_user["email"], "role": user_response.role})
    
    return {"access_token": access_token, "token_type": "bearer", "user": user_response}
