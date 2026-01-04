---
description: Repository Information Overview
alwaysApply: true
---

# Tombola_2.0 Information

## Summary
Tombola_2.0 is a real-time web application for playing the traditional Italian game of Tombola. It uses Next.js for the frontend and a custom Node.js server with Socket.io to manage game state, player connections, and number drawing in real-time. The project is designed with a focus on simplicity and is documented for deployment on low-resource devices like the Raspberry Pi Zero W.

## Structure
- **pages/**: Contains the main application routes, including the host dashboard (`tombolone.js`), player cards (`cartelle.js`), and game settings (`impostazioni.js`).
- **components/**: UI components such as `Snowflakes.js` for visual effects.
- **utils/**: Core game logic, including number generation (`tombola.js`) and the "Smorfia" association mapping (`smorfia.js`).
- **server.js**: The main entry point for the custom server, handling HTTP requests via Next.js and real-time communication via Socket.io.
- **start_server.js**: A utility script to manage starting and stopping the server process.
- **styles/**: Global CSS and Tailwind CSS configurations.

## Language & Runtime
**Language**: JavaScript  
**Runtime**: Node.js  
**Build System**: Next.js Build  
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- `next`: ^12.3.4 (Frontend Framework)
- `react`: ^17.0.2 (UI Library)
- `socket.io`: ^4.8.3 (Real-time Backend)
- `socket.io-client`: ^4.8.3 (Real-time Frontend)
- `express`: ^5.2.1 (Web Server)
- `canvas-confetti`: ^1.9.4 (UI Effects)
- `lucide-react`: ^0.562.0 (Icons)

**Development Dependencies**:
- `tailwindcss`: ^3.3.0 (CSS Framework)
- `vite`: ^7.3.0 (Asset Tooling)
- `postcss`: ^8.4.21
- `autoprefixer`: ^10.4.14

## Build & Installation
```bash
# Install dependencies
npm install

# Build the Next.js application
npm run build

# Start the application in production mode
npm start
```

## Usage & Operations
The application can be run in development mode using `npm run dev`, which executes `node server.js`. For deployment on Raspberry Pi or similar devices, `start_server.js` is provided to manage the server process effectively.

**Main Entry Points**:
- `server.js`: Custom server implementation.
- `pages/index.js`: Main landing page.

## Testing
No automated testing framework is currently configured in this repository. Verification is performed manually by running the application and checking the Socket.io interactions between the "Tombolone" and "Cartelle" pages.
