# OVERWATCH

Geopolitical Energy Intelligence Platform — an interactive 3D globe application for visualizing global energy infrastructure, geopolitical crisis impacts, and supply chain disruptions.

## Overview

Overwatch renders a full-screen CesiumJS 3D globe with a dark command-center aesthetic. Overlay panels provide layer controls, location search, and real-time status indicators. The application is designed as an extensible platform where data layers (facilities, pipelines, chokepoints, airspace, commodities, satellites) can be toggled on and off independently.

### Key Features

- **3D Globe** — CesiumJS with world terrain, globe lighting, dark theme background (`#0a0e17`), initial camera focused on the Strait of Hormuz region
- **Glass-morphism UI** — All overlay panels use backdrop-filter blur with translucent backgrounds and subtle cyan glow effects
- **Layer System** — Extensible `ILayer` interface + `LayerRegistry` singleton for registering, toggling, and broadcasting events across layers
- **Location Search** — Nominatim geocoding with 300ms debounce; selecting a result flies the camera to that location
- **Layer Panel** — Collapsible top-right panel with toggle switches for each layer; locked layers display a "Coming Soon" badge
- **State Management** — Zustand stores for layer visibility, entity selection, and camera/view state

### Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 6 |
| 3D Globe | CesiumJS |
| Styling | Tailwind CSS 4 |
| State | Zustand 5 |
| Fonts | JetBrains Mono, IBM Plex Sans |

## Project Structure

```
src/
├── components/
│   ├── Globe.tsx          # Full-screen CesiumJS viewer
│   ├── Header.tsx         # "OVERWATCH" logo + LIVE indicator
│   ├── LayerPanel.tsx     # Layer toggles (top-right)
│   ├── SearchBar.tsx      # Location search with Nominatim
│   └── ui/
│       ├── GlassPanel.tsx   # Reusable glass-morphism wrapper
│       ├── ToggleSwitch.tsx # ON/OFF/Disabled toggle
│       └── StatusBadge.tsx  # Color-coded status indicator
├── layers/
│   ├── LayerRegistry.ts   # Singleton layer manager
│   └── base/
│       └── BaseLayer.ts   # Abstract base class for layers
├── stores/
│   ├── layerStore.ts      # Layer enabled/locked state
│   ├── selectionStore.ts  # Selected facility tracking
│   └── viewStore.ts       # Camera/view state + viewer ref
├── types/
│   ├── layer.ts           # ILayer interface, LayerEvent
│   ├── facility.ts        # Facility, SubFacility types
│   └── infrastructure.ts  # Pipeline, Chokepoint types
├── constants/
│   └── theme.ts           # JS color tokens
├── App.tsx
├── main.tsx
└── index.css              # CSS variables + Tailwind import
```

## Getting Started

### Prerequisites

- **Node.js** 18+ (20 LTS recommended)
- **npm** 9+
- A **Cesium Ion** access token (already configured in `.env`)

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

Output goes to the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment

### Option 1: Vercel (Recommended)

Vercel handles Vite projects out of the box with zero configuration.

**Step 1 — Install the Vercel CLI**

```bash
npm install -g vercel
```

**Step 2 — Login**

```bash
vercel login
```

**Step 3 — Deploy**

```bash
vercel
```

Follow the prompts. Vercel auto-detects Vite and sets the correct build command (`npm run build`) and output directory (`dist`).

**Step 4 — Set the environment variable**

Go to your Vercel project dashboard > Settings > Environment Variables, and add:

```
VITE_CESIUM_ION_TOKEN = <your token>
```

> Environment variables prefixed with `VITE_` are embedded at build time, so you need to redeploy after adding the variable.

**Step 5 — Redeploy with the variable**

```bash
vercel --prod
```

---

### Option 2: Netlify

**Step 1 — Install the Netlify CLI**

```bash
npm install -g netlify-cli
```

**Step 2 — Login**

```bash
netlify login
```

**Step 3 — Initialize**

```bash
netlify init
```

Set the following when prompted:

- Build command: `npm run build`
- Publish directory: `dist`

**Step 4 — Set the environment variable**

```bash
netlify env:set VITE_CESIUM_ION_TOKEN "<your token>"
```

**Step 5 — Deploy**

```bash
netlify deploy --prod
```

---

### Option 3: Static Hosting (Nginx, Apache, S3, etc.)

Since this is a single-page application with client-side routing, you can host the `dist/` folder on any static file server.

**Step 1 — Build**

```bash
npm run build
```

**Step 2 — Upload the `dist/` directory** to your hosting provider.

**Step 3 — Configure SPA fallback** so all routes serve `index.html`:

**Nginx example:**

```nginx
server {
    listen 80;
    server_name overwatch.example.com;
    root /var/www/overwatch/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Step 4 — Ensure the Cesium Ion token** was set in `.env` before running `npm run build`. The token is baked into the JS bundle at build time.

---

### Option 4: Docker

**Step 1 — Create a `Dockerfile`** in the project root:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Step 2 — Build and run**

```bash
docker build -t overwatch .
docker run -p 8080:80 overwatch
```

The app will be available at `http://localhost:8080`.

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `VITE_CESIUM_ION_TOKEN` | Cesium Ion access token for terrain and imagery | Yes |

## License

Private — All rights reserved.
