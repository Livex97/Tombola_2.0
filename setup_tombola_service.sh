#!/bin/bash

# Crea il file di servizio systemd
SERVICE_FILE="/etc/systemd/system/tombola.service"

cat <<EOL > $SERVICE_FILE
[Unit]
Description=Tombola Service
After=network.target

[Service]
ExecStart=/usr/local/lib/nodejs/node-v21.7.3-linux-armv6l/bin/node /root/Tombola_RpiZeroW/server.js
Restart=always
User=root
Group=root
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
WorkingDirectory=/root/Tombola_RpiZeroW

[Install]
WantedBy=multi-user.target
EOL

# Ricarica systemd per riconoscere il nuovo servizio
systemctl daemon-reload

# Abilita il servizio per l'avvio automatico
systemctl enable tombola.service

# Avvia il servizio
systemctl start tombola.service

echo "Servizio tombola.service creato, abilitato e avviato con successo."