from fastapi import APIRouter, HTTPException, status
from typing import List
from bson import ObjectId
from database import get_database
from models import EquipamentoCreate, EquipamentoResponse

router = APIRouter(prefix="/api/equipamentos", tags=["equipamentos"])

@router.post("/", response_model=EquipamentoResponse, status_code=status.HTTP_201_CREATED)
async def create_equipamento(eq: EquipamentoCreate):
    db = get_database()
    
    if not ObjectId.is_valid(eq.edificio_id):
        raise HTTPException(status_code=400, detail="ID de edifício inválido")
        
    edificio = await db.edificios.find_one({"_id": ObjectId(eq.edificio_id)})
    if not edificio:
        raise HTTPException(status_code=404, detail="Edifício não encontrado")

    novo_eq = eq.model_dump()
    result = await db.equipamentos.insert_one(novo_eq)
    
    return EquipamentoResponse(
        id=str(result.inserted_id),
        nome=eq.nome,
        edificio_nome=edificio["nome"],
        edificio_id=eq.edificio_id,
        tipo_id=eq.tipo_id,
        tipo_nome=eq.tipo_nome,
        prox_manut=eq.prox_manut
    )

@router.get("/", response_model=List[EquipamentoResponse])
async def list_equipamentos():
    db = get_database()
    equipamentos = []
    cursor = db.equipamentos.find({})
    async for document in cursor:
        edificio = await db.edificios.find_one({"_id": ObjectId(document["edificio_id"])}) if ObjectId.is_valid(document.get("edificio_id", "")) else None
        edificio_nome = edificio["nome"] if edificio else "Desconhecido"
        
        equipamentos.append(EquipamentoResponse(
            id=str(document["_id"]),
            nome=document["nome"],
            edificio_nome=edificio_nome,
            edificio_id=document.get("edificio_id", ""),
            tipo_id=document.get("tipo_id", ""),
            tipo_nome=document.get("tipo_nome", ""),
            prox_manut=document.get("prox_manut", "")
        ))
    return equipamentos

@router.delete("/{eq_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_equipamento(eq_id: str):
    if not ObjectId.is_valid(eq_id):
        raise HTTPException(status_code=400, detail="ID inválido")
        
    db = get_database()
    result = await db.equipamentos.delete_one({"_id": ObjectId(eq_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")
    
    return None
