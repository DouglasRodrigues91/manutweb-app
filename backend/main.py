from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import connect_to_mongo, close_mongo_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(
    title="Maintenance App API",
    description="API for the maintenance management web application.",
    version="1.0.0",
    lifespan=lifespan
)

from routers import auth, clientes, equipamentos, tipos, ordens, empresa
app.include_router(auth.router)
app.include_router(clientes.router)
app.include_router(equipamentos.router)
app.include_router(tipos.router)
app.include_router(ordens.router)
app.include_router(empresa.router)

# Allow CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the Maintenance App API. Systems are fully operational."}

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
