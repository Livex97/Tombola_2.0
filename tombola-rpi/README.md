# Procedura di installazione di Node.js su Raspberry Pi Zero W con sistema operativo DietPi
1. Scarica e installa manualmente la versione corretta: 
Puoi trovare i binari aggiornati su unofficial-builds.nodejs.org. Ecco i comandi per installare la versione 20.x specifica per ARMv6:
```bash
# Crea una cartella per Node
mkdir -p /usr/local/lib/nodejs


# Scarica il pacchetto ARMv6 (Esempio versione 20.18.x)
wget https://unofficial-builds.nodejs.org/download/release/v21.7.3/node-v21.7.3-linux-armv6l.tar.xz

# Il comando tar richiede xz-utils, se non sono già presenti, installali prima.
apt update && apt install xz-utils

# Estrai i file
tar -xJvf node-v21.7.3-linux-armv6l.tar.xz -C /usr/local/lib/nodejs

# Aggiungi Node al PATH (modifica il tuo ~/.bashrc)
echo 'export PATH=/usr/local/lib/nodejs/node-v21.7.3-linux-armv6l/bin:$PATH' >> ~/.bashrc

# Ricarica il profilo
source ~/.bashrc
```

2. Verifica l'installazione
Per verificare che Node.js sia stato installato correttamente, esegui il seguente comando:
```bash
node -v
```
Se viene visualizzata la versione di Node.js, significa che l'installazione è stata completata con successo.

# Per installare Git su DietPi nel 2026, puoi procedere tramite il comando rapido di sistema operativo DietPi.

DietPi include uno script per installare software ottimizzato. Il Software ID per Git è il numero 17. 
Esegui questo comando per un'installazione rapida e automatica:
```bash
sudo dietpi-software install 17
```
In alternativa, puoi usare l'interfaccia grafica digitando dietpi-software, andando su Browse Software e selezionando Git Client dalla lista.

# Al termine dell'installazione, Git sarà pronto per scaricare la Repository GitHub della Tombola tramite il comando:
```bash
git clone https://github.com/Livex97/Tombola_RpiZeroW.git
```
# A questo punto per concludere l'installazione del server web del gioco della Tombola, devi seguire questi passaggi:
```bash
cd Tombola_RpiZeroW && npm install --omit=dev && chmod +x setup_tombola_service.sh && ./setup_tombola_service.sh
```
Infine per controllare che il servizio sia in esecuzione, utilizza il comando `systemctl status tombola.service` Se tutto va bene, dovresti vedere che il servizio è attivo e funzionante.
