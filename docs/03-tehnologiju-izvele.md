# 3. Tehnoloģiju izvēle un pamatojums

Projekta prasība: izmantot **vismaz divas dažādas programmēšanas tehnoloģijas** ar
dinamisku datubāzes atjauninājumu un vairāku lietotāju lomām.

## 3.1. Kopsavilkums

| Slānis | Tehnoloģija |
|--------|-------------|
| Frontend | React 18 + Vite, TypeScript, Tailwind CSS, React Router |
| Backend | Python 3.12 + FastAPI, Pydantic, SQLAlchemy |
| Datubāze | SQLite (izstrādē), PostgreSQL (demonstrācijā) |
| Autentifikācija | JWT piekļuves marķieri, lomu pārbaude (guest / user / admin) |
| Saziņa | REST / JSON |
| Rīki | Git + GitHub, Trello, VS Code |

Frontend (JavaScript / TypeScript) un backend (Python) ir **divas atšķirīgas
programmēšanas valodas un tehnoloģijas**, kas sazinās caur REST API.

## 3.2. Frontend — React + Vite + TypeScript + Tailwind

- **React** — komponenšu arhitektūra labi der dinamiskam interfeisam (mācību
  sesija ar kartītes apgriešanu, tiešā statistika, līderu tabula). Liela
  ekosistēma, plaša dokumentācija, komandai jau ir pieredze ar JavaScript.
- **Vite** — ātrs izstrādes serveris un vienkārša konfigurācija.
- **TypeScript** — tipu drošība samazina kļūdu skaitu un uzlabo IDE atbalstu.
- **Tailwind CSS** — ātrs ceļš uz konsekventu, modernu un responsīvu dizainu, kas
  nosedz nefunkcionālās prasības (vienots izskats, adaptīvs izkārtojums).

## 3.3. Backend — Python + FastAPI

- **FastAPI** — automātiska pieprasījumu datu validācija ar **Pydantic** (tieši
  nosedz prasību par datu validāciju formās), automātiska OpenAPI / Swagger
  dokumentācija, laba veiktspēja, viegli apgūstams.
- **Python** — atšķirīga valoda no frontend, tāpēc prasība par "divām dažādām
  tehnoloģijām" ir izpildīta nepārprotami; laba lasāmība komandas darbam.
- **SQLAlchemy** — ORM datubāzes shēmas un vaicājumu pārvaldībai; ļauj viegli
  mainīt SQLite uz PostgreSQL bez koda pārrakstīšanas.

## 3.4. Datubāze — SQLite → PostgreSQL

- **SQLite** izstrādē — nulles konfigurācija, viegli koplietot komandā.
- **PostgreSQL** demonstrācijā — reāla klienta–servera datubāze ar vienlaicīgu
  piekļuvi, kas atbilst prasībai par dinamisku datubāzes atjauninājumu.

## 3.5. Autentifikācija un lomas

JWT piekļuves marķieri; backend pārbauda lomu (guest / user / admin) katram
aizsargātam pieprasījumam. Viesis piekļūst tikai publiskajam saturam.

## 3.6. Apsvērtās alternatīvas un noraidīšanas iemesls

| Alternatīva | Kāpēc noraidīta |
|-------------|-----------------|
| Node.js + Express backend | Viss projekts būtu JavaScript — vājāks arguments par "divām dažādām tehnoloģijām" |
| ASP.NET Core (C#) | Komandai mazāka pieredze, smagnējāks starts šim apjomam |
| Django | Vairāk iebūvēta nekā nepieciešams; FastAPI ir vieglāks un ātrāk apgūstams |
| Vue / Angular | React ir komandai vistuvākais un ar lielāko mācību materiālu klāstu |
