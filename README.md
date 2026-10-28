# Mācību kartītes

RRV komandas mācību projekts ar kartīšu kopām, zināšanu pārbaudes spēli un rangu sistēmu. Komandā strādā Roberts, Rihards un Valerijs. Lietotne veidota kursam “Lietotnes programmēšana”.

Šajā versijā darbojas konta izveide, pieslēgšanās un sesijas pārbaude FastAPI serverī. Kartīšu spēle, personīgās kopas un progress darbojas React klientā. Lokāli konti glabājas SQLite, bet Render demonstrācijā PostgreSQL datubāzē. Spēles dati pagaidām glabājas katram kontam atsevišķi konkrētajā pārlūkā. Nedēļas tabulā ir simulēti pretinieki.

## Publiskā demonstrācija

[Atvērt mācību kartītes](https://rrv-kartites.onrender.com). Klients, API un datubāze izvietoti Render bezmaksas plānos. Pirms demonstrācijas atver [API pārbaudi](https://rrv-kartites-api.onrender.com/health), jo pēc neaktivitātes servera palaišana var aizņemt aptuveni minūti. Datubāzes bezmaksas termiņš ir 2026. gada 27. novembris. Izvietošanas iestatījumi un turpmākā atjaunošana aprakstīti [Render ceļvedī](docs/12-izvietosana-render.md).

## Ātra palaišana Windows vidē

Vajadzīgs Git, Python 3.12 un Node.js 22.12 vai jaunāks. Pārbaudītā vide: Python 3.12.13 un Node.js 24.11.0. Atver divus PowerShell logus repozitorija mapē.

Pirmajā logā palaid serveri:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe setup_env.py
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Otrajā logā palaid klientu:

```powershell
cd prototype-ranked
npm ci
npm run dev -- --host localhost
```

Atver `http://localhost:5173`. Servera pārbaude: `http://127.0.0.1:8000/health`. Interaktīvais API apraksts: `http://127.0.0.1:8000/docs`.

`setup_env.py` izveido `backend/.env` ar nejaušu JWT atslēgu un nepārraksta esošu konfigurāciju. Tukšs `JWT_SECRET` nav derīga konfigurācija. `.env.example` ir lauku paraugs, nevis gatava slepenā atslēga.

## Datubāze un dati

Noklusējuma datubāze ir `backend/macibu_kartites.db`. Faila nosaukumā ir pasvītrojums. Komandas ziņojumā minētais `macibu-kartites.db` atšķiras no sākotnējā koda iestatījuma. Esošais nosaukums ir saglabāts, lai iepriekš izveidotie konti nepazustu no lietotnes skata. Datubāzi automātiski izveido servera palaišanas laikā. Paroles glabā kā Argon2 jaucējvērtības.

Mainot ierīci vai pārlūku, var pieslēgties kontam, taču vietējais spēles progress netiek pārsūtīts. Vecais koplietotais `rrv-ranked-v1` profils netiek automātiski piešķirts nevienam kontam. Tā saturs netiek dzēsts.

## Mapes

| Mape | Saturs |
|---|---|
| `prototype-ranked/` | Darbojošais React, TypeScript un Vite klients |
| `backend/app/` | FastAPI, autentifikācija, SQLAlchemy modeļi |
| `backend/tests/` | Izolēti API, konfigurācijas un iestatīšanas testi |
| `docs/` | Projekta prasības, arhitektūra, ceļveži un testu pārskats |
| `frontend/` | Sākotnējās struktūras vietturis ar norādi uz klientu |

## Pārbaudes

```powershell
cd backend
.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.venv\Scripts\python.exe -m pytest -q
```

```powershell
cd prototype-ranked
npm test
npm run typecheck
npm run build
npm audit
```

Backend testos izmanto pagaidu datubāzi. Tie nemaina parastos kontus. Klienta testos pārbauda sesijas kļūdas, termiņu, cilņu savstarpējo paziņošanu un kontu datu nošķiršanu.

## Dokumentācija

Sāc ar [dokumentācijas rādītāju](docs/README.md). [Lietotāja ceļvedī](docs/08-lietotaja-celvedis.md) aprakstīta reģistrācija un lietošana. [Testēšanas pārskatā](docs/09-testesana.md) apkopotas pārbaudes un robežas. [Izmaiņu pārskatā](docs/10-izmainu-parskats.md) aprakstīts pārskatītais komandas darbs un novērstās kļūdas.

## Pašreizējās robežas

Kopu un spēles progresa REST API, īsta vairāku spēlētāju tabula, administratora panelis, e-pasta apstiprināšana un paroles atjaunošana vēl nav ieviesti. Kontu darbība pārbaudīta arī Render PostgreSQL vidē. Plašākai lietošanai vēl jāizveido migrācijas, pieprasījumu biežuma ierobežošana un jāpārskata sesiju glabāšana. Sīkāk skatīt [prasības](docs/04-prasibu-melnraksts.md).
