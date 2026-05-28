from fastapi import APIRouter, HTTPException, status
from typing import List
from bson import ObjectId
from database import get_database
from models import OrdemCreate, OrdemResponse

router = APIRouter(prefix="/api/ordens", tags=["ordens"])

@router.post("/", response_model=OrdemResponse, status_code=status.HTTP_201_CREATED)
async def create_ordem(ordem: OrdemCreate):
    db = get_database()
    
    if not ObjectId.is_valid(ordem.edificio_id) or not ObjectId.is_valid(ordem.equipamento_id):
        raise HTTPException(status_code=400, detail="ID inválido")
        
    edificio = await db.edificios.find_one({"_id": ObjectId(ordem.edificio_id)})
    equipamento = await db.equipamentos.find_one({"_id": ObjectId(ordem.equipamento_id)})
    
    if not edificio or not equipamento:
        raise HTTPException(status_code=404, detail="Edifício ou Equipamento não encontrado")

    novo_doc = ordem.model_dump()
    result = await db.ordens.insert_one(novo_doc)
    
    return OrdemResponse(
        id=str(result.inserted_id),
        titulo=ordem.titulo,
        edificio_id=ordem.edificio_id,
        edificio_nome=edificio["nome"],
        equipamento_id=ordem.equipamento_id,
        equipamento_nome=equipamento["nome"],
        data=ordem.data,
        status=ordem.status,
        tecnico=ordem.tecnico,
        checklist=ordem.checklist
    )

@router.get("/", response_model=List[OrdemResponse])
async def list_ordens():
    db = get_database()
    ordens = []
    cursor = db.ordens.find({}).sort("data", -1)
    async for doc in cursor:
        edificio = await db.edificios.find_one({"_id": ObjectId(doc["edificio_id"])}) if ObjectId.is_valid(doc.get("edificio_id")) else None
        equipamento = await db.equipamentos.find_one({"_id": ObjectId(doc["equipamento_id"])}) if ObjectId.is_valid(doc.get("equipamento_id")) else None
        
        ordens.append(OrdemResponse(
            id=str(doc["_id"]),
            titulo=doc.get("titulo", ""),
            edificio_id=doc.get("edificio_id", ""),
            edificio_nome=edificio["nome"] if edificio else "Desconhecido",
            equipamento_id=doc.get("equipamento_id", ""),
            equipamento_nome=equipamento["nome"] if equipamento else "Desconhecido",
            data=doc.get("data", ""),
            status=doc.get("status", "Planejada"),
            tecnico=doc.get("tecnico", ""),
            checklist=doc.get("checklist", [])
        ))
    return ordens

@router.put("/{ordem_id}/status", response_model=OrdemResponse)
async def update_status(ordem_id: str, status: str):
    if not ObjectId.is_valid(ordem_id):
        raise HTTPException(status_code=400, detail="ID inválido")
        
    db = get_database()
    await db.ordens.update_one({"_id": ObjectId(ordem_id)}, {"$set": {"status": status}})
    doc = await db.ordens.find_one({"_id": ObjectId(ordem_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Ordem não encontrada")
        
    # Return basic info to save a query, since frontend updates state locally anyway
    return OrdemResponse(
        id=str(doc["_id"]),
        titulo=doc.get("titulo", ""),
        edificio_id=doc.get("edificio_id", ""),
        edificio_nome="", # Simplified for status update
        equipamento_id=doc.get("equipamento_id", ""),
        equipamento_nome="",
        data=doc.get("data", ""),
        status=doc.get("status", "Planejada"),
        tecnico=doc.get("tecnico", ""),
        checklist=doc.get("checklist", [])
    )

@router.put("/{ordem_id}/checklist/{index}", status_code=status.HTTP_200_OK)
async def update_checklist_item(ordem_id: str, index: int, concluida: bool):
    if not ObjectId.is_valid(ordem_id):
        raise HTTPException(status_code=400, detail="ID inválido")
        
    db = get_database()
    await db.ordens.update_one(
        {"_id": ObjectId(ordem_id)}, 
        {"$set": {f"checklist.{index}.concluida": concluida}}
    )
    return {"status": "ok"}

@router.delete("/{ordem_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ordem(ordem_id: str):
    if not ObjectId.is_valid(ordem_id):
        raise HTTPException(status_code=400, detail="ID inválido")
        
    db = get_database()
    result = await db.ordens.delete_one({"_id": ObjectId(ordem_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ordem não encontrada")
    return None
