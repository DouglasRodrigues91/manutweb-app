from fastapi import APIRouter, HTTPException, status
from typing import List
from bson import ObjectId
from database import get_database
from models import OrdemCreate, OrdemResponse

router = APIRouter(prefix="/api/ordens", tags=["ordens"])

@router.post("/", response_model=OrdemResponse, status_code=status.HTTP_201_CREATED)
async def create_ordem(ordem: OrdemCreate):
    db = get_database()
    
    if not ObjectId.is_valid(ordem.cliente_id) or not ObjectId.is_valid(ordem.equipamento_id):
        raise HTTPException(status_code=400, detail="ID inválido")
        
    cliente = await db.clientes.find_one({"_id": ObjectId(ordem.cliente_id)})
    equipamento = await db.equipamentos.find_one({"_id": ObjectId(ordem.equipamento_id)})
    
    if not cliente or not equipamento:
        raise HTTPException(status_code=404, detail="Cliente ou Equipamento não encontrado")

    novo_doc = ordem.model_dump()
    result = await db.ordens.insert_one(novo_doc)
    
    return OrdemResponse(
        id=str(result.inserted_id),
        titulo=ordem.titulo,
        cliente_id=ordem.cliente_id,
        cliente_nome=cliente["nome"],
        equipamento_id=ordem.equipamento_id,
        equipamento_nome=equipamento["nome"],
        data=ordem.data,
        status=ordem.status,
        tecnico=ordem.tecnico,
        checklist=ordem.checklist,
        observacoes_gerais=ordem.observacoes_gerais
    )

@router.get("/", response_model=List[OrdemResponse])
async def list_ordens():
    db = get_database()
    ordens = []
    cursor = db.ordens.find({}).sort("data", -1)
    async for doc in cursor:
        cliente = await db.clientes.find_one({"_id": ObjectId(doc["cliente_id"])}) if ObjectId.is_valid(doc.get("cliente_id")) else None
        equipamento = await db.equipamentos.find_one({"_id": ObjectId(doc["equipamento_id"])}) if ObjectId.is_valid(doc.get("equipamento_id")) else None
        
        ordens.append(OrdemResponse(
            id=str(doc["_id"]),
            titulo=doc.get("titulo", ""),
            cliente_id=doc.get("cliente_id", ""),
            cliente_nome=cliente["nome"] if cliente else "Desconhecido",
            equipamento_id=doc.get("equipamento_id", ""),
            equipamento_nome=equipamento["nome"] if equipamento else "Desconhecido",
            data=doc.get("data", ""),
            status=doc.get("status", "Planejada"),
            tecnico=doc.get("tecnico", ""),
            checklist=doc.get("checklist", []),
            observacoes_gerais=doc.get("observacoes_gerais", "")
        ))
    return ordens

@router.put("/{ordem_id}", response_model=OrdemResponse)
async def update_ordem(ordem_id: str, ordem: OrdemCreate):
    if not ObjectId.is_valid(ordem_id):
        raise HTTPException(status_code=400, detail="ID inválido")
        
    db = get_database()
    
    cliente = await db.clientes.find_one({"_id": ObjectId(ordem.cliente_id)})
    equipamento = await db.equipamentos.find_one({"_id": ObjectId(ordem.equipamento_id)})
    
    if not cliente or not equipamento:
        raise HTTPException(status_code=404, detail="Cliente ou Equipamento não encontrado")

    await db.ordens.update_one(
        {"_id": ObjectId(ordem_id)},
        {"$set": ordem.model_dump()}
    )
    
    return OrdemResponse(
        id=ordem_id,
        titulo=ordem.titulo,
        cliente_id=ordem.cliente_id,
        cliente_nome=cliente["nome"],
        equipamento_id=ordem.equipamento_id,
        equipamento_nome=equipamento["nome"],
        data=ordem.data,
        status=ordem.status,
        tecnico=ordem.tecnico,
        checklist=ordem.checklist,
        observacoes_gerais=ordem.observacoes_gerais
    )

@router.put("/{ordem_id}/status", response_model=OrdemResponse)
async def update_status(ordem_id: str, status: str):
    if not ObjectId.is_valid(ordem_id):
        raise HTTPException(status_code=400, detail="ID inválido")
        
    db = get_database()
    await db.ordens.update_one({"_id": ObjectId(ordem_id)}, {"$set": {"status": status}})
    doc = await db.ordens.find_one({"_id": ObjectId(ordem_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Ordem não encontrada")
        
    return OrdemResponse(
        id=str(doc["_id"]),
        titulo=doc.get("titulo", ""),
        cliente_id=doc.get("cliente_id", ""),
        cliente_nome="", 
        equipamento_id=doc.get("equipamento_id", ""),
        equipamento_nome="",
        data=doc.get("data", ""),
        status=doc.get("status", "Planejada"),
        tecnico=doc.get("tecnico", ""),
        checklist=doc.get("checklist", []),
        observacoes_gerais=doc.get("observacoes_gerais", "")
    )

@router.put("/{ordem_id}/checklist/{index}", status_code=status.HTTP_200_OK)
async def update_checklist_item(ordem_id: str, index: int, item: dict):
    if not ObjectId.is_valid(ordem_id):
        raise HTTPException(status_code=400, detail="ID inválido")
        
    db = get_database()
    
    update_fields = {}
    for key, val in item.items():
        update_fields[f"checklist.{index}.{key}"] = val
        
    await db.ordens.update_one(
        {"_id": ObjectId(ordem_id)}, 
        {"$set": update_fields}
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
