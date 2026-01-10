# 📦 Guida alla creazione del pacchetto `.deb` per Tombola_RpiZeroW

Questa guida spiega **passo‑passo** come trasformare la web app Node.js presente nella repository  
👉 https://github.com/Livex97/Tombola_RpiZeroW  
in un **pacchetto `.deb` installabile** su **Raspberry Pi Zero W (armhf)**.

---

## 🎯 Obiettivo

- Installazione con **un solo comando**
- Avvio automatico all'accensione (systemd)
- Disinstallazione pulita
- Compatibilità con Raspberry Pi OS / DietPi

---

## 🧱 Requisiti

Sul Raspberry Pi Zero W:

```bash
sudo apt update
sudo apt install -y nodejs npm git
```

> ⚠️ Assicurati di usare una versione di Node.js **compatibile ARMv6 / armhf**

---

## 📁 Struttura della repository originale

File principali:

- `server.js` → entrypoint Node.js
- `package.json` → dipendenze npm
- `setup_tombola_service.sh` → crea il servizio systemd

---

## 📦 Struttura del pacchetto `.deb`

Crea una cartella di build:

```
tombola_1.0.0_armhf/
├── DEBIAN
│   ├── control
│   ├── postinst
│   └── prerm
└── usr
    └── local
        └── tombola
            ├── server.js
            ├── package.json
            ├── setup_tombola_service.sh
```

---

## 📝 File `DEBIAN/control`

```text
Package: tombola
Version: 1.0.0
Section: web
Priority: optional
Architecture: armhf
Depends: nodejs (>= 18)
Maintainer: Alessio
Description: Tombola web app per Raspberry Pi Zero W
```

---

## 🔧 Script `postinst`

`DEBIAN/postinst`:

```bash
#!/bin/bash
set -e

cd /usr/local/tombola
npm install --omit=dev

chmod +x setup_tombola_service.sh
./setup_tombola_service.sh
```

Rendi eseguibile:

```bash
chmod 755 DEBIAN/postinst
```

---

## 🧹 Script `prerm`

`DEBIAN/prerm`:

```bash
#!/bin/bash
set -e

systemctl stop tombola.service || true
systemctl disable tombola.service || true
rm -f /etc/systemd/system/tombola.service
systemctl daemon-reload
```

Rendi eseguibile:

```bash
chmod 755 DEBIAN/prerm
```

---

## 🏗️ Build del pacchetto

Dalla directory superiore:

```bash
dpkg-deb --root-owner-group --build tombola_1.0.0_armhf
```

Otterrai:

```
tombola_1.0.0_armhf.deb
```

---

## 📥 Installazione sul Raspberry Pi

```bash
cd /tmp && wget https://github.com/Livex97/Tombola_RpiZeroW/releases/download/v1.0.0/tombola_1.0.0_armhf.deb && apt install ./tombola_1.0.0_armhf.deb
```

---

## ▶️ Avvio e verifica

```bash
systemctl status tombola.service
```

Accesso via browser:

```
http://IP_DEL_PI:3000
```

---

## 🌐 Accesso via `.local` (opzionale)

Installa Avahi:

```bash
sudo apt install avahi-daemon
```

Accesso:

```
http://tombola.local:3000
```

---

## ♻️ Disinstallazione

```bash
sudo apt remove tombola
```

---

## 🚀 Miglioramenti futuri

- Repository APT personale
- Aggiornamenti automatici
- Modalità Access Point
- Ottimizzazione RAM per Pi Zero W

---

## ✅ Conclusione

Questa soluzione rende *Tombola* un **prodotto installabile**, non un semplice script.
Pulito, affidabile, aggiornabile.

Buon divertimento 🎉
