# Agenda Octane

Agenda Octane es una solución fullstack para gestionar reservas de una barbería moderna. Incluye una API en Node.js + Express con Prisma y MariaDB, y un frontend en React (Vite + Tailwind) que permite a los clientes seleccionar barberos, servicios y horarios disponibles.

## 🧱 Estructura del proyecto

```
.
├── backend/          # API Express + Prisma
├── frontend/         # Aplicación React + Vite + Tailwind
├── docker-compose.yml
└── README.md
```

## 🚀 Puesta en marcha rápida

1. **Instala dependencias**

   ```bash
   npm install
   ```

   Este comando instalará los módulos necesarios tanto en `backend` como en `frontend`.

2. **Configura variables de entorno**

   - Backend: copia `backend/.env.example` a `backend/.env` y ajusta la cadena de conexión a tu servidor MariaDB.
   - Frontend: copia `frontend/.env.example` a `frontend/.env` y ajusta `VITE_API_URL` si el backend corre en otra URL.

3. **Genera el cliente de Prisma**

   ```bash
   cd backend
   npx prisma generate
   ```

4. **Aplica el esquema y datos de ejemplo**

   - Ejecuta las migraciones de Prisma contra tu base de datos MariaDB:

     ```bash
     npx prisma migrate deploy
     ```

   - Poblado inicial (dos barberos y tres servicios):

     ```bash
     mysql -u <usuario> -p <base_de_datos> < prisma/seed.sql
     ```

5. **Levanta frontend y backend en paralelo**

   Desde la raíz del repositorio:

   ```bash
   npm run dev
   ```

   - Backend: `http://localhost:4000`
   - Frontend: `http://localhost:5173`

6. **Usuarios de Docker**

   ```bash
   docker compose up --build
   ```

   El `docker-compose.yml` levanta MariaDB y la API. Ejecuta `npm run dev --prefix frontend` para iniciar el cliente React en tu máquina.

## ⚙️ Backend

- **Tecnologías**: Node.js, Express, Prisma, MariaDB.
- **Middleware**: CORS, logging (`morgan`), validación (`express-validator`), manejo centralizado de errores.
- **Jobs automáticos**: `node-cron` revisa cada 5 minutos las citas y envía recordatorios vía WhatsApp una hora antes (usa un stub si no se configura la API real).
- **Módulos clave**:
  - `src/routes/barberos.js`: CRUD de barberos (lectura).
  - `src/routes/servicios.js`: Servicios disponibles.
  - `src/routes/disponibles.js`: Calcula horarios libres.
  - `src/routes/citas.js`: Registro, consulta, actualización de citas.
  - `src/lib/sendWhatsApp.js`: Integración simulada/real con API de WhatsApp.
  - `src/jobs/reminderJob.js`: Cron job de recordatorios.

### Endpoints principales

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET | `/barberos` | Lista barberos y su disponibilidad configurada. |
| GET | `/servicios` | Lista servicios con duración y precio. |
| GET | `/disponibles/:barberoId?fecha=YYYY-MM-DD` | Devuelve horarios libres para un barbero y fecha dada. |
| POST | `/citas` | Crea una cita nueva y envía confirmación por WhatsApp. |
| GET | `/citas` | Lista todas las citas. |
| GET | `/citas/:barberoId` | Lista citas filtradas por barbero. |
| PATCH | `/citas/:id` | Permite cancelar o reprogramar una cita. |

### Variables de entorno (backend)

| Variable | Descripción |
| -------- | ----------- |
| `DATABASE_URL` | Cadena de conexión MariaDB usada por Prisma. |
| `PORT` | Puerto HTTP del servidor Express (por defecto `4000`). |
| `WHATSAPP_API_URL` | URL de la API externa de WhatsApp (opcional). |
| `WHATSAPP_API_KEY` | Token Bearer para la API de WhatsApp (opcional). |

Si `WHATSAPP_API_URL` o `WHATSAPP_API_KEY` no están configurados, se realizará un envío simulado mostrando el mensaje en consola.

## 💻 Frontend

- **Tecnologías**: React 18, Vite, Tailwind CSS, FullCalendar.
- **Pantallas**:
  - **Reserva**: selector de barbero, servicio, calendario semanal interactivo, formulario y confirmación visual.
  - **Administración**: vista FullCalendar con filtros por barbero, arrastre para reprogramar y cancelación con un clic.
- **Configuración**:
  - Definir `VITE_API_URL` para apuntar al backend.
  - Tailwind configurado en `tailwind.config.cjs` y estilos en `src/index.css`.

## 📚 Scripts útiles

| Comando | Descripción |
| ------- | ----------- |
| `npm run dev` | Inicia backend y frontend en modo desarrollo. |
| `npm run dev --prefix backend` | Solo backend (Express + Prisma). |
| `npm run dev --prefix frontend` | Solo frontend (Vite). |
| `npm run build --prefix frontend` | Construye la aplicación React. |
| `npm run prisma:generate --prefix backend` | Genera el cliente Prisma. |
| `npm run prisma:migrate --prefix backend` | Ejecuta migraciones en la base de datos configurada. |

## 🔒 Consideraciones de producción

- Configura un servicio real para WhatsApp y actualiza `sendWhatsApp.js` según el proveedor.
- Implementa HTTPS y autenticación para los endpoints administrativos.
- Añade monitoreo para el cron job y colas de envío si el volumen de citas aumenta.
- Define mecanismos de reintentos/logging persistente para el módulo de notificaciones.

## 🧪 Datos de ejemplo

El archivo `backend/prisma/seed.sql` inserta dos barberos y tres servicios para comenzar a probar la plataforma inmediatamente.

---

¡Listo! Con estas instrucciones deberías poder lanzar Agenda Octane y comenzar a recibir reservas en minutos.
