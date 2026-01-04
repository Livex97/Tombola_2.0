#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

// Nome del file del server
const serverFile = 'server.js';

// Funzione per verificare se il server è già in esecuzione
function isServerRunning(callback) {
  const command = process.platform === 'win32' 
    ? `tasklist | findstr node.exe` 
    : `ps aux | grep "node ${serverFile}" | grep -v grep`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      return callback(false);
    }
    callback(stdout.trim() !== '');
  });
}

// Funzione per avviare il server
function startServer() {
  console.log('Avvio del server...');
  const serverProcess = exec(`node ${serverFile}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Errore durante l'avvio del server: ${error.message}`);
      return;
    }
    console.log(`Server avviato con successo.`);
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(data);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(data);
  });
}

// Funzione per chiudere il server
function stopServer(callback) {
  const command = process.platform === 'win32' 
    ? `taskkill /IM node.exe /F` 
    : `pkill -f "node ${serverFile}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Errore durante la chiusura del server: ${error.message}`);
      return callback(false);
    }
    console.log('Server chiuso con successo.');
    callback(true);
  });
}

// Gestione del processo
isServerRunning((running) => {
  if (running) {
    console.log('Server già in esecuzione. Chiusura in corso...');
    stopServer((success) => {
      if (success) {
        startServer();
      } else {
        console.error('Impossibile chiudere il server.');
      }
    });
  } else {
    startServer();
  }
});