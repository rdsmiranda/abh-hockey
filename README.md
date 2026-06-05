# ABH Hockey — Asociación Bahiense de Hockey

Aplicación web estática para la Comisión de Árbitros de la ABH.
Construida con **Vue 3 + TypeScript + Vite + Pinia + Tailwind CSS v4**.

---

## Requisitos

| Herramienta | Versión mínima |
|-------------|---------------|
| Node.js     | 18.x o superior |
| npm         | 9.x o superior  |

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/abh-hockey.git
cd abh-hockey

# 2. Instalar dependencias
npm install
```

---

## Desarrollo local

```bash
npm run dev
```

La app queda disponible en `http://localhost:5173`.

Los archivos JSON de `public/data/` se sirven directamente.
Cualquier cambio en `.vue`, `.ts` o `.css` recarga el navegador automáticamente.

---

## Build para producción

```bash
npm run build
```

Genera la carpeta `dist/` con todos los assets optimizados.
Para previsualizar el build localmente:

```bash
npm run preview
```

---

## Deploy en GitHub Pages

### Configuración inicial (una sola vez)

1. Editá `vite.config.ts` y cambiá el nombre del repositorio:

```ts
base: process.env.NODE_ENV === 'production' ? '/NOMBRE-DE-TU-REPO/' : '/',
```

2. En GitHub: **Settings → Pages → Source → GitHub Actions** (o `gh-pages` branch).

### Deploy manual con gh-pages

```bash
npm run deploy
```

Este comando ejecuta `npm run build && gh-pages -d dist`.

### Deploy automático con GitHub Actions

Creá el archivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## Actualizar datos

Los datos vienen de archivos JSON en `public/data/`.
**No es necesario modificar código para actualizar posiciones o designaciones.**

### Estructura de archivos

```
public/data/
├── index.json                    # Lista de campeonatos disponibles
├── torneo-apertura-2025.json     # Datos de un campeonato
├── designations-index.json       # Apunta al archivo de designaciones activo
└── designaciones-2025-06.json    # Designaciones del período actual
```

### Agregar un nuevo campeonato

1. Crear `public/data/torneo-clausura-2025.json` con la estructura correcta.
2. Agregar una entrada en `public/data/index.json`:

```json
[
  { "file": "torneo-apertura-2025.json",  "label": "Torneo Apertura 2025" },
  { "file": "torneo-clausura-2025.json",  "label": "Torneo Clausura 2025" }
]
```

3. Deploy.

### Actualizar designaciones

1. Crear `public/data/designaciones-2025-07.json` con los nuevos datos.
2. Actualizar `public/data/designations-index.json`:

```json
{ "file": "designaciones-2025-07.json" }
```

3. Deploy.

---

## Estructura del proyecto

```
src/
├── main.ts                   # Punto de entrada
├── App.vue                   # Shell de la app (layout global)
├── router/
│   └── index.ts              # Vue Router con hash history
├── types/
│   ├── championship.ts       # Interfaces de posiciones y zonas
│   ├── playoff.ts            # Interfaces de playoffs
│   ├── designation.ts        # Interfaces de designaciones
│   └── index.ts              # Re-exports
├── services/
│   ├── http.ts               # fetch wrapper tipado
│   ├── standings.service.ts  # Acceso a datos de posiciones
│   └── designations.service.ts
├── stores/
│   ├── standings.store.ts    # Estado global de posiciones (Pinia)
│   └── designations.store.ts # Estado global de designaciones (Pinia)
├── composables/
│   ├── useTeamLookup.ts      # Caché de equipos indexada por ID
│   └── useFormBadge.ts       # Lógica del hover card
├── pages/
│   ├── StandingsPage.vue     # Página de posiciones
│   └── DesignationsPage.vue  # Página de designaciones
└── components/
    ├── layout/               # AppHeader, AppNav
    ├── standings/            # StandingsTable, TeamCell, FormBadge, CategoryTabs
    ├── designations/         # MatchCard, DaySection, ZoneFilterButtons
    ├── playoffs/             # PlayoffBracket, KOBracket, HomeAndAwayBracket, GroupBracket
    └── ui/                   # AppSelect, Combobox, StateBanner, HoverCard
```

---

## Agregar nuevas secciones (futuro)

El patrón para agregar **goleadoras**, **fixtures**, **ranking de árbitros**, etc. es siempre el mismo:

1. Definir tipos en `src/types/nueva-seccion.ts` y re-exportar en `src/types/index.ts`.
2. Crear `src/services/nueva-seccion.service.ts`.
3. Crear `src/stores/nueva-seccion.store.ts`.
4. Crear `src/pages/NuevaSeccionPage.vue`.
5. Agregar la ruta en `src/router/index.ts`.
6. Agregar el tab en `src/components/layout/AppNav.vue`.

---

## Scripts disponibles

| Comando           | Descripción                          |
|-------------------|--------------------------------------|
| `npm run dev`     | Servidor de desarrollo con HMR       |
| `npm run build`   | Build de producción en `dist/`       |
| `npm run preview` | Previsualizar el build localmente    |
| `npm run typecheck` | Verificar tipos sin compilar       |
| `npm run deploy`  | Build + deploy a GitHub Pages        |
