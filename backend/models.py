from pydantic import BaseModel
from typing import Optional, List

# --- Clientes ---
class ClienteCreate(BaseModel):
    nome: str
    nif: str = ""
    morada: str = ""
    email: str = ""
    contato: str = ""
    periodicidade: str = "Mensal" # Mensal, Trimestral, Semestral, Anual
    status: str = "Ativo"

class ClienteResponse(ClienteCreate):
    id: str
    equipamentos: int = 0

class ClienteUpdate(BaseModel):
    nome: Optional[str] = None
    nif: Optional[str] = None
    morada: Optional[str] = None
    email: Optional[str] = None
    contato: Optional[str] = None
    periodicidade: Optional[str] = None
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
    cliente_id: str
    tipo_id: str
    tipo_nome: str
    prox_manut: str = ""
    marca: str = ""
    modelo: str = ""
    num_serie: str = ""
    localizacao: str = ""

class EquipamentoResponse(EquipamentoCreate):
    id: str
    cliente_nome: str

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

# --- Ordens de Serviço (Relatórios) ---
class ChecklistItem(BaseModel):
    tarefa: str
    concluida: bool = False
    comentario: str = ""
    foto_antes: str = ""
    foto_depois: str = ""

class OrdemCreate(BaseModel):
    titulo: str
    cliente_id: str
    equipamento_id: str
    data: str
    status: str = "Planejada" # Planejada, Em andamento, Concluída
    tecnico: str = ""
    checklist: List[ChecklistItem] = []
    observacoes_gerais: str = ""

class OrdemResponse(OrdemCreate):
    id: str
    cliente_nome: str
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
