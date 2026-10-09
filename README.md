<div align="center">

# 🛋️ DecoraIA · Frontend

**Toma una foto de tu cuarto y deja que la inteligencia artificial te proponga cómo remodelarlo.**

Interfaz web del proyecto final de **Patrones de Diseño**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)

</div>

---

## 📌 ¿En qué consiste?

**DecoraIA** es una aplicación de diseño de interiores: subes una foto de tu cuarto, eliges un estilo (moderno, nórdico, industrial, bohemio o minimalista) y la IA te devuelve una propuesta de remodelación con imagen y sugerencias.

Este repositorio es el **frontend**. Se comunica con el backend por REST (`/api/v1`), que a su vez usa la base de datos y el componente de IA.

| Componente | Repositorio | URL en producción |
|---|---|---|
| Frontend | [decora-ia-frontend](https://github.com/Santiago425/decora-ia-frontend) | https://decora-ia-frontend.vercel.app |
| Backend | [decora-ia-backend](https://github.com/Santiago425/decora-ia-backend) | https://decora-ia-backend.onrender.com/api/v1/hello |

## ✨ Qué muestra hoy

- **Portada** con la propuesta de valor y un paso a paso de cómo funciona.
- **Estudio de remodelación**: foto del espacio con vista previa, tipo de espacio, estilo (tarjetas con su paleta), presupuesto, conservar muebles y hasta 5 colores preferidos.
- **Resultado** con comparador deslizante **antes / después**, análisis del espacio (luz y objetos detectados) y sugerencias de la IA.
- Sección de **patrones de diseño** aplicados en el proyecto.
- **Estado en vivo** de frontend, backend y base de datos, también visible en la barra superior.
- Diseño adaptable a celular, accesible con teclado y con estados de carga y error.

## 🧩 Patrones de diseño

| Patrón | Dónde | Para qué |
|---|---|---|
| **Singleton** | [`src/api/ApiClient.js`](src/api/ApiClient.js) | Un único cliente HTTP con la URL del backend, compartido por todos los componentes. |

Los demás patrones del proyecto (Builder, Abstract Factory, Adapter, Decorator) viven en el backend; ver su README.

## 🔒 Seguridad

| Medida | Dónde |
|---|---|
| Cabeceras HTTP seguras en Vercel: CSP, `X-Frame-Options`, `nosniff`, HSTS, `Referrer-Policy`, `Permissions-Policy` | [`vercel.json`](vercel.json) |
| Validación de la URL de la foto (solo `http`/`https`) antes de enviarla | [`src/utils/validation.js`](src/utils/validation.js) |
| Peticiones sin cookies, con tiempo máximo de espera y mensajes de error claros | [`src/api/ApiClient.js`](src/api/ApiClient.js) |
| Imágenes externas cargadas sin enviar *referrer* | [`src/components/SafeImage.jsx`](src/components/SafeImage.jsx) |
| React escapa todo el contenido (sin `dangerouslySetInnerHTML`) | Todos los componentes |
| Dependencias sin vulnerabilidades conocidas (`npm audit`) | [`package.json`](package.json) |

## 🚀 Ejecutar en local

```bash
npm install
cp .env.example .env.local   # VITE_API_URL apuntando al backend
npm run dev                  # http://localhost:5173
```

## ☁️ Despliegue

Desplegado en [Vercel](https://vercel.com) (framework Vite). Variable de entorno: `VITE_API_URL` con la URL del backend en Render. GitHub Actions compila el proyecto en cada push.

## 👥 Equipo

| Integrante | GitHub |
|---|---|
| Santiago Campoverde | [@Santiago425](https://github.com/Santiago425) |
| Never Melo | [@neber18](https://github.com/neber18) |
