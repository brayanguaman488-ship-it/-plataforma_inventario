# Plataforma de inventario

Aplicación de inventario con backend FastAPI y frontend Next.js. La documentación funcional está en [DOCUMENTACION_TITULACION.md](DOCUMENTACION_TITULACION.md).

## Desarrollo local

1. Crea una base de datos MySQL llamada `inventario_ml`.
2. En la terminal del backend, define `DATABASE_URL` con la URL de conexión de tu base de datos. Usa `.env.example` como referencia y no publiques la contraseña real. En PowerShell: `$env:DATABASE_URL = 'mysql+pymysql://usuario:contrasena@localhost:3306/inventario_ml'`.
3. Instala las dependencias e inicia el backend:

   ```powershell
   cd backend
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   python -m uvicorn app.main:app --reload
   ```

4. En otra terminal, inicia el frontend:

   ```powershell
   cd frontend
   npm ci
   npm run dev
   ```

Frontend: http://localhost:3000. API: http://127.0.0.1:8000/docs.

## Railway

Este repositorio contiene dos servicios y requiere una base de datos MySQL:

1. Crea un proyecto y agrega un servicio MySQL.
2. Agrega un servicio para este repositorio con **Root Directory** `/backend`. Su `Dockerfile` instala las dependencias y arranca FastAPI en el puerto asignado por Railway. Define `DATABASE_URL=${{MySQL.MYSQL_URL}}` usando una variable de referencia al servicio MySQL. El código acepta tanto `mysql://` como `mysql+pymysql://`.
3. Agrega otro servicio del mismo repositorio con **Root Directory** `/frontend`. Define `API_BASE_URL=https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}`, ajustando `Backend` al nombre exacto del servicio. El frontend envía las solicitudes `/api/v1` al backend mediante Next.js.
4. Genera dominios públicos para ambos servicios. La API dispone del endpoint `/api/v1/health`.

La base de datos de Railway empieza vacía. Para conservar los datos locales hay que migrarlos por separado; subir el código a GitHub no copia MySQL.
