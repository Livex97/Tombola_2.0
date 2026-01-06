#!/bin/bash

# Script per trasformare Raspberry Pi Zero W in Access Point (AP)
# Rete: "Tombola-WiFi" (senza password per facilità d'uso)
# Indirizzo: http://tombola.local o http://192.168.50.1

echo "--- Configurazione Access Point ---"

# 1. Installazione pacchetti
echo "Installazione hostapd e dnsmasq..."
apt-get update
apt-get install -y hostapd dnsmasq avahi-daemon

# 2. Ferma i servizi durante la configurazione
systemctl stop hostapd
systemctl stop dnsmasq

# 3. Configura IP statico per wlan0
echo "Configurazione IP statico (192.168.4.1)..."
bash -c 'cat <<EOF >> /etc/dhcpcd.conf
interface wlan0
static ip_address=192.168.50.1/24
nohook wpa_supplicant
EOF'

# 4. Configura DHCP (dnsmasq)
echo "Configurazione DHCP e DNS locale..."
mv /etc/dnsmasq.conf /etc/dnsmasq.conf.bak
bash -c 'cat <<EOF > /etc/dnsmasq.conf
interface=wlan0
dhcp-range=192.168.50.10,192.168.50.100,255.255.255.0,24h
domain=local
EOF'

# 5. Configura Access Point (hostapd)
echo "Configurazione WiFi (SSID: Tombola-WiFi)..."
bash -c 'cat <<EOF > /etc/hostapd/hostapd.conf
interface=wlan0
driver=nl80211
ssid=Tombola-WiFi
hw_mode=g
channel=7
wmm_enabled=0
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
EOF'

# 6. Punta hostapd al file di configurazione
sed -i 's|#DAEMON_CONF=""|DAEMON_CONF="/etc/hostapd/hostapd.conf"|' /etc/default/hostapd

# 7. Avvio servizi
echo "Avvio servizi..."
systemctl unmask hostapd
systemctl enable hostapd
systemctl start hostapd
systemctl enable dnsmasq
systemctl start dnsmasq

#8. Abilitare tombola.local (mDNS)
echo "Abilitazione mDNS..."
systemctl enable avahi-daemon
systemctl start avahi-daemon
echo "Imposto hostname a tombola"
hostnamectl set-hostname tombola

echo "--- Fatto! ---"
echo "Ora puoi connetterti alla rete 'Tombola-WiFi'."
echo "L'app sarà raggiungibile su http://tombola.local:3000 o http://192.168.50.1:3000"
