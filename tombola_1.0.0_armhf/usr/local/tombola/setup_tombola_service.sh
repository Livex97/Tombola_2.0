#!/bin/bash

# Crea il file di servizio systemd
SERVICE_FILE="/etc/systemd/system/tombola.service"

cat <<EOL > $SERVICE_FILE
[Unit]
Description=Tombola Service
After=network.target

[Service]
ExecStart=NODE_PATH_PLACEHOLDER server.js
Restart=always
User=root
Group=root
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
WorkingDirectory=/usr/local/tombola/

[Install]
WantedBy=multi-user.target
EOL

# Trova il percorso reale di node sul sistema dell'utente
NODE_PATH=$(which node || which nodejs)

# Sostituisce il segnaposto nel file del servizio appena installato
if [ -n "$NODE_PATH" ]; then
    sed -i "s|NODE_PATH_PLACEHOLDER|$NODE_PATH|" /etc/systemd/system/tombola.service
fi

# Ricarica systemd per riconoscere il nuovo servizio
systemctl daemon-reload

# Abilita il servizio per l'avvio automatico
systemctl enable tombola.service

# Avvia il servizio
systemctl start tombola.service

echo "Servizio tombola.service creato, abilitato e avviato con successo."