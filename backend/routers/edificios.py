from fastapi import APIRouter, HTTPException, status
from typing import List
from bson import ObjectId
from database import get_database
from models import EdificioCreate, EdificioResponse, EdificioUpdate

router = APIRouter(prefix="/api/edificios", tags=["edificios"])

@router.post("/", response_model=EdificioResponse, status_code=status.HTTP_201_CREATED)
async def create_edificio(edificio: EdificioCreate):
    db = get_database()
    
    # Auto incremento simples
    last_edificio = await db.edificios.find_one(sort=[("numero", -1)])
    novo_numero = (last_edificio.get("numero", 0) + 1) if last_edificio else 1

    novo_doc = edificio.model_dump()
    novo_doc["numero"] = novo_numero
    
    result = await db.edificios.insert_one(novo_doc)
    
    response_data = {**novo_doc, "id": str(result.inserted_id), "equipamentos": 0}
    return EdificioResponse(**response_data)

@router.get("/", response_model=List[EdificioResponse])
async def list_edificios():
    db = get_database()
    edificios = []
    cursor = db.edificios.find({}).sort("numero", 1)
    async for doc in cursor:
        count_eq = await db.equipamentos.count_documents({"edificio_id": str(doc["_id"])})
        doc_data = {**doc, "id": str(doc["_id"]), "equipamentos": count_eq}
        
        # Garante que campos antigos que não tinham NIF/email não quebrem
        if "nif" not in doc_data: doc_data["nif"] = ""
        if "morada" not in doc_data: doc_data["morada"] = ""
        if "email" not in doc_data: doc_data["email"] = ""
        if "contato" not in doc_data: doc_data["contato"] = ""
        if "numero" not in doc_data: doc_data["numero"] = 0
            
        edificios.append(EdificioResponse(**doc_data))
    return edificios

@router.put("/{edificio_id}", response_model=EdificioResponse)
async def update_edificio(edificio_id: str, edificio: EdificioUpdate):
    if not ObjectId.is_valid(edificio_id):
        raise HTTPException(status_code=400, detail="ID inválido")
        
    db = get_database()
    update_data = {k: v for k, v in edificio.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="Nenhum dado para atualizar")

    await db.edificios.update_one({"_id": ObjectId(edificio_id)}, {"$set": update_data})
    
    doc = await db.edificios.find_one({"_id": ObjectId(edificio_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Edifício não encontrado")
        
    count_eq = await db.equipamentos.count_documents({"edificio_id": edificio_id})
    doc_data = {**doc, "id": str(doc["_id"]), "equipamentos": count_eq}
    
    return EdificioResponse(**doc_data)

@router.delete("/{edificio_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_edificio(edificio_id: str):
    if not ObjectId.is_valid(edificio_id):
        raise HTTPException(status_code=400, detail="ID inválido")
        
    db = get_database()
    result = await db.edificios.delete_one({"_id": ObjectId(edificio_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Edifício não encontrado")
    
    return None
