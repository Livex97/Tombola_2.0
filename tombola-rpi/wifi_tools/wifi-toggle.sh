#!/bin/bash

# Script per il passaggio tra modalità AP e Client
# Uso: ./wifi-toggle.sh [ap|client]

if [ "$1" == "ap" ]; then
    echo "→ Passaggio a ACCESS POINT"
    
    # Ferma i servizi client
    systemctl stop wpa_supplicant 2>/dev/null
    
    # Copia la configurazione per la modalità AP
    cp /etc/dhcpcd-ap.conf /etc/dhcpcd.conf
    
    # Riavvia dhcpcd
    systemctl restart dhcpcd
    
    # Avvia i servizi AP
    systemctl start dnsmasq
    systemctl start hostapd
    
    echo "✔ Modalità ACCESS POINT attiva"
    
elif [ "$1" == "client" ]; then
    echo "→ Passaggio a Wi-Fi CLIENT"
    
    # Ferma i servizi AP
    systemctl stop hostapd 2>/dev/null
    systemctl stop dnsmasq 2>/dev/null
    
    # Copia la configurazione per la modalità client
    cp /etc/dhcpcd-client.conf /etc/dhcpcd.conf
    cp /etc/wpa_supplicant/wpa_supplicant-client.conf /etc/wpa_supplicant/wpa_supplicant.conf
    
    # Riavvia i servizi
    systemctl restart dhcpcd
    systemctl restart wpa_supplicant
    
    echo "✔ Modalità CLIENT attiva"
else
    echo "❌ Uso: ./wifi-toggle.sh [ap|client]"
    exit 1
fi