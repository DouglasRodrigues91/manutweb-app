from pydantic import BaseModel
from typing import Optional, List

# --- Edificios ---
class EdificioCreate(BaseModel):
    nome: str
    nif: str = ""
    morada: str = ""
    email: str = ""
    contato: str = ""
    status: str = "Ativo"

class EdificioResponse(EdificioCreate):
    id: str
    numero: int = 0
    equipamentos: int = 0

class EdificioUpdate(BaseModel):
    nome: Optional[str] = None
    nif: Optional[str] = None
    morada: Optional[str] = None
    email: Optional[str] = None
    contato: Optional[str] = None
    status: Optional[str] = None

# --- Tipos de Equipamento e Tarefas ---
class TipoEquipamentoCreate(BaseModel):
    nome: str
    tarefas: List[str] = []

class TipoEquipamentoResponse(TipoEquipamentoCreate):
    id: str

# --- Equipamentos ---
class EquipamentoCreate(BaseModel):
    nome: str
    edificio_id: str
    tipo_id: str
    tipo_nome: str
    prox_manut: str = ""

class EquipamentoResponse(EquipamentoCreate):
    id: str
    edificio_nome: str

# --- Usuários ---
class UserCreate(BaseModel):
    email: str
    password: str
    nome: str
    role: str = "Técnico" # "Admin", "Gestor", "Técnico"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    nome: str
    role: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# --- Ordens de Serviço ---
class ChecklistItem(BaseModel):
    tarefa: str
    concluida: bool = False

class OrdemCreate(BaseModel):
    titulo: str
    edificio_id: str
    equipamento_id: str
    data: str
    status: str = "Planejada"
    tecnico: str = ""
    checklist: List[ChecklistItem] = []

class OrdemResponse(OrdemCreate):
    id: str
    edificio_nome: str
    equipamento_nome: str

# --- Empresa ---
class EmpresaUpdate(BaseModel):
    nome: str
    nif: str
    morada: str
    email: str
    telefone: str
    iban: str
    logo_url: str = ""

class EmpresaResponse(EmpresaUpdate):
    id: str
