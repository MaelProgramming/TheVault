# ⚜️ The Vault — Club de la Élite

Bienvenido a **The Vault**, una plataforma web premium de networking y matchmaking diseñada bajo un estilo visual sobrio, clásico y sofisticado (inspirado en la estética "Old Money"). 

Esta aplicación ha sido refactorizada completamente a **Next.js**, integrando la lógica frontend y backend en un único ecosistema seguro y de alto rendimiento.

---

## 🚀 Características Principales

*   **Acceso Exclusivo**: Puertas cerradas resguardadas mediante un sistema de llaves de invitación.
*   **Afinidad Élite**: Algoritmo de matching basado en especialización académica, afinidad generacional y una semilla aleatoria de afinidad ("gremio alquímico").
*   **Correspondencia Privada**: Sistema de chats privados en tiempo real y lectura de correspondencia una vez que se concreta un match mutuo.
*   **Retratos Personalizados**: Carga y almacenamiento seguro de avatares en Supabase Storage.
*   **Identidad Exclusiva**: Rangos de usuario asignados (Postulante, Heredero, Fundador).

---

## 🛠️ Tecnologías Utilizadas

*   **Framework**: [Next.js](https://nextjs.org/) (App Router & Route Handlers)
*   **Librería UI**: `@gruand-co/core` (diseño premium de componentes interactivos)
*   **Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL & Storage)
*   **Autenticación**: [Firebase Auth](https://firebase.google.com/) (Frontend) & [Firebase Admin SDK](https://firebase.google.com/docs/admin) (Backend token verification)
*   **Animaciones**: [Framer Motion](https://www.framer.com/motion/)

---

## 📁 Estructura del Proyecto

El código fuente principal se encuentra dentro del directorio `src/`:

```bash
├── apps/                    # Aplicaciones antiguas (Express API & Web original en Vite)
├── public/                  # Archivos estáticos e iconos
└── src/
    ├── app/                 # Páginas y API Route Handlers de Next.js
    │   ├── api/             # API Endpoints (conversations, invitations, members, swipe)
    │   ├── auth/            # Rutas de autenticación
    │   ├── conversations/   # Mensajería y correspondencia
    │   ├── invitations/     # Forjado y control de sellos de invitación
    │   ├── invite/          # Entrada restringida (puerta de la bóveda)
    │   ├── login/           # Acceso de miembros
    │   ├── profile/         # Perfil de usuario y semblanza
    │   └── register/        # Admisión de nuevos miembros
    ├── components/          # Componentes de UI reactivos (Header, Navbar, IdentityCard, etc.)
    ├── context/             # AuthContext de Firebase
    ├── lib/                 # Utilidades backend (Supabase client, Firebase Admin & checkAuth)
    ├── services/            # Clientes API frontend (Firebase client y peticiones fetch)
    └── types/               # Tipos TypeScript compartidos
```

---

## 🔧 Configuración e Instalación

### 1. Clonar el repositorio e instalar dependencias

```bash
npm install
```

### 2. Variables de entorno (`.env.local`)

Crea un archivo `.env.local` en la raíz del proyecto con la siguiente estructura:

```env
# Supabase Configuration
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="your-firebase-admin-email"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----"

# Postgres Direct Connection (for scripts/migrations)
POSTGRES_URL_NON_POOLING="postgres://postgres:password@host:5432/postgres?sslmode=require"
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🗄️ Esquema de Base de Datos

Las tablas y relaciones clave en la base de datos Supabase son:

### 1. `members` (Miembros del Club)
*   `id` (`uuid`, PK, default `gen_random_uuid()`)
*   `email` (`text`, unique)
*   `full_name` (`text`)
*   `sex` (`text` — 'M' o 'F')
*   `major` (`text`)
*   `graduation_year` (`integer`)
*   `bio` (`text`)
*   `avatar_url` (`text`)
*   `is_verified` (`boolean`, default `false`)
*   `university` (`text`, default 'The Vault')
*   `random_seed` (`integer`)
*   `created_at` (`timestamp with time zone`)

### 2. `swipes` (Interacciones de Afinidad)
*   `id` (`uuid`, PK)
*   `swiper_id` (`uuid`, FK -> `members.id`)
*   `swiped_id` (`uuid`, FK -> `members.id`)
*   `is_like` (`boolean`)
*   `created_at` (`timestamp with time zone`)

### 3. `conversations` (Lazos Forjados)
*   `id` (`uuid`, PK)
*   `user_1` (`uuid`, FK -> `members.id`)
*   `user_2` (`uuid`, FK -> `members.id`)
*   `created_at` (`timestamp with time zone`)

### 4. `messages` (Correspondencia)
*   `id` (`uuid`, PK)
*   `conversation_id` (`uuid`, FK -> `conversations.id`)
*   `sender_id` (`uuid`, FK -> `members.id`)
*   `content` (`text`)
*   `is_read` (`boolean`, default `false`)
*   `created_at` (`timestamp with time zone`)

### 5. `invitations` (Sellos de Admisión)
*   `id` (`uuid`, PK)
*   `code` (`text`, unique)
*   `created_by` (`uuid`, FK -> `members.id`)
*   `status` (`text`, default 'active')
*   `created_at` (`timestamp with time zone`)

---

## 📦 Despliegue en Vercel

Para desplegar la aplicación en Vercel, asegúrate de añadir todas las variables de entorno listadas en el apartado `.env.local` en la sección de Variables de Entorno de tu proyecto en Vercel.

Luego, puedes compilar localmente para verificar que todo esté en orden:

```bash
npm run build
```
