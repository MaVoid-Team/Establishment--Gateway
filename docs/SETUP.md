# Developer setup

This project started from the default React + Vite template. The original README content is preserved below.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Layout

- `frontend/` — Vite + React app (Liwan Portal)
- `backend/` — Express API

## Frontend

From `frontend/`:

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

The Vite `base` path is `/Establishment--Gateway/` (GitHub Pages). Pushing to `main` runs `.github/workflows/deploy.yml`, which builds `frontend/` and publishes `frontend/dist`.

## Backend

From `backend/`:

```bash
npm install
npm start
```
