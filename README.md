<div align="center">

# Habita · Frontend

**Diseño de interiores con inteligencia artificial y modelado 3D.**

Proyecto final de **Patrones de Diseño**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)

</div>

## ¿En qué consiste?

**Habita** permite tomar o subir una foto de un espacio, elegir un estilo y ver cómo quedaría rediseñado por la IA, armar el espacio en un editor 3D con muebles reales del catálogo, calcular un presupuesto y guardar proyectos. **Lumi**, la asistente, guía al usuario por voz o texto.

| Componente | Repositorio | Producción |
|---|---|---|
| Frontend | [decora-ia-frontend](https://github.com/Santiago425/decora-ia-frontend) | https://decora-ia-frontend.vercel.app |
| Backend | [decora-ia-backend](https://github.com/Santiago425/decora-ia-backend) | https://decora-ia-backend.onrender.com/api/v1/hello |

## Avance

| Fase | Contenido | Estado |
|---|---|---|
| 1 | Estructura, configuración, autenticación y login centrado | ✅ |
| 2 | Dashboard y diseño visual general | ⏳ |
| 3 | Rediseño con foto y comparador antes/después | ⏳ |
| 4 | Editor 3D | ⏳ |
| 5 | Lumi con voz y texto | ⏳ |
| 6 | Administrador, Mis proyectos y Documentación | ⏳ |
| 7 | Pruebas, README final y despliegue | ⏳ |

## Patrones aplicados en el frontend

| Patrón | Tipo | Dónde | Para qué |
|---|---|---|---|
| **Singleton** | Creacional | [`src/services/apiClient.ts`](src/services/apiClient.ts) | Un único cliente HTTP con el token de la sesión para toda la app. |
| **Observer** | Comportamiento | [`src/context/AuthContext.tsx`](src/context/AuthContext.tsx) | Las pantallas se suscriben a la sesión y se actualizan solas al entrar o salir. |

## Cuentas de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Usuario | `usuario@habita.app` | `Habita2026` |
| Administrador | `admin@habita.app` | `Habita2026` |

Las crea el script de semilla del backend; la contraseña sale de la variable `DEMO_PASSWORD`.

## Ejecutar en local

```bash
npm install
cp .env.example .env
npm run dev        # http://localhost:5173
npm test
npm run build
```

## Variables de entorno

Todas están documentadas en [`.env.example`](.env.example) y se leen en un único módulo: [`src/config.ts`](src/config.ts).

| Variable | Para qué |
|---|---|
| `VITE_APP_NAME` | Nombre de la app en la interfaz |
| `VITE_ASSISTANT_NAME` | Nombre de la asistente |
| `VITE_API_URL` / `VITE_API_PREFIX` | Dirección del backend |
| `VITE_REQUEST_TIMEOUT_MS` | Tiempo máximo de espera de una petición |
| `VITE_CURRENCY` / `VITE_LOCALE` | Moneda y formato de precios |
| `VITE_AUTH_IMAGE_URL` | Foto de fondo del login |
| `VITE_PHOTO_CREDITS_NAME` / `VITE_PHOTO_CREDITS_URL` | Créditos de las fotos |

## Estructura

```
src/
├── config.ts        Configuración leída de VITE_*
├── pages/           Login, Register, inicio…
├── components/      Piezas reutilizables de la interfaz
├── context/         Sesión del usuario
├── hooks/           Hooks propios
├── services/        Cliente API y servicios
├── styles/          Tokens de diseño y estilos
├── types/           Tipos compartidos
└── utils/           Validaciones
```

## Equipo

| Integrante | GitHub |
|---|---|
| Santiago Campoverde | [@Santiago425](https://github.com/Santiago425) |
| Never Melo | [@neber18](https://github.com/neber18) |
