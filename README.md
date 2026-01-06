# Tombola 2.0 🎰

Tombola 2.0 è una web application moderna e reattiva per il gioco della Tombola italiana, progettata per offrire un'esperienza di gioco in tempo reale fluida e coinvolgente. Utilizza **Next.js** per il frontend e un server personalizzato con **Socket.io** per gestire la sincronizzazione tra il tabellone ("Tombolone") e le cartelle dei giocatori.

## ✨ Funzionalità

- **Real-time Gameplay**: Sincronizzazione istantanea dei numeri estratti e delle vincite tramite WebSocket.
- **Tabellone Digitale (Tombolone)**: Dashboard per l'host con estrazione casuale e visualizzazione dei numeri.
- **Cartelle Interattive**: I giocatori possono generare le proprie cartelle e segnare i numeri con un click.
- **Smorfia Napoletana**: Ogni numero estratto mostra il suo significato tradizionale.
- **Gestione Vincite**: Sistema di notifica per Ambo, Terna, Quaterna, Cinquina e Tombola.
- **Effetti Visivi**: Animazioni con coriandoli (`canvas-confetti`) e fiocchi di neve per l'atmosfera festiva.
- **Ottimizzazione per Raspberry Pi**: Documentazione e script inclusi per il deployment su hardware limitato come Raspberry Pi Zero W.

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (v12), React (v17), Tailwind CSS
- **Backend**: Node.js, [Socket.io](https://socket.io/) (v4), Express
- **Icone**: Lucide React
- **Stile**: PostCSS, Autoprefixer

## 🚀 Installazione e Avvio

### Prerequisiti
- Node.js (consigliata versione 16+ per compatibilità ARM)
- npm

### Procedura
1. **Clona la repository**:
   ```bash
   git clone <repository-url>
   cd Tombola_2.0
   ```

2. **Installa le dipendenze**:
   ```bash
   npm install
   ```

3. **Sviluppo**:
   ```bash
   npm run dev
   ```
   L'app sarà disponibile su `http://localhost:3000`.

4. **Produzione**:
   ```bash
   npm run build
   npm start
   ```

## 📂 Struttura del Progetto

- `/pages`: Route dell'applicazione (Home, Tombolone, Cartelle, Impostazioni).
- `/components`: Componenti UI riutilizzabili.
- `/utils`: Logica di gioco (generazione cartelle, dizionario della Smorfia).
- `/server.js`: Server custom per la gestione dei Socket e del rendering Next.js.
- `/start_server.js`: Script di utility per la gestione del processo server.
- `rpi_zero_w.md`: Guida specifica per il deployment su Raspberry Pi Zero W.

## 🎮 Modalità di Gioco

1. **Host**: Accede alla sezione "Tombolone" per gestire l'estrazione dei numeri.
2. **Giocatori**: Accedono alla sezione "Cartelle", scelgono il numero di cartelle e inseriscono il proprio nome.
3. **Sincronizzazione**: Quando l'host estrae un numero, questo viene evidenziato automaticamente sulle cartelle di tutti i giocatori connessi.

## 🍓 Deployment su Raspberry Pi

Il progetto include ottimizzazioni per **Raspberry Pi Zero W**. Per maggiori dettagli sulla configurazione di Node.js su architettura ARM e sulla gestione delle risorse limitate, consultare il file [Conversione embedded-style.md](./Conversione embedded-style.md).

## 📄 Licenza

Questo progetto è distribuito sotto licenza **ISC**.
