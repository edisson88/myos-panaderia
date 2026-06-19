# Myos Panadería · Sistema de Gestión Integral

Plataforma empresarial diseñada para el control total de operaciones en panaderías artesanales y puntos de venta. Este repositorio es un monorepo que contiene tanto el ecosistema de microservicios (Backend) como la interfaz de usuario de alto desempeño (Frontend).

---

## 🥐 Resumen del Proyecto

**Myos Panadería** permite gestionar desde la base de datos de clientes y productos hasta el control minucioso de lotes de producción y analítica de desempeño en tiempo real.

| Componente | Directorio | Tecnología Principal | Estado |
| :--- | :--- | :--- | :--- |
| **Dashboard UI** | `web-app` | React 19 + MUI v6 + Vite | v1.1 - Corporate Hard-Edge |
| **Core Service API** | `core-service-api` | NestJS + PostgreSQL + Hasura | Operativo |

---

## 🚀 Logros de la Sesión de Hoy (25 de Marzo, 2026)

Hoy consolidamos la identidad visual y funcional del sistema, elevando la experiencia de usuario a un estándar corporativo premium.

### 🎨 Identidad Visual & UX (Corporate Hard-Edge)
- **Paleta de Colores Artesanal:** Implementación de la paleta **Cacao, Trigo y Harina**, armonizando los tonos tierra (#6B3A2A) con fondos cálidos (#FAF9F8) para una estética profesional.
- **Diseño Estructural:** Eliminación global de bordes redondeados (`borderRadius: 0`) y sombras innecesarias, logrando un acabado limpio y moderno.
- **Optimización de Interfaz:** Centralización de títulos y acciones globales en la `Topbar`, eliminando redundancias en todas las páginas de módulos.

### 📊 Dashboard e Interactividad (Drill-down)
- **Navegación Inteligente:** Implementación de interactividad en los gráficos de Analítica. Al hacer clic en las métricas de producción, el sistema redirige automáticamente al módulo de producción aplicando filtros dinámicos.
- **Dashboard Operativo:** Reorganización de widgets para priorizar "Pedidos Recientes" y "Producción vs Desperdicio".

### ⚙️ Módulo de Producción (Micro-interacciones)
- **Animaciones de Estado:** Integración de `framer-motion` para transiciones suaves entre estados de lotes ("Borrador" → "En Progreso" → "Completado").
- **Gamificación/Feedback:** Efecto visual de "celebración" (pulso y destello) al completar satisfactoriamente un proceso de panadería.

### 📥 Módulo de Importación Masiva
- **Nueva Funcionalidad:** Desarrollo del módulo de importación masiva para carga rápida de Clientes, Productos, Proveedores y Pedidos.
- **Generación de Plantillas:** Integración con la librería `xlsx` para descargar plantillas de Excel oficiales con los encabezados correctos.
- **Identificación Legal:** Inclusión del campo **DNI/NIT** en la base de clientes para cumplimiento tributario.

---

## 🛠️ Instalación y Dependencias

Para poner en marcha el proyecto frontend con todas las mejoras de hoy, asegúrate de instalar:

### Frontend (`web-app`)
```bash
# Navegar al directorio
cd web-app

# Instalar librerías clave añadidas hoy
npm install framer-motion xlsx

# Ejecutar en modo desarrollo
npm run dev
```

**Dependencias Críticas:**
- `framer-motion`: Animaciones y micro-interacciones.
- `xlsx`: Procesamiento de plantillas de exportación/importación.
- `@mui/material` & `@mui/icons-material`: Sistema de componentes v6.
- `recharts`: Visualización de datos interactiva.
- `react-router-dom`: Gestión de navegación y filtros por URL.

### Backend (`core-service-api`)
```bash
# Navegar al directorio
cd core-service-api

# Instalar dependencias con pnpm
pnpm install

# Ejecutar servicios
pnpm run start:dev
```

---

## 📁 Estructura General

```
myos-panaderia/
├── web-app/               # Aplicación React (Vite)
│   ├── src/
│   │   ├── layout/       # Componentes de estructura (Sidebar, Topbar)
│   │   ├── modules/      # Lógica de negocio (Customers, Products, etc.)
│   │   ├── pages/        # Páginas de nivel superior
│   │   └── theme/        # Definición del theme "Artisanal"
├── core-service-api/      # API NestJS
│   ├── src/
│   │   ├── modules/      # Controladores y servicios de la API
│   │   └── shared/       # Integración con Hasura/GraphQL
└── README.md              # Este archivo
```

---

## 📄 Licencia
Este proyecto es propiedad exclusiva de **Myos Panadería**. Todos los derechos reservados.
