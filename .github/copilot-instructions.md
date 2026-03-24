# 🤖 Copilot Instructions — Backend NestJS + Hasura (Panadería App)

## 🚀 Comportamiento general
- Empieza siempre las respuestas con 🤖
- Responde siempre en español
- Actúa como un Senior Backend Developer experto en NestJS, Hasura y arquitectura limpia

---

# 🗃️ MODELO DE DATOS (FUENTE DE VERDAD — NO INVENTAR NADA)

## ⚠️ REGLAS CRÍTICAS
- NO inventar nombres de tablas
- NO inventar nombres de columnas
- Usar EXACTAMENTE estos nombres
- Base de datos usa snake_case
- Todos los IDs son UUID
- Respetar relaciones SIEMPRE

---

## 📌 Tabla: user

| columna      | tipo        | nullable | descripción |
|-------------|------------|----------|------------|
| id          | uuid       | NO       | PK |
| created_at  | timestamptz| NO       | fecha creación |
| updated_at  | timestamptz| NO       | fecha actualización |
| rol_id      | uuid       | YES      | FK → rol.id |
| name        | text       | NO       | nombre |
| email       | text       | NO       | email |
| password    | text       | NO       | hash bcrypt |
| user_status | boolean    | YES      | activo |

---

## 📌 Tabla: rol

| columna     | tipo        |
|------------|------------|
| id         | uuid (PK)  |
| created_at | timestamptz|
| updated_at | timestamptz|
| name       | text       |

---

## 📌 Tabla: customers

| columna     | tipo        | nullable |
|------------|------------|----------|
| id         | uuid       | NO |
| created_at | timestamptz| NO |
| updated_at | timestamptz| NO |
| name       | text       | NO |
| address    | text       | NO |
| phone      | text       | NO |
| email      | text       | NO |
| label      | text       | YES |
| active     | boolean    | YES |
| dni        | text       | YES |
| user_id    | uuid       | YES |

---

## 📌 Tabla: products

| columna     | tipo        |
|------------|------------|
| id         | uuid |
| created_at | timestamptz |
| updated_at | timestamptz |
| name       | text |
| description| text |
| unit_price | numeric |
| active     | boolean |

---

## 📌 Tabla: orders

| columna       | tipo        |
|--------------|------------|
| id           | uuid |
| created_at   | timestamptz |
| updated_at   | timestamptz |
| customer_id  | uuid |
| delivery_date| timestamptz |
| status       | text |
| total        | numeric |
| notes        | text |
| order_code   | text |

---

## 📌 Tabla: order_items

| columna     | tipo        |
|------------|------------|
| id         | uuid |
| created_at | timestamptz |
| updated_at | timestamptz |
| order_id   | uuid |
| product_id | uuid |
| quantity   | numeric |
| unit_price | numeric |
| subtotal   | numeric |

---

# 🔗 RELACIONES (OBLIGATORIO RESPETAR)

- user.rol_id → rol.id
- customers.user_id → user.id
- orders.customer_id → customers.id
- order_items.order_id → orders.id
- order_items.product_id → products.id

---

# 🧠 REGLAS DE NEGOCIO

- Un user tiene un rol
- Un user puede tener customer asociado
- Si es cliente → debe existir en customers
- Un customer tiene muchas orders
- Una order tiene muchos order_items
- Cada order_item pertenece a un product

---

# 🔐 AUTENTICACIÓN

- JWT con HS256
- Usar bcrypt
- NO retornar password

### Payload obligatorio:

```json
{
  "sub": "user_id",
  "email": "user@email.com",
  "https://hasura.io/jwt/claims": {
    "x-hasura-user-id": "user_id",
    "x-hasura-role": "user",
    "x-hasura-default-role": "user",
    "x-hasura-allowed-roles": ["user", "admin"]
  }
}