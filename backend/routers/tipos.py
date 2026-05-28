from fastapi import APIRouter, HTTPException, status
from typing import List
from bson import ObjectId
from database import get_database
from models import TipoEquipamentoCreate, TipoEquipamentoResponse

router = APIRouter(prefix="/api/tipos", tags=["tipos"])

@router.post("/", response_model=TipoEquipamentoResponse, status_code=status.HTTP_201_CREATED)
async def create_tipo(tipo: TipoEquipamentoCreate):
    db = get_database()
    novo_doc = tipo.model_dump()
    result = await db.tipos.insert_one(novo_doc)
    
    return TipoEquipamentoResponse(
        id=str(result.inserted_id),
        nome=tipo.nome,
        tarefas=tipo.tarefas
    )

@router.get("/", response_model=List[TipoEquipamentoResponse])
async def list_tipos():
    db = get_database()
    tipos = []
    cursor = db.tipos.find({})
    async for doc in cursor:
        tipos.append(TipoEquipamentoResponse(
            id=str(doc["_id"]),
            nome=doc["nome"],
            tarefas=doc.get("tarefas", [])
        ))
    return tipos

@router.put("/{tipo_id}", response_model=TipoEquipamentoResponse)
async def update_tipo(tipo_id: str, tipo: TipoEquipamentoCreate):
    if not ObjectId.is_valid(tipo_id):
        raise HTTPException(status_code=400, detail="ID inválido")
        
    db = get_database()
    update_data = tipo.model_dump()

    await db.tipos.update_one({"_id": ObjectId(tipo_id)}, {"$set": update_data})
    
    doc = await db.tipos.find_one({"_id": ObjectId(tipo_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Tipo não encontrado")
        
    return TipoEquipamentoResponse(
        id=str(doc["_id"]),
        nome=doc["nome"],
        tarefas=doc.get("tarefas", [])
    )

@router.delete("/{tipo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tipo(tipo_id: str):
    if not ObjectId.is_valid(tipo_id):
        raise HTTPException(status_code=400, detail="ID inválido")
        
    db = get_database()
    result = await db.tipos.delete_one({"_id": ObjectId(tipo_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tipo não encontrado")
    
    return None
