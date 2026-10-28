# Servera palaišana un uzturēšana

Serveris pārvalda kontus un autentifikāciju. Python kods atrodas `app/`. Precīzās bibliotēku versijas un to atkarības ir `requirements.txt`, bet tiešo bibliotēku saraksts ir `requirements.in`.

## Uzstādīšana

Komandas izpilda `backend` mapē. Windows aktivizēšanas skripts nav vajadzīgs, jo tiek izsaukts virtuālās vides Python fails.

```powershell
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe setup_env.py
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

macOS un Linux vidē izmanto `python3 -m venv .venv` un `.venv/bin/python` Windows ceļa vietā. Šīs operētājsistēmas šajā pārbaudē nav atsevišķi testētas.

## Konfigurācija

| Mainīgais | Nozīme un noklusējums |
|---|---|
| `JWT_SECRET` | Obligāta nejauša atslēga ar vismaz 32 rakstzīmēm |
| `DATABASE_URL` | Pēc noklusējuma absolūts ceļš uz `backend/macibu_kartites.db` |
| `ACCESS_TOKEN_MINUTES` | Sesijas ilgums minūtēs; noklusējums 1440, atļauts no 1 līdz 10080 |
| `FRONTEND_URL` | CORS atļautā klienta izcelsme; `http://localhost:5173` |
| `APP_NAME` | API nosaukums; `Mācību kartītes API` |

Iestatījumi tiek lasīti no procesa vides un `backend/.env`. Darba mapes maiņa nepārvieto noklusējuma datubāzi. Ja norādi savu relatīvu `DATABASE_URL`, tas jāizvērtē atbilstoši palaišanas mapei; koplietotā vidē izvēlies absolūtu ceļu.

`http://127.0.0.1:5173` un `http://localhost:5173` ir dažādas izcelsmes. Ja pārlūku atver ar pirmo adresi, iestati atbilstošu `FRONTEND_URL` un pārstartē API. Klienta API adresei paredzēts `prototype-ranked/.env` mainīgais `VITE_API_URL`. Pēc klienta vides maiņas pārstartē Vite.

HS256 ir vienīgais atļautais JWT parakstīšanas algoritms. Atslēgas maiņa padara agrāk izsniegtos marķierus nederīgus. `.env`, datubāzi un datubāzes palīgfailus nepievieno Git.

## Datu saglabāšana

Tabulas izveido FastAPI dzīves cikla sākumā. SQLAlchemy `create_all` neveic esošo tabulu migrācijas. Pirms modeļu struktūras maiņas vajag rezerves kopiju un atsevišķu migrācijas risinājumu. Esošā faila pārdēvēšana nav nepieciešama.

Rezerves kopijai apturi API un pārliecinies, ka neviens process neraksta datubāzē. Tad izpildi:

```powershell
Copy-Item -LiteralPath macibu_kartites.db -Destination macibu_kartites.backup.db
```

Atjaunošanai arī apturi API un saglabā pašreizējā faila atsevišķu kopiju. Pēc tam aizvieto datubāzi ar pārbaudīto rezerves kopiju un palaid API. Rezerves kopijā ir kontu dati un paroļu jaucējvērtības, tādēļ to glabā ārpus publiska repozitorija.

## Testēšana

```powershell
.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.venv\Scripts\python.exe -m pytest -q
```

Detalizēts [API apraksts](../docs/07-api.md) un [datu modelis](../docs/06-arhitektura-un-dati.md).
