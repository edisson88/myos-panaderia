# core-service-api

API REST construida con **NestJS** para el sistema de gestión de panadería **myos-panaderia**. Actúa como capa intermedia entre el frontend y **Hasura GraphQL**, aplicando autenticación JWT, control de acceso basado en roles y validación de datos.

---

## Tabla de contenidos

1. [Stack tecnológico](#stack-tecnológico)
2. [Arquitectura](#arquitectura)
3. [Requisitos previos](#requisitos-previos)
4. [Instalación y configuración](#instalación-y-configuración)
5. [Variables de entorno](#variables-de-entorno)
6. [Ejecutar el proyecto](#ejecutar-el-proyecto)
7. [Estructura del proyecto](#estructura-del-proyecto)
8. [Módulos y endpoints](#módulos-y-endpoints)
9. [Mecanismos transversales](#mecanismos-transversales)
10. [Docker](#docker)

---

## Stack tecnológico

| Categoría       | Tecnología                              |
|-----------------|-----------------------------------------|
| Framework       | NestJS 11                               |
| Lenguaje        | TypeScript 5                            |
| Runtime         | Node.js 20                              |
| Package manager | pnpm 9                                  |
| Autenticación   | JWT · Passport · bcryptjs               |
| Data layer      | Hasura GraphQL (HTTP + admin secret)    |
| Validación      | class-validator · class-transformer     |
| Config          | @nestjs/config · Joi                    |
| HTTP client     | @nestjs/axios                           |
| Contenedor      | Docker (multi-stage, node:20-alpine)    |

---

## Arquitectura

```
                ┌──────────────┐
                │   Frontend   │
                └──────┬───────┘
                       │ HTTP (JWT Bearer)
                ┌──────▼───────────────────┐
                │    core-service-api      │
                │  ┌────────────────────┐  │
                │  │  Global Prefix /api│  │
                │  ├────────────────────┤  │
                │  │  ValidationPipe    │  │
                │  │  HttpExceptionFilter│  │
                │  │  ResponseInterceptor│  │
                │  ├────────────────────┤  │
                │  │  JwtAuthGuard      │  │
                │  │  RolesGuard        │  │
                │  ├────────────────────┤  │
                │  │  Feature Modules   │  │
                │  └────────┬───────────┘  │
                │           │ GraphQL HTTP  │
                └───────────┼──────────────┘
                            │
                ┌───────────▼──────────────┐
                │     Hasura GraphQL       │
                │  (PostgreSQL bajo techo) │
                └──────────────────────────┘
```

Cada módulo sigue la división **Controller → Service → Repository**:

- **Controller**: recibe la petición HTTP, valida DTO, delega al Service.
- **Service**: aplica reglas de negocio.
- **Repository**: construye la query/mutation GraphQL y llama a `HasuraService`.

---

## Requisitos previos

- Node.js ≥ 20
- pnpm ≥ 9 (`npm install -g pnpm@9`)
- Una instancia de Hasura (Cloud o self-hosted) con el schema desplegado

---

## Instalación y configuración

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd myos-panaderia/core-service-api

# 2. Instalar dependencias
pnpm install

# 3. Crear el archivo de entorno
cp .env.example .env
# → Editar .env con los valores reales (ver sección siguiente)
```

---

## Variables de entorno

Copia `.env.example` a `.env` y completa cada variable:

```dotenv
# ── App ──────────────────────────────────────────────────────────────────────
NODE_ENV=development          # development | production | test
PORT=4000

# ── Hasura ───────────────────────────────────────────────────────────────────
HASURA_GRAPHQL_ENDPOINT=https://<tu-proyecto>.hasura.app/v1/graphql
HASURA_ADMIN_SECRET=<tu-admin-secret>

# JWT Secret en formato JSON de Hasura
# Debe coincidir con Hasura → Settings → JWT Config
HASURA_GRAPHQL_JWT_SECRET={"type":"HS256","key":"<tu-jwt-secret-de-al-menos-32-caracteres>"}

# ── JWT ───────────────────────────────────────────────────────────────────────
JWT_EXPIRES_IN=1d
DEFAULT_ROLE=user

# ── CORS ─────────────────────────────────────────────────────────────────────
# Separar múltiples orígenes por coma (sin espacios)
# ⚠ Obligatoria en NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

> **HASURA_GRAPHQL_JWT_SECRET** debe ser el mismo valor configurado en Hasura Console → Settings → JWT Config. La API extrae automáticamente el campo `key` del JSON para firmar y verificar tokens.

---

## Ejecutar el proyecto

```bash
# Desarrollo (hot-reload)
pnpm run start:dev

# Producción
pnpm run build
pnpm run start:prod

# Debug
pnpm run start:debug
```

La API queda disponible en `http://localhost:4000/api`.

---

## Estructura del proyecto

```
src/
├── app.module.ts               # Módulo raíz
├── main.ts                     # Bootstrap: CORS, pipes, filtros, interceptores
│
├── common/                     # Utilidades transversales reutilizables
│   ├── decorators/
│   │   ├── current-user.decorator.ts   # @CurrentUser() → JwtPayload
│   │   └── roles.decorator.ts          # @Roles(...) → metadatos para RolesGuard
│   ├── enums/
│   │   └── user-role.enum.ts           # admin | staff | customer | user
│   ├── filters/
│   │   └── http-exception.filter.ts    # Formato de error unificado
│   ├── guards/
│   │   ├── jwt-auth.guard.ts           # Valida Bearer token
│   │   └── roles.guard.ts              # Verifica rol del usuario autenticado
│   ├── interceptors/
│   │   └── response.interceptor.ts     # Envuelve respuestas en { success, data }
│   └── interfaces/
│       ├── hasura-response.interface.ts
│       └── jwt-payload.interface.ts
│
├── config/
│   ├── env.config.ts           # Opciones de ConfigModule
│   ├── env.validation.ts       # Esquema Joi para variables de entorno
│   ├── hasura.config.ts        # Config con namespace 'hasura'
│   └── jwt.config.ts           # Config con namespace 'jwt' (extrae key del JSON)
│
├── modules/
│   ├── auth/                   # Autenticación JWT
│   ├── customers/              # Perfil de cliente
│   ├── dashboard/              # KPIs y resumen operativo
│   ├── orders/                 # Gestión de pedidos
│   ├── products/               # Catálogo de productos
│   ├── production/             # Control de producción
│   ├── deliveries/             # Gestión de repartos
│   ├── analytics/              # Analítica de ventas y producción
│   └── exports/                # Exportación de datos (CSV/Excel)
│
└── shared/
    └── hasura/
        ├── hasura.module.ts    # Módulo global que provee HasuraService
        └── hasura.service.ts   # Cliente HTTP genérico para Hasura GraphQL
```

---

## Módulos y endpoints

Todos los endpoints están bajo el prefijo `/api`. Los protegidos requieren el header:

```
Authorization: Bearer <access_token>
```

### Auth — `/api/auth`

| Método | Ruta      | Auth      | Descripción                               |
|--------|-----------|-----------|-------------------------------------------|
| POST   | `/login`  | ✗         | Autentica usuario, retorna JWT + perfil   |
| GET    | `/me`     | ✓ JWT     | Retorna el perfil del usuario autenticado |

**Body `POST /login`:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "tuPassword"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "access_token": "<jwt>",
    "user": { "id": "...", "name": "...", "email": "...", "role": "admin" }
  }
}
```

---

### Orders — `/api/orders`

| Método | Ruta           | Auth  | Descripción                              |
|--------|----------------|-------|------------------------------------------|
| GET    | `/`            | ✓ JWT | Lista pedidos (filtros por query string) |
| GET    | `/:id`         | ✓ JWT | Detalle de un pedido                     |
| POST   | `/`            | ✓ JWT | Crear nuevo pedido                       |
| PATCH  | `/:id`         | ✓ JWT | Actualizar campos del pedido             |
| PATCH  | `/:id/status`  | ✓ JWT | Cambiar estado del pedido                |

**Estados válidos (`OrderStatus`):**

`draft` → `confirmed` → `in_production` → `ready_for_delivery` → `in_route` → `delivered` | `cancelled`

---

### Products — `/api/products`

| Método | Ruta    | Auth  | Descripción              |
|--------|---------|-------|--------------------------|
| GET    | `/`     | ✓ JWT | Lista todos los productos |
| GET    | `/:id`  | ✓ JWT | Detalle de un producto   |
| POST   | `/`     | ✓ JWT | Crear producto           |
| PATCH  | `/:id`  | ✓ JWT | Actualizar producto      |
| DELETE | `/:id`  | ✓ JWT | Eliminar producto        |

---

### Production — `/api/production`

| Método | Ruta          | Auth  | Descripción                     |
|--------|---------------|-------|---------------------------------|
| GET    | `/`           | ✓ JWT | Lista órdenes de producción     |
| GET    | `/:id`        | ✓ JWT | Detalle de producción           |
| PATCH  | `/:id/status` | ✓ JWT | Actualizar estado de producción |

---

### Deliveries — `/api/deliveries`

| Método | Ruta          | Auth  | Descripción                  |
|--------|---------------|-------|------------------------------|
| GET    | `/`           | ✓ JWT | Lista todos los repartos     |
| GET    | `/:id`        | ✓ JWT | Detalle de un reparto        |
| PATCH  | `/:id/status` | ✓ JWT | Actualizar estado de reparto |

---

### Customers — `/api/customers`

| Método | Ruta  | Auth                    | Descripción                         |
|--------|-------|-------------------------|-------------------------------------|
| GET    | `/me` | ✓ JWT + rol `customer`  | Perfil del cliente autenticado      |

---

### Dashboard — `/api/dashboard`

| Método | Ruta             | Auth  | Descripción            |
|--------|------------------|-------|------------------------|
| GET    | `/summary`       | ✓ JWT | KPIs generales         |
| GET    | `/recent-orders` | ✓ JWT | Últimos pedidos        |
| GET    | `/alerts`        | ✓ JWT | Alertas operativas     |

---

### Analytics — `/api/analytics`

| Método | Ruta          | Auth  | Descripción             |
|--------|---------------|-------|-------------------------|
| GET    | `/sales`      | ✓ JWT | Analítica de ventas     |
| GET    | `/production` | ✓ JWT | Analítica de producción |

---

### Exports — `/api/exports`

| Método | Ruta         | Auth  | Descripción                  |
|--------|--------------|-------|------------------------------|
| GET    | `/orders`    | ✓ JWT | Exportar pedidos (CSV/Excel) |
| GET    | `/customers` | ✓ JWT | Exportar clientes (CSV/Excel)|

---

## Mecanismos transversales

### Formato de respuesta unificado

Todas las respuestas exitosas son envueltas por `ResponseInterceptor`:
```json
{ "success": true, "data": { ... } }
```

Todos los errores HTTP son formateados por `HttpExceptionFilter`:
```json
{
  "success": false,
  "statusCode": 401,
  "timestamp": "2026-03-23T23:56:44.757Z",
  "path": "/api/auth/login",
  "message": "Invalid credentials"
}
```

### Autenticación y autorización

- **`JwtAuthGuard`**: valida el token Bearer con `passport-jwt`. Adjunta el payload decodificado a `request.user`.
- **`RolesGuard`**: usado junto a `@Roles(UserRole.ADMIN)`. Debe aplicarse después de `JwtAuthGuard`.
- **`@CurrentUser()`**: decorator de parámetro que extrae `request.user` tipado como `JwtPayload`.

### Claims de Hasura en el JWT

El token firmado incluye el namespace requerido por Hasura para sus permisos:

```json
{
  "sub": "<user-uuid>",
  "email": "...",
  "name": "...",
  "role": "admin",
  "https://hasura.io/jwt/claims": {
    "x-hasura-user-id": "<user-uuid>",
    "x-hasura-default-role": "admin",
    "x-hasura-allowed-roles": ["admin"]
  }
}
```

Esto permite que el frontend pueda usar el mismo token directamente contra Hasura para operaciones que lo requieran.

---

## Docker

El `Dockerfile` usa **multi-stage build** para minimizar la imagen de producción:

| Stage        | Base           | Qué hace                                      |
|--------------|----------------|-----------------------------------------------|
| `builder`    | node:20-alpine | Instala todas las dependencias y compila TS   |
| `production` | node:20-alpine | Solo dependencias de producción + `dist/`     |

```bash
# Build de la imagen
docker build -t core-service-api .

# Ejecutar el contenedor
docker run -p 4000:4000 --env-file .env core-service-api
```

El puerto es configurable via la variable `PORT` (Railway lo asigna dinámicamente en despliegues cloud).