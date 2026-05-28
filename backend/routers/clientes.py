from fastapi import APIRouter, HTTPException, status
from typing import List
from bson import ObjectId
from database import get_database
from models import ClienteCreate, ClienteResponse, ClienteUpdate

router = APIRouter(prefix="/api/clientes", tags=["clientes"])

@router.post("/", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED)
async def create_cliente(cliente: ClienteCreate):
    db = get_database()
    novo_cliente = cliente.model_dump()
    result = await db.clientes.insert_one(novo_cliente)
    
    return ClienteResponse(
        id=str(result.inserted_id),
        nome=cliente.nome,
        nif=cliente.nif,
        morada=cliente.morada,
        email=cliente.email,
        contato=cliente.contato,
        periodicidade=cliente.periodicidade,
        status=cliente.status,
        equipamentos=0
    )

@router.get("/", response_model=List[ClienteResponse])
async def list_clientes():
    db = get_database()
    clientes = []
    cursor = db.clientes.find({})
    async for document in cursor:
        count_eq = await db.equipamentos.count_documents({"cliente_id": str(document["_id"])})
        
        clientes.append(ClienteResponse(
            id=str(document["_id"]),
            nome=document["nome"],
            nif=document.get("nif", ""),
            morada=document.get("morada", ""),
            email=document.get("email", ""),
            contato=document.get("contato", ""),
            periodicidade=document.get("periodicidade", "Mensal"),
            status=document.get("status", "Ativo"),
            equipamentos=count_eq
        ))
    return clientes

@router.put("/{cliente_id}", response_model=ClienteResponse)
async def update_cliente(cliente_id: str, cliente: ClienteUpdate):
    if not ObjectId.is_valid(cliente_id):
        raise HTTPException(status_code=400, detail="ID inválido")
        
    db = get_database()
    update_data = {k: v for k, v in cliente.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="Nenhum dado para atualizar")

    await db.clientes.update_one(
        {"_id": ObjectId(cliente_id)},
        {"$set": update_data}
    )

    document = await db.clientes.find_one({"_id": ObjectId(cliente_id)})
    if not document:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
        
    count_eq = await db.equipamentos.count_documents({"cliente_id": cliente_id})
    return ClienteResponse(
        id=str(document["_id"]),
        nome=document["nome"],
        nif=document.get("nif", ""),
        morada=document.get("morada", ""),
        email=document.get("email", ""),
        contato=document.get("contato", ""),
        periodicidade=document.get("periodicidade", "Mensal"),
        status=document.get("status", "Ativo"),
        equipamentos=count_eq
    )

@router.delete("/{cliente_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cliente(cliente_id: str):
    if not ObjectId.is_valid(cliente_id):
        raise HTTPException(status_code=400, detail="ID inválido")
        
    db = get_database()
    result = await db.clientes.delete_one({"_id": ObjectId(cliente_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    return None
