# Deploying NearByNeeds Backend on Railway

This guide walks you through deploying the Spring Boot backend service on [Railway](https://railway.app/). The codebase has been fully pre-configured to bind automatically to Railway's MySQL, Redis, and dynamic port configurations.

---

## 1. Prerequisites

- A **Railway Account** (linked with GitHub).
- The **Railway CLI** installed locally (optional, but useful for command-line deployments).

---

## 2. Deploying from GitHub (Recommended)

1. Create a new project on Railway.
2. Select **Deploy from GitHub repository**.
3. Choose the `NearByNeeds` repository (ensure the project subdirectory is set to `Backend` if it's in a subdirectory, or let Railway auto-detect the root `Dockerfile`).
4. Railway will automatically detect the `Dockerfile` and `railway.json` configurations and queue a build.

---

## 3. Provisioning Database & Cache Services

To make the application fully functional, you need to add MySQL and Redis services in your Railway project:

### Provision MySQL
1. In your Railway project canvas, click **+ New** -> **Database** -> **Add MySQL**.
2. Railway will deploy a MySQL instance and inject standard environment variables (`MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`) into the project context.
3. The backend's `application.properties` is pre-configured to read these variables and auto-configure the Hibernate connection pool dynamically.

### Provision Redis
1. In your Railway project canvas, click **+ New** -> **Database** -> **Add Redis**.
2. Railway will deploy a Redis instance and inject standard environment variables (`REDISHOST`, `REDISPORT`, `REDISPASSWORD`) into the project context.
3. The backend's `application.properties` is pre-configured to read these variables and auto-configure the Spring Data Redis connection pool dynamically.

---

## 4. Required Environment Variables

You need to add custom environment variables in the settings of the **nearbyneeds (backend)** service:

| Variable Name | Description | Suggested Value |
| :--- | :--- | :--- |
| `JWT_SECRET` | A secure, cryptographically random key for signing JWTs. | A 64-character hex string (e.g. `9a4f2c8d3b7a1e6f45c8a0b3f267d8b1d4e6f3c8a9d2b5f8e3a9c8b5f6v8a3d9`) |
| `JWT_EXPIRATION` | Duration for which a JWT remains valid (in milliseconds). | `86400000` (24 hours) |

*Note: The database and cache variables (`MYSQL...` and `REDIS...`) are automatically injected by Railway when you provision those services, so you do not need to add them manually.*

---

## 5. Persistent Volume for File Uploads

> [!WARNING]
> The backend saves user-uploaded images and documents to the local `/app/uploads` folder. Since containers run on an ephemeral filesystem, **all uploaded files will be lost** during redeployments or container restarts.

To persist these files, you must mount a **Railway Volume**:
1. Go to the **nearbyneeds (backend)** service in your Railway dashboard.
2. Navigate to the **Settings** tab.
3. Scroll down to the **Volumes** section and click **Add Volume**.
4. Configure the mount path exactly as:
   `Mount Path: /app/uploads`
5. Save the configuration. Railway will redeploy the service, and all uploads will now persist across deployments!

---

## 6. How it works under the hood

The `application.properties` has been customized to automatically adapt to whether it's running in Railway or locally:
- **Port Binding**: Spring Boot binds to `${PORT}` (provided by Railway) and defaults to `8080` locally.
- **Database & Cache**: Nested fallback parameters resolve to `localhost` defaults if no Railway-specific host is present.
- **Docker Building**: A multi-stage `Dockerfile` handles building the jar cleanly from source and serving it from a lightweight JRE image.
