# 12 Izvietošana Render

Izvietots 2026. gada 28. oktobrī īslaicīgai skolas demonstrācijai līdz piektdienai, 30. oktobrim. Visi trīs resursi izmanto bezmaksas plānu. Avots ir GitHub repozitorija `Tigerstar07/macibu-kartites` zars `main`.

## 12.1 Adreses

| Resurss | Adrese |
|---|---|
| Lietotne | https://rrv-kartites.onrender.com |
| API darbības pārbaude | https://rrv-kartites-api.onrender.com/health |
| API interaktīvais apraksts | https://rrv-kartites-api.onrender.com/docs |

## 12.2 Klients

Render resursa tips ir Static Site, nosaukums `rrv-kartites`.

| Iestatījums | Vērtība |
|---|---|
| Zars | `main` |
| Saknes mape | `prototype-ranked` |
| Būvēšana | `npm ci && npm run build` |
| Publicējamā mape | `dist` |
| `NODE_VERSION` | `24.11.0` |
| `VITE_API_URL` | `https://rrv-kartites-api.onrender.com` |

Redirects/Rewrites sadaļā saglabāts noteikums ar avotu `/*`, galamērķi `/index.html` un darbību Rewrite. Tas ļauj pārlādēt arī `/profile`, `/decks` un citas React Router adreses. Pēc `VITE_API_URL` maiņas klients jābūvē atkārtoti, jo Vite šo vērtību ievieto būvēšanas laikā.

## 12.3 API un datubāze

API resursa tips ir Web Service, nosaukums `rrv-kartites-api`, plāns Free, reģions Frankfurt. Saknes mape ir `backend`. Būvēšanas komanda ir `pip install -r requirements.txt`. Palaišanas komanda:

```text
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

| Vides mainīgais | Vērtība vai uzstādīšanas princips |
|---|---|
| `PYTHON_VERSION` | `3.12.13` |
| `FRONTEND_URL` | `https://rrv-kartites.onrender.com` |
| `DATABASE_URL` | Render datubāzes iekšējā adrese ar `postgresql+psycopg://` shēmu |
| `JWT_SECRET` | Nejauša slepena atslēga, saglabāta tikai Render vidē |

API veselības pārbaudes ceļš ir `/health`. Datubāzes nosaukums ir `rrv-kartites-db`, versija PostgreSQL 18, reģions Frankfurt un plāns Free. Izveidota jauna datubāze ar tukšām tabulām. Vietējie SQLite faili nav augšupielādēti. Slepenās atslēgas un datubāzes savienojuma vērtības nepievieno Git, dokumentācijai vai ekrānattēliem.

## 12.4 Atjaunošana

Komandas biedrs jaunākās izmaiņas iegūst ar `git pull origin main`. Pirms tam savas nepabeigtās izmaiņas jāsaglabā komitā vai ar Git stash. Jaunās pārbaudītās izmaiņas nosūta uz `main`. Render automātiski izvieto attiecīgā resursa saknes mapē veiktās izmaiņas. Klienta pārmaiņas izraisa Static Site būvēšanu, servera pārmaiņas Web Service būvēšanu. Dokumentācijas maiņa viena pati lietotni nepārbūvē.

Pēc izvietošanas Dashboard jābūt statusam Live. Pēc tam pārbauda `/health`, atver klientu, izrakstās un pieslēdzas. Ja maina servera datu modeli, pirms izvietošanas vajag datubāzes rezerves kopiju un migrāciju; `create_all` pats nepārveido esošas tabulas.

## 12.5 Bezmaksas plāna robežas

Pēc 15 minūtēm bez pieprasījumiem API var aizmigt. Nākamā palaišana var aizņemt aptuveni minūti. Pirms prezentācijas atver API pārbaudes adresi un sagaida atbildi, tad atver lietotni. Ja pieslēgšanās pieprasījums pārsniedz klienta gaidīšanas laiku, pēc servera pamodināšanas darbību atkārto.

Render panelī datubāzes termiņš ir 2026. gada 27. novembris. Piektdienai, 30. oktobrim, tas ir pietiekams. Bezmaksas datubāze nav ilgtermiņa glabātuve un nepiedāvā automātiskas rezerves kopijas. API vietējā failu sistēma nav pastāvīga, tāpēc kontiem izmantots atsevišķs PostgreSQL resurss. Spēles progress joprojām glabājas lietotāja pārlūkā.

Render piemēro arī datu pārraides un būvēšanas kvotas. Izvietošanas laikā nav izvēlēts maksas plāns vai pievienota maksas iespēja. Ja demonstrāciju vēlāk turpina, jāpārskata termiņš, kvotas un datu saglabāšana. Resursi piektdien automātiski netiek izdzēsti.

Avots: [Render bezmaksas resursu dokumentācija](https://render.com/docs/free), apskatīta 2026. gada 28. oktobrī.
