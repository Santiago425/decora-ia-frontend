<div align="center">

# Habita · Frontend

**Diseño de interiores con inteligencia artificial y modelado 3D.**

Proyecto final de **Patrones de Diseño**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-R3F-000000?logo=threedotjs&logoColor=white)
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
| 2 | Dashboard y diseño visual general | ✅ |
| 3 | Rediseño con foto y comparador antes/después | ✅ |
| 4 | Editor 3D | ✅ |
| 5 | Lumi con voz y texto | ✅ |
| 6 | Administrador, Mis proyectos y Documentación | ⏳ |
| 7 | Pruebas, README final y despliegue | ⏳ |

## Patrones aplicados en el frontend

| Patrón | Tipo | Dónde | Para qué |
|---|---|---|---|
| **Singleton** | Creacional | [`src/services/apiClient.ts`](src/services/apiClient.ts) | Un único cliente HTTP con el token de la sesión para toda la app. |
| **Observer** | Comportamiento | [`src/services/notificationCenter.ts`](src/services/notificationCenter.ts) | Cualquier parte de la app publica un aviso y los suscriptores (como el `Toaster`) reaccionan sin conocerse entre sí. |
| **Proxy** | Estructural | [`src/components/ImageProxy.tsx`](src/components/ImageProxy.tsx) | Ocupa el lugar de la imagen real: la carga solo cuando entra en pantalla y muestra un marcador mientras tanto. |
| **Command** | Comportamiento | [`src/editor/commands.ts`](src/editor/commands.ts) | Agregar, mover, rotar, eliminar, cambiar color o complementos, agrupar y restaurar versiones son objetos que saben aplicarse y revertirse: así funcionan deshacer y rehacer (Ctrl + Z / Ctrl + Y). |
| **Factory Method** | Creacional | [`src/editor/furnitureFactory.ts`](src/editor/furnitureFactory.ts) | Cada tipo de mueble (sofá, cama, mesa, silla, lámpara, planta…) tiene su fábrica que decide de qué piezas 3D está hecho; la forma viene de la categoría guardada en la base de datos. |
| **Composite** | Estructural | [`src/editor/composite.ts`](src/editor/composite.ts) | Un mueble, un grupo de muebles y la habitación completa se cotizan, cuentan, mueven y duplican de la misma forma. |
| **Prototype** | Creacional | [`src/editor/composite.ts`](src/editor/composite.ts) | Duplicar un mueble o un grupo clona la pieza con identificadores nuevos. |
| **Decorator** | Estructural | [`src/editor/furnitureDecorators.ts`](src/editor/furnitureDecorators.ts) | Cojines, manta, cubierta de vidrio, patas de latón o luz LED envuelven al mueble y le suman precio y apariencia sin modificar su clase. |
| **Abstract Factory** | Creacional | [`src/editor/styleTheme.ts`](src/editor/styleTheme.ts) | `StyleThemeFactory`: cada estilo produce una familia coherente de luz, acabado de paredes, piso y colores de acento. |
| **Observer** | Comportamiento | [`src/editor/editorStore.ts`](src/editor/editorStore.ts) | El lienzo 3D, los paneles y la barra de herramientas se suscriben al estado del editor y se actualizan cuando cambia la escena. |
| **Adapter** | Estructural | [`src/assistant/voiceAdapter.ts`](src/assistant/voiceAdapter.ts) | `VoiceAdapter` envuelve el reconocimiento de voz y la síntesis del navegador (con nombres distintos según el navegador) en una interfaz simple: escuchar, hablar y detener. |
| **Observer** | Comportamiento | [`src/assistant/assistantBus.ts`](src/assistant/assistantBus.ts) | Lumi publica sus acciones y quien puede ejecutarlas se suscribe: el enrutador abre páginas y proyectos, el editor 3D agrega muebles, cambia paredes, luz o estilo y deshace. |
| **Observer** | Comportamiento | [`src/assistant/chatStore.ts`](src/assistant/chatStore.ts) | El chat flotante y la página de Lumi comparten la misma conversación y se mantienen sincronizados. |

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
| `VITE_ASSISTANT_NAME` | Nombre de la asistente (el reconocimiento y la voz usan `VITE_LOCALE`) |
| `VITE_API_URL` / `VITE_API_PREFIX` | Dirección del backend |
| `VITE_REQUEST_TIMEOUT_MS` | Tiempo máximo de espera de una petición |
| `VITE_AI_TIMEOUT_MS` | Tiempo máximo de espera de un rediseño con IA |
| `VITE_MAX_PHOTO_SIDE` | Tamaño máximo al que se reduce la foto antes de subirla |
| `VITE_CURRENCY` / `VITE_LOCALE` | Moneda y formato de precios |
| `VITE_EDITOR_SNAP`, `VITE_EDITOR_MOVE_STEP`, `VITE_EDITOR_ROTATE_STEP` | Cuadrícula, paso al mover con flechas y grados al rotar en el editor 3D |
| `VITE_EDITOR_HISTORY_LIMIT`, `VITE_EDITOR_AUTOSAVE_MS`, `VITE_EDITOR_DUPLICATE_OFFSET` | Pasos que se pueden deshacer, espera del guardado automático y separación de una copia |
| `VITE_AUTH_IMAGE_URL` | Foto de fondo del login |
| `VITE_DASHBOARD_BANNER_URL` | Foto del banner del inicio |
| `VITE_PHOTO_CREDITS_NAME` / `VITE_PHOTO_CREDITS_URL` | Créditos de las fotos |

## Estructura

```
src/
├── config.ts        Configuración leída de VITE_*
├── pages/           Login, Register, Dashboard…
├── components/layout/ Menú lateral y menú inferior del celular
├── components/dashboard/ Tarjetas, gráfica, actividad y proyectos
├── components/editor/ Lienzo 3D (React Three Fiber), catálogo, propiedades y versiones
├── editor/          Lógica del editor 3D: comandos, fábricas, composite, decoradores, temas
├── components/assistant/ Chat de Lumi, botón flotante y ejecutor de acciones
├── assistant/       Voz (Adapter), bus de acciones y conversación (Observer)
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
