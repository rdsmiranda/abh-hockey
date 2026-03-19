# Resultados ABH

Sitio estático para consultar las posiciones y resultados de los torneos de la **Asociación Bahiense de Hockey**.

Los datos se generan desde el sistema de gestión interno ([Laravel](https://laravel.com)) y se publican como archivos JSON estáticos. El sitio consume esos archivos del lado del cliente, sin necesidad de servidor.

---

## Estructura del proyecto

```
standings-site/
├── index.html              # Sitio principal
├── Escudo_ABH.png          # Logo de la asociación
├── assets/
│   ├── tailwind.css        # CSS compilado (generado, no editar)
│   └── logos/              # Logos de clubes (copiados por el comando Artisan)
├── data/
│   ├── index.json          # Índice de campeonatos publicados
│   └── apertura-2026.json  # Ejemplo de archivo de posiciones
├── src/
│   └── input.css           # Entrada de Tailwind (no se sube al repo)
├── package.json
├── .gitignore
└── README.md
```

---

## Requisitos

- [Node.js](https://nodejs.org/) (incluido con [Laravel Herd](https://herd.laravel.com/))

---

## Instalación

Clonar el repositorio e instalar las dependencias:

```bash
git clone https://github.com/rdsmiranda/resultados-abh.git
cd resultados-abh
npm install
```

---

## Tailwind CSS

El proyecto usa **Tailwind CSS v4** con el CLI oficial. El archivo `assets/tailwind.css` es generado a partir de `src/input.css` y commiteado al repo — no se genera en producción.

### Compilar CSS (una vez)

```bash
npm run build:css
```

### Compilar CSS en modo watch (durante desarrollo)

```bash
npm run watch:css
```

> Siempre correr `npm run build:css` antes de hacer commit si se modificó el `index.html`, para que el CSS refleje las clases utilizadas.

### Contenido de `src/input.css`

```css
@import "tailwindcss";
@source "../index.html";
```

---

## Publicación de datos

Los datos se generan desde el sistema Laravel con el comando:

```bash
php artisan export:standings {id_campeonato}
```

Este comando:
1. Consulta las posiciones del campeonato indicado
2. Genera el archivo JSON en la carpeta configurada en `.env` (`STANDINGS_EXPORT_PATH`)
3. Copia los logos de los clubes a `assets/logos/`

### Actualizar el índice de campeonatos

El archivo `data/index.json` lista los campeonatos disponibles en el selector. Actualizarlo manualmente al publicar un nuevo campeonato:

```json
[
  { "file": "apertura-2026.json", "label": "Apertura 2026" },
  { "file": "clausura-2025.json", "label": "Clausura 2025" }
]
```

### Flujo completo de actualización

```bash
# 1. Generar el JSON desde Laravel (en el proyecto Laravel)
php artisan export:standings 1

# 2. Copiar el JSON generado a la carpeta data/ de este repo

# 3. Actualizar data/index.json si es un campeonato nuevo

# 4. Compilar el CSS si hubo cambios en index.html
npm run build:css

# 5. Commitear y pushear
git add .
git commit -m "update standings"
git push origin main
```

---

## GitHub Pages

El sitio se publica automáticamente en GitHub Pages desde la rama `main`.

URL: `https://rdsmiranda.github.io/resultados-abh/`

---

## .gitignore

```
node_modules/
src/
```