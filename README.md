# Mācību kartītes (RRV Ranked Flashcards)

Moderna atkārtošanas (*spaced repetition*) mācību kartīšu tīmekļa lietotne, Anki tipa
rīks ar mūsdienīgu, tīru dizainu un **iebūvētu rangu sistēmu**, kas motivē mācīties
regulāri.

## Īss projekta apraksts

Lietotāji veido kartīšu kopas (*decks*) ar jautājuma/atbildes kartītēm un mācās tās
ar atkārtošanas algoritmu (SM-2), kas katrai kartītei aprēķina nākamo atkārtošanas
reizi. Par regulāru mācīšanos, atbilžu precizitāti un dienu sērijām (*streak*)
lietotājs pelna rangu punktus (RP), ceļas pa līgām no Bronze līdz Diamond un sacenšas
nedēļas līderu tabulā.

### Lietotāju lomas

| Loma | Iespējas |
|------|----------|
| **Viesis** | Pārlūkot publiskās kartīšu kopas, izmēģināt demo mācību sesiju, apskatīt līderu tabulu |
| **Lietotājs** | Reģistrēties / pieslēgties; veidot, labot, dzēst savas kopas un kartītes (pilns CRUD); mācīties ar atkārtošanas algoritmu; pelnīt RP; skatīt statistiku, savu līgu un sēriju; meklēt un filtrēt publiskās kopas |
| **Administrators** | Moderēt publiskās kopas (paslēpt / dzēst), pārvaldīt lietotājus un lomas, pārvaldīt kategorijas, izskatīt sūdzības |

## Galvenā funkcionalitāte (plānota)

- Kartīšu kopu un kartīšu **pilns CRUD** ar datu validāciju un dzēšanas apstiprinājumu
- Atkārtošanas (*spaced repetition*) mācību sesija, SM-2 algoritms
- **Rangu sistēma:** RP aprēķins, līgas, nedēļas / visu laiku līderu tabula
- Publisko kopu pārlūkošana ar **meklēšanu un filtrēšanu** (kategorija, tags, valoda)
- Lietotāja statistika: atkārtoto kartīšu skaits, precizitāte, dienu sērija
- Administratora panelis satura un lietotāju moderācijai
- Responsīvs, konsekvents lietotāja interfeiss ar vienotu datuma / laika / skaitļu formātu

Sīkāka prasību specifikācija, [`docs/04-prasibu-melnraksts.md`](docs/04-prasibu-melnraksts.md)
(tiek precizēta 2. posmā).

## Izmantotās tehnoloģijas

| Slānis | Tehnoloģija |
|--------|-------------|
| Frontend | React 18 + Vite, TypeScript, Tailwind CSS, React Router |
| Backend | Python 3.12 + FastAPI, Pydantic, SQLAlchemy |
| Datubāze | SQLite (izstrādē) / PostgreSQL (demonstrācijā) |
| Autentifikācija | JWT piekļuves marķieri; lomas: guest / user / admin |
| Versiju kontrole | Git + GitHub (viens kopīgs repozitorijs) |
| Uzdevumu pārvaldība | Trello (Kanban) |

Izvēles pamatojums: [`docs/03-tehnologiju-izvele.md`](docs/03-tehnologiju-izvele.md).

## Projekta struktūra

```
macibu-kartites/
├── frontend/   # React + Vite klienta lietotne
├── backend/    # FastAPI REST API
├── docs/       # Izpēte, lomas, tehnoloģijas, prasību melnraksts, rangu sistēma
└── README.md
```

## Uzstādīšana un palaišana

> Programmas kods tiek izstrādāts 3. posmā. Šī sadaļa tiks papildināta ar konkrētām
> komandām un vides mainīgajiem.

### Priekšnosacījumi
- Node.js 20+ un npm
- Python 3.12+
- Git

### Backend
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Komanda RRV un lomas

Izstrādes metodoloģija: **Agile / Kanban**. Visi dalībnieki piedalās frontend,
backend un testēšanas darbos; katram ir arī primārā atbildības joma.

| Dalībnieks | Primārā atbildība | Papildus |
|-----------|-------------------|----------|
| **Roberts** | Komandas koordinācija, GitHub un Trello uzturēšana, backend (API, datubāze) | Frontend, testēšana |
| **Rihards** | Frontend (UI komponentes, dizaina konsekvence, responsivitāte) | Backend, testēšana |
| **Valerijs** | Backend (autentifikācija, rangu sistēmas loģika, atkārtošanas algoritms), testēšanas plāns | Frontend, testēšana |

Detalizēts sadalījums: [`docs/02-lomu-sadalijums.md`](docs/02-lomu-sadalijums.md).

---

Projekts izstrādāts mācību kursa *"Lietotnes programmēšana"* ietvaros.
