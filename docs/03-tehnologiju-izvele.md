# 3 Tehnoloģiju izvēle

## 3.1 Izmantotais risinājums

| Daļa | Tehnoloģija | Lietojums |
|---|---|---|
| Klients | React 18 un TypeScript | Ekrāni, formas un spēles plūsma |
| Izstrāde un būvēšana | Vite 8 | Izstrādes serveris un izvietojamie faili |
| Saskarne | Tailwind CSS 4, Motion un Lucide | Stili, animācijas un ikonas |
| Maršruti | React Router 7 | Pārejas starp lietotnes ekrāniem |
| Vietējie dati | Zustand 5 un localStorage | Katra konta spēles dati konkrētajā pārlūkā |
| Serveris | Python 3.12 un FastAPI | Kontu API un ievades pārbaude |
| Datu modelis | SQLAlchemy 2, SQLite lokāli un PostgreSQL Render vidē | Konti un turpmākās integrācijas tabulas |
| Paroles un sesijas | pwdlib ar Argon2 un PyJWT | Paroļu jaukšana un HS256 marķieri |
| Testi | pytest, Vitest un Playwright | API, klienta loģika un pārlūka plūsmas |

## 3.2 Izvēles pamatojums

React komponenšu modelis der atkārtoti izmantojamiem kartīšu un spēles elementiem. TypeScript palīdz konstatēt neatbilstošus datu tipus pirms palaišanas. FastAPI izmanto Pydantic ievades shēmas un ģenerē OpenAPI aprakstu. SQLAlchemy vienuviet apraksta tabulas un vaicājumus. SQLite ļauj projektu palaist bez atsevišķa datubāzes servera.

Klients un serveris izmanto dažādas programmēšanas valodas un sazinās ar HTTP un JSON. Precīzās JavaScript versijas nosaka `package-lock.json`, bet Python versijas nosaka `requirements.txt`. Bibliotēku maiņas pārbauda ar testiem un būvēšanu.

## 3.3 Pašreizējās izvēles robežas

localStorage ir piemērots demonstrācijas prototipam, taču nesinhronizē datus starp ierīcēm un neaizsargā tos pret lietotāja manuālu labošanu. JWT pārlūka glabātuvē ir pieejams šīs izcelsmes JavaScript kodam. Publiskai sistēmai jāizvērtē HttpOnly sīkdatnes, CSRF aizsardzība, HTTPS un sesiju atsaukšana.

Render demonstrācijā izmantots PostgreSQL 18 un psycopg 3 draiveris. Reģistrācija, pieslēgšanās un sesijas atjaunošana pārbaudīta publiskajā lietotnē. Automātiskie API testi joprojām izmanto izolētu SQLite datubāzi. Render datubāze izveidota no jauna; iepriekšējie vietējie konti nav pārnesti.

## 3.4 Alternatīvas

Pilnībā vietējs prototips būtu vienkāršāks, bet nedotu serverī glabātus kontus. Visas spēles tūlītēja pārcelšana uz serveri ievērojami paplašinātu šo pārskati. Tāpēc saglabāts esošais prototips un sakārtota tā kontu daļa. Turpmāk backend integrāciju var attīstīt pa datu veidiem.
