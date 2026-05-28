from fastapi import APIRouter, HTTPException
from database import get_database
from models import EmpresaUpdate, EmpresaResponse
from bson.objectid import ObjectId

router = APIRouter(prefix="/api/empresa", tags=["empresa"])

@router.get("/", response_model=EmpresaResponse)
async def get_empresa():
    db = get_database()
    empresa = await db.empresa.find_one({})
    if not empresa:
        # Create default empty empresa
        empresa = {
            "nome": "",
            "nif": "",
            "morada": "",
            "email": "",
            "telefone": "",
            "iban": "",
            "logo_url": ""
        }
        result = await db.empresa.insert_one(empresa)
        empresa["_id"] = result.inserted_id
        
    return EmpresaResponse(
        id=str(empresa["_id"]),
        nome=empresa.get("nome", ""),
        nif=empresa.get("nif", ""),
        morada=empresa.get("morada", ""),
        email=empresa.get("email", ""),
        telefone=empresa.get("telefone", ""),
        iban=empresa.get("iban", ""),
        logo_url=empresa.get("logo_url", "")
    )

@router.put("/", response_model=EmpresaResponse)
async def update_empresa(empresa_data: EmpresaUpdate):
    db = get_database()
    
    empresa = await db.empresa.find_one({})
    
    if not empresa:
        result = await db.empresa.insert_one(empresa_data.model_dump())
        empresa_id = str(result.inserted_id)
    else:
        empresa_id = str(empresa["_id"])
        await db.empresa.update_one(
            {"_id": empresa["_id"]},
            {"$set": empresa_data.model_dump()}
        )
        
    return EmpresaResponse(id=empresa_id, **empresa_data.model_dump())
