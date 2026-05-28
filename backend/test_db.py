import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

async def test_connection():
    print(f"Tentando conectar com a URI: {MONGODB_URI}")
    try:
        client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        # O 'ping' força a conexão real com o servidor para validar usuário/senha
        await client.admin.command('ping')
        print("✅ CONEXÃO COM O MONGODB ATLAS FOI UM SUCESSO!")
        print("Usuário e senha estão corretos e o banco está respondendo.")
    except Exception as e:
        print("❌ FALHA NA CONEXÃO COM O MONGODB ATLAS.")
        print(f"Detalhes do erro: {e}")
        print("\nDICA: Você substituiu o <db_password> no arquivo .env pela sua senha real?")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(test_connection())
