#!/bin/bash

# Script per copiare i file di configurazione nelle rispettive cartelle
# Uso: ./copy_configs.sh

echo "→ Copia dei file di configurazione nelle rispettive cartelle"

# Crea la directory per wpa_supplicant se non esiste
mkdir -p /etc/wpa_supplicant

# Copia i file di configurazione
cp wpa_supplicant-client.conf /etc/wpa_supplicant/wpa_supplicant-client.conf
cp dhcpcd-ap.conf /etc/dhcpcd-ap.conf
cp dhcpcd-client.conf /etc/dhcpcd-client.conf

echo "✔ File di configurazione copiati con successo in:"
echo "  - /etc/wpa_supplicant/wpa_supplicant-client.conf"
echo "  - /etc/dhcpcd-ap.conf"
echo "  - /etc/dhcpcd-client.conf"