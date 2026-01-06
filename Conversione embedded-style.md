# 🎯 Conversione *embedded-style* di **Tombola 2.0** per Raspberry Pi Zero W

Questa guida è **specifica per la repository**:
👉 [https://github.com/Livex97/Tombola_2.0](https://github.com/Livex97/Tombola_2.0)

L’obiettivo è far girare **Tombola 2.0 in modo stabile e fluido** su **Raspberry Pi Zero W**, eliminando tutto ciò che è inutile o troppo pesante (Next.js server, build tools, SSR).

---

## 🧠 Concetto chiave (da fissare subito)

* **Mac** → sviluppa e *builda*
* **Raspberry Pi Zero W** → *serve* e *comunica*

Sul Pi **NON** devono girare:

* Next.js server
* build (`next build`, `vite`, `tailwind`)
* devDependencies

Sul Pi devono girare **solo**:

* Node 18 ARMv6
* Express
* Socket.io
* File statici (HTML / JS / CSS)

---

## 🗂 Stato iniziale del progetto

Il progetto attuale include:

* Next.js 12 (React 17)
* Express custom server
* Socket.io
* UI React con Tailwind

👉 **Così com’è, è troppo pesante per Pi Zero W**.

---

# 🔹 FASE 1 — Preparazione del frontend (Mac)

### 1️⃣ Disattivare ogni logica server-side

Nel codice **Next.js**, elimina o evita:

* `getServerSideProps`
* API Routes (`/pages/api/*`)
* Middleware Next
* SSR

Usa solo:

* `getStaticProps`
* `useEffect`
* chiamate `fetch()` verso Express

---

### 2️⃣ Configurare Next per export statico

Modifica / crea `next.config.js`:

```js
/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  reactStrictMode: false,
  images: {
    unoptimized: true
  }
}
```

---

### 3️⃣ Build statica (SOLO su Mac)

```bash
npm install
npm run build
npm run export
```

Alla fine otterrai:

```
out/
├── index.html
├── _next/
├── assets/
```

📌 **Questa cartella è il frontend definitivo per il Pi**.

---

# 🔹 FASE 2 — Backend embedded-style

## 4️⃣ Struttura finale sul Raspberry Pi

Sul Pi dovrai avere **solo questo**:

```
tombola-rpi/
├── server.js
├── package.json
└── public/
    ├── index.html
    ├── _next/
    └── assets/
```

---

## 5️⃣ `server.js` minimale (ottimizzato Pi Zero)

```js
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const path = require('path')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

// Serve frontend statico
app.use(express.static(path.join(__dirname, 'public')))

// API base
app.get('/api/status', (req, res) => {
  res.json({ ok: true })
})

// Socket.io
io.on('connection', socket => {
  console.log('Client connesso')

  socket.on('tombola:extract', data => {
    socket.broadcast.emit('tombola:update', data)
  })
})

server.listen(3000, () => {
  console.log('Tombola server avviato su porta 3000')
})
```

---

## 6️⃣ `package.json` (pulito)

```json
{
  "name": "tombola-rpi",
  "private": true,
  "type": "commonjs",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^5.2.1",
    "socket.io": "^4.8.3"
  }
}
```

❌ Nessuna `devDependency`

---

# 🔹 FASE 3 — Collegamento frontend ↔ backend

## 7️⃣ API

Nel frontend:

```js
fetch('/api/status')
```

❌ Non usare `localhost`
❌ Non usare IP hardcoded

---

## 8️⃣ Socket.io client

```js
import { io } from 'socket.io-client'

const socket = io()
```

📌 Usa solo WebSocket (no polling)

---

# 🔹 FASE 4 — Deployment su Raspberry Pi Zero W

## 9️⃣ Installazione Node

Assicurati di avere:

```bash
node -v
# v18.x ARMv6
```

---

## 🔟 Copia file sul Pi

Dal Mac copia:

* `server.js`
* `package.json`
* contenuto di `out/` → `public/`

---

## 1️⃣1️⃣ Installazione dipendenze

```bash
npm install --omit=dev
```

---

## 1️⃣2️⃣ Avvio

```bash
node server.js
```

Visita:

```
http://IP_RPI:3000
```

---

# 🔹 FASE 5 — Ottimizzazioni fondamentali per Pi Zero

✔ Evita log frequenti
✔ Niente `setInterval` rapidi
✔ JSON piccoli
✔ Socket events limitati
✔ Una sola istanza Node

---

# ❌ Cose da NON fare (importantissimo)

❌ `next start`
❌ `npm install` completo
❌ Docker
❌ PM2 multi-process
❌ Build sul Pi

---

# 🏁 Conclusione

Con questa conversione:

* Tombola 2.0 diventa **embedded-friendly**
* Il Pi Zero W resta stabile
* Gli aggiornamenti sono semplici
* Le prestazioni sono prevedibili

👉 **Questo è il modo corretto di usare un Raspberry Pi Zero come server web**.

---

## 🚀 Prossimi step possibili

* Avvio automatico con `systemd`
* Modalità kiosk
* Compressione asset
* Cache HTTP
