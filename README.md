<div align="center">

# 🛋️ DecoraIA · Frontend

**Toma una foto de tu cuarto y deja que la inteligencia artificial te proponga cómo remodelarlo.**

Interfaz web del proyecto final de **Patrones de Diseño**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
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

- Estado en vivo de **frontend**, **backend** y **base de datos** (Hello World de cada capa).
- Una demo de **remodelación**: URL de la foto + estilo → propuesta generada por la IA.

## 🧩 Patrones de diseño

| Patrón | Dónde | Para qué |
|---|---|---|
| **Singleton** | [`src/api/ApiClient.js`](src/api/ApiClient.js) | Un único cliente HTTP con la URL del backend, compartido por todos los componentes. |

Los demás patrones del proyecto (Builder, Abstract Factory, Adapter, Decorator) viven en el backend; ver su README.

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
| Never Melo | _@usuario_ |
