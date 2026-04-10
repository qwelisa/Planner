# Planner 2026

Planner 2026 è un'applicazione web personale che ho sviluppato come progetto. L'idea di base era creare uno strumento semplice ma funzionale per organizzare le proprie attività quotidiane, divise in liste e task, con una visualizzazione calendario integrata.

Il progetto nasce da un'esigenza concreta: avere un posto unico dove raccogliere le cose da fare, organizzarle in categorie e visualizzarle su un calendario mensile. Ho cercato di mantenerlo semplice sia nel codice che nell'interfaccia, puntando su un design pulito e intuitivo.

---

## Tecnologie utilizzate

Per il frontend ho usato **React** insieme a **Vite**, che mi ha permesso di avere un ambiente di sviluppo veloce e un progetto ben strutturato fin dall'inizio. React mi ha consentito di suddividere l'interfaccia in componenti riutilizzabili, rendendo il codice più organizzato e leggibile.

Per il backend ho scelto **PocketBase**, una soluzione self-hosted che integra database, autenticazione utenti e API REST in un unico eseguibile. È stata una scelta pratica perché non richiedeva di configurare un server separato: basta avviarlo e funziona subito.

---

## Struttura del progetto

Il progetto è organizzato in componenti React separati, ognuno con una responsabilità precisa:

- **App.jsx** — è il componente principale, gestisce tutto lo stato dell'applicazione: l'autenticazione dell'utente, il caricamento delle liste e dei task, e la comunicazione con PocketBase.
- **Layout.jsx** — definisce la struttura visiva generale della pagina con header e contenuto principale.
- **List.jsx** — componente che rappresenta una singola lista nella sidebar.
- **Task.jsx** — componente per ogni singolo task, con un tooltip al passaggio del mouse che mostra descrizione e scadenza.
- **Calendar.jsx** — visualizza un calendario mensile e mostra i task in corrispondenza della loro data di scadenza.
- **pocketbase.js** — file di configurazione per la connessione a PocketBase, che punta all'indirizzo locale `http://127.0.0.1:8090`.

---

## Database — Le collection di PocketBase

Il progetto utilizza due collection su PocketBase, che funzionano come le "tabelle" del database:

### `users`
Gestita automaticamente da PocketBase, contiene i dati degli utenti registrati. Nel codice viene usata per la registrazione (`create`) e per il login (`authWithPassword`). Ogni utente ha una propria email e password, e accede solo ai propri dati.

### `lists`
Contiene le liste create dall'utente. Ogni lista ha:
- `name` — il nome della lista
- `created_by` — il riferimento all'utente che l'ha creata

Quando l'utente accede, vengono caricate solo le sue liste grazie al filtro `created_by = "{user.id}"`.

### `tasks`
Contiene i singoli task associati a una lista. Ogni task ha:
- `title` — il titolo del task (obbligatorio)
- `description` — una descrizione opzionale
- `date` — la data di scadenza, usata anche per posizionare il task nel calendario
- `list` — il riferimento alla lista a cui appartiene il task

---

## Funzionalità principali

L'app si apre con una schermata di login e registrazione. Una volta autenticato, l'utente vede una sidebar con le proprie liste e può crearne di nuove. Cliccando su una lista si accede ai suoi task, dove è possibile aggiungerne di nuovi specificando titolo, data e descrizione. In fondo alla pagina è sempre visibile il calendario del mese corrente, con i task visualizzati nei giorni corrispondenti alla loro scadenza.

---

## Come funziona l'applicazione

Quando si apre l'applicazione per la prima volta, viene mostrata una schermata di autenticazione che permette di accedere con un account esistente oppure di registrarne uno nuovo inserendo email e password. La registrazione è importante perché ogni lista e ogni task vengono salvati su PocketBase legati all'account dell'utente: in questo modo i dati sono personali e persistenti, e si ritrovano esattamente com'erano ogni volta che si effettua il login.

Una volta autenticati, si accede alla schermata principale dell'app, divisa in due aree. Sulla sinistra è presente una sidebar che mostra tutte le liste create dall'utente, con la possibilità di aggiungerne di nuove tramite un campo di testo in cima. Sulla destra invece si trova l'area principale, dove cliccando su una lista si possono visualizzare tutti i task ad essa associati e aggiungerne di nuovi specificando un titolo, una data di scadenza e una descrizione opzionale.

I task sono mostrati come schede nella parte centrale della pagina. Passando il mouse sopra uno di essi appare un tooltip che mostra i dettagli completi del task, ovvero la descrizione e la data di scadenza, senza dover aprire nessuna pagina aggiuntiva. In fondo alla pagina è inoltre sempre visibile un calendario mensile, che riporta automaticamente i task nei giorni corrispondenti alla loro data, offrendo così una panoramica visiva di tutto ciò che è pianificato nel mese corrente.

---

## Note sullo sviluppo

Per la realizzazione del progetto mi sono avvalsa dell'aiuto dell'intelligenza artificiale per generare una base di partenza, soprattutto per la struttura dei componenti e per i CSS. Ho poi rivisto e modificato il codice per adattarlo alle mie esigenze, correggendo parti che non funzionavano come volevo e aggiungendo funzionalità come il tooltip sui task, il filtro per utente nelle liste e la sincronizzazione in tempo reale con PocketBase tramite i metodi `subscribe`.

---
>>>>>>> d581cc5645bbfb8c134925a58d7ac012343cf695
