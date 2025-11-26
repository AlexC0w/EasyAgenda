# Guía de Despliegue en VPS (Docker)

Esta guía te ayudará a subir y ejecutar tu aplicación "Agenda Barber Pro" en un VPS que ya tiene Docker y Docker Compose instalados.

## 1. Preparación de Archivos

He creado y configurado los siguientes archivos necesarios para producción:

*   `frontend/Dockerfile`: Para construir la aplicación React y servirla con Nginx.
*   `frontend/nginx.conf`: Configuración de Nginx para servir el frontend y redirigir las peticiones `/api` al backend.
*   `frontend/.env.production`: Define la URL de la API como `/api` para que funcione con el proxy inverso.
*   `docker-compose.yml`: Orquesta los servicios de Base de Datos (MariaDB), Backend y Frontend.

## 2. Subir archivos al VPS

Necesitas copiar la carpeta del proyecto a tu VPS. Puedes usar `git` o `scp`.

### Opción A: Usando Git (Recomendado)
Si tienes tu código en GitHub/GitLab:
1.  Conéctate a tu VPS por SSH.
2.  Clona el repositorio:
    ```bash
    git clone https://github.com/tu-usuario/tu-repo.git agenda-app
    cd agenda-app
    ```

### Opción B: Usando SCP (Copia directa)
Desde tu terminal local (en la carpeta del proyecto):
```bash
# Reemplaza usuario@tu-vps-ip con tus datos reales
scp -r . usuario@tu-vps-ip:~/agenda-app
```

## 3. Configuración en el VPS

1.  Conéctate a tu VPS: `ssh usuario@tu-vps-ip`
2.  Ve a la carpeta del proyecto: `cd agenda-app` (o donde lo hayas copiado).
3.  **Variables de Entorno**:
    El archivo `docker-compose.yml` usa variables de entorno. Puedes crear un archivo `.env` en la raíz del proyecto en el VPS con los valores de producción:

    ```bash
    nano .env
    ```

    Pega y ajusta lo siguiente (¡cambia las contraseñas!):

    ```env
    # Base de Datos
    MARIADB_ROOT_PASSWORD=contraseña_segura_root
    MARIADB_DATABASE=agenda_octane
    MARIADB_USER=agenda
    MARIADB_PASSWORD=contraseña_segura_db

    # Backend
    PORT=4000
    # Nota: En docker-compose, el host de la DB es el nombre del servicio: 'db'
    DATABASE_URL=mysql://agenda:contraseña_segura_db@db:3306/agenda_octane
    
    # Seguridad
    JWT_SECRET=cambia_esto_por_un_secreto_largo_y_seguro
    
    # WhatsApp (si aplica)
    WHATSAPP_API_URL=...
    WHATSAPP_API_KEY=...
    ```

    *Nota: Asegúrate de que las credenciales en `DATABASE_URL` coincidan con las variables `MARIADB_...`.*

## 4. Ejecutar la Aplicación

Una vez configurado el `.env`, ejecuta:

```bash
docker compose up -d --build
```

*   `up`: Levanta los servicios.
*   `-d`: En segundo plano (detached).
*   `--build`: Fuerza la construcción de las imágenes (importante la primera vez o al actualizar código).

## 5. Verificar

*   El frontend estará disponible en el puerto **80** de tu VPS: `http://tu-vps-ip`.
*   La API estará accesible internamente y a través del proxy en `http://tu-vps-ip/api`.

## 6. Configuración de Dominio y SSL (HTTPS)

Para producción real, no deberías exponer el puerto 80 directamente si quieres HTTPS. Lo ideal es usar un proxy inverso en el "host" (el VPS) como Nginx o Traefik que maneje los certificados SSL (Let's Encrypt).

### Ejemplo rápido con Nginx en el host (fuera de Docker):

1.  Instala Nginx en el VPS: `sudo apt install nginx`
2.  Instala Certbot: `sudo apt install certbot python3-certbot-nginx`
3.  Configura un bloque de servidor apuntando al puerto 80 del contenedor (que mapeamos al 80 del host, o podrías cambiarlo al 8080 en docker-compose si el 80 ya está ocupado).

Si el puerto 80 del VPS está libre y Docker lo usa directamente, puedes intentar usar Certbot directamente, pero a veces entra en conflicto. Una arquitectura común es:

*   **Docker Compose**: Frontend mapeado al puerto `8080:80`.
*   **Nginx (Host)**: Proxy Pass de `midominio.com` -> `localhost:8080`.
*   **Certbot**: Genera SSL para Nginx en el host.

**Para empezar, prueba accediendo a `http://tu-vps-ip` y verifica que cargue la aplicación.**
