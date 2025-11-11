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

3. **Aplica el esquema y genera el cliente de Prisma**

   ```bash
   cd backend
   npm run prisma:init
   ```

   > El script ejecuta `prisma migrate deploy` y, si detecta que las tablas ya existen (por ejemplo, porque las creaste manualmente), aplica automáticamente `prisma db push` para alinear el esquema antes de correr `prisma generate`. Los comandos `npm run dev` y `npm run start` disparan este paso de forma implícita, pero es recomendable ejecutarlo manualmente la primera vez para validar la conexión.

4. **Carga los datos de ejemplo**

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
    - Listo para Gratbelabs: envía `number` y `body` con encabezado Bearer configurado por variables de entorno.
  - `src/jobs/reminderJob.js`: Cron job de recordatorios.

### Endpoints principales

**Públicos**

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET | `/barberos` | Lista barberos y su disponibilidad configurada. |
| GET | `/servicios` | Lista servicios con duración y precio. |
| GET | `/disponibles/:barberoId?fecha=YYYY-MM-DD` | Devuelve horarios libres para un barbero y fecha dada. |
| POST | `/citas` | Crea una cita nueva y envía confirmación por WhatsApp (simulada si no hay API real). |

**Protegidos (token JWT)**

| Método | Ruta | Rol mínimo | Descripción |
| ------ | ---- | ---------- | ----------- |
| POST | `/auth/login` | Público | Devuelve token y datos del usuario. |
| GET | `/auth/me` | Barber | Perfil autenticado con rol y asignación. |
| GET | `/citas` | Barber | Lista citas del usuario autenticado (o todas si es admin). |
| GET | `/citas/:barberoId` | Admin | Lista citas filtradas por barbero. |
| PATCH | `/citas/:id` | Barber | Cancelar o reprogramar citas propias; admin puede modificar todas. |
| GET | `/users` | Admin | Listado completo de cuentas con teléfono y contraseña en texto plano. |
| POST | `/users` | Admin | Crear cuentas para administradores o barberos. |
| PATCH | `/users/:id` | Admin | Actualizar contraseña, teléfono o rol. |
| DELETE | `/users/:id` | Admin | Eliminar usuarios. |
| GET | `/business` | Admin | Consultar la información general del negocio. |
| PUT | `/business` | Admin | Actualizar los datos públicos del estudio. |

### Variables de entorno (backend)

| Variable | Descripción |
| -------- | ----------- |
| `DATABASE_URL` | Cadena de conexión MariaDB usada por Prisma. |
| `PORT` | Puerto HTTP del servidor Express (por defecto `4000`). |
| `WHATSAPP_API_URL` | URL de la API externa de WhatsApp (usa `https://appapi.gratbelabs.com/api/messages/send` para Gratbelabs). |
| `WHATSAPP_API_KEY` | Token Bearer para la API de WhatsApp (por ejemplo `Alex` para el entorno de pruebas). |
| `WHATSAPP_DEFAULT_COUNTRY_CODE` | (Opcional) Prefijo numérico para completar teléfonos locales, por ejemplo `52` para México. |
| `JWT_SECRET` | Clave usada para firmar los tokens de acceso. |

Si `WHATSAPP_API_URL` o `WHATSAPP_API_KEY` no están configurados, se realizará un envío simulado mostrando el mensaje en consola.

Los números telefónicos se normalizan eliminando caracteres no numéricos y aplicando el prefijo configurado cuando el número tiene diez dígitos o menos. La respuesta de la API externa (o el mensaje de error) se adjunta al payload que recibe el frontend para facilitar el diagnóstico en caso de fallos.

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

> ¿Ves un error `PrismaClientKnownRequestError` con el código `P2021` (tabla `User` no existe)? Asegúrate de ejecutar `npm run prisma:migrate --prefix backend` para aplicar las migraciones pendientes antes de iniciar sesión.

## 🔒 Consideraciones de producción

- Configura un servicio real para WhatsApp (el proyecto incluye integración lista para Gratbelabs; ajusta la URL y el token si usas otro proveedor).
- Implementa HTTPS y autenticación para los endpoints administrativos.
- Añade monitoreo para el cron job y colas de envío si el volumen de citas aumenta.
- Define mecanismos de reintentos/logging persistente para el módulo de notificaciones.

## 🔐 Autenticación y roles

- **Roles disponibles**: `ADMIN` (acceso total a la agenda, usuarios y configuración) y `BARBER` (solo puede ver y gestionar su propia agenda).
- Las contraseñas se almacenan cifradas (`bcrypt`) pero la plataforma conserva una copia en texto plano para que el administrador pueda consultarla desde el panel cuando necesite compartirla con su equipo.
- El archivo `backend/.env.example` incluye la variable `JWT_SECRET`; cámbiala antes de desplegar en producción.

## 🧪 Datos de ejemplo

El archivo `backend/prisma/seed.sql` inserta:

- Dos usuarios: `admin / admin123` (rol ADMIN) y `carlos / carlos2024` (rol BARBER vinculado al barbero Octavio).
- Dos barberos de muestra (uno vinculado al usuario `carlos`).
- Tres servicios listos para reservar.

---

¡Listo! Con estas instrucciones deberías poder lanzar Agenda Octane y comenzar a recibir reservas en minutos.
