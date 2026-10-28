# 4 Prasības un ieviešanas statuss

Šī sadaļa aizstāj sākotnējo prasību melnrakstu ar pārbaudāmiem kritērijiem. Statuss “vietēji” nozīmē, ka darbība notiek konkrētā pārlūka glabātuvē. Statuss “plānots” nenozīmē ieviestu funkciju.

## 4.1 Funkcionālās prasības

| ID | Prasība un pieņemšanas kritērijs | Statuss |
|---|---|---|
| F01 | Ar derīgu e-pastu, 8 līdz 128 rakstzīmju paroli un 2 līdz 80 rakstzīmju vārdu izveido vienu kontu | Ieviests API |
| F02 | Atkārtots e-pasts, arī ar citu burtu reģistru, dod 409 un neveido otru kontu | Ieviests API |
| F03 | Pareiza parole ļauj pieslēgties, nepareiza dod 401 ar vienādu ziņu arī neesošam kontam | Ieviests API |
| F04 | Aizsargāts pieprasījums bez derīga un nenokavēta JWT dod 401 | Ieviests API |
| F05 | Pirms spēles parādīšanas pārbauda sesiju; pēc termiņa pārbaudi atkārto | Ieviests klientā |
| F06 | Izrakstīšanās aizver konta skatu arī citās tās pašas izcelsmes cilnēs | Ieviests klientā |
| F07 | API nepieejamība parāda kļūdu un atkārtošanas pogu, saglabājot marķieri | Ieviests klientā |
| F08 | Dažādu kontu kopas, profils un progress vienā pārlūkā nesajaucas | Ieviests vietēji |
| F09 | Kopām darbojas izveide, skatīšana, labošana un dzēšana ar īpašnieka pārbaudi | Ieviests API |
| F10 | Kopas nosaukums ir 3 līdz 60 rakstzīmes; kopā vajag vismaz 5 kartītes | Ieviests vietēji |
| F11 | Kopu sarakstā darbojas meklēšana un filtrēšana | Ieviests vietēji |
| F12 | Spēle parāda atbilžu variantus, rezultātu, atkārtošanu un ranga progresu | Ieviests vietēji |
| F13 | Mācību progress saglabājas serverī un ir pieejams citā ierīcē | Plānots |
| F14 | RP pārbauda serveris un īstā līderu tabulā piedalās reāli konti | Plānots |
| F15 | Administrators pārvalda saturu, kategorijas un sūdzības | Plānots |
| F16 | Viesis izmēģina spēli bez konta | Plānots; šajā versijā spēlei vajag kontu |
| F17 | Publiskas kopas atrod citi konti, privātās redz tikai īpašnieks; vecās lokālās kopas importē serverī | Ieviests API un klientā |

## 4.2 Ievades noteikumi

Vārdu pārbauda pēc ārējo atstarpju noņemšanas. E-pasta adresi pārbauda Pydantic un saglabā ar mazajiem burtiem. Paroli neapgriež un nemaina. Paroles atkārtojumu salīdzina reģistrācijas formā; API saņem tikai vienu paroli. Pieslēgšanās API pieņem paroli ar 1 līdz 128 rakstzīmēm un pēc tam pārbauda jaucējvērtību.

Kopu redaktorā jautājums ir obligāts un var saturēt līdz 200 rakstzīmēm, atbilde līdz 120. Nosaukumu un kartīšu saturu pārbauda pirms vietējās saglabāšanas. Šie noteikumi vēl nav attiecīga kopu REST API validācija.

## 4.3 Nefunkcionālās prasības

| ID | Pārbaudāmais kritērijs | Pašreizējais apliecinājums |
|---|---|---|
| N01 | Pieslēgšanās un reģistrācijas formas ir lietojamas 390 px platā skatā | Pārlūka pārbaude 390 × 844 |
| N02 | Formām ir sasaistīti lauku nosaukumi, paziņojumiem ir `role=alert` | Koda un pārlūka pārbaude |
| N03 | Parole datubāzē nav atklātā tekstā | API un datubāzes tests |
| N04 | SQLite nepieļauj ārējo atslēgu pārkāpumu jaunā savienojumā | Automatizēts tests |
| N05 | DB ceļš nemainās, palaižot no citas mapes | Atsevišķa procesa tests |
| N06 | Atkarību auditā pārbaudes datumā nav zināmu ievainojamību | npm audit un pip-audit |
| N07 | Cits komandas dalībnieks var atkārtot uzstādīšanu un testus | README ar konkrētām komandām |

N01 nav pilns visu ekrānu un pārlūku pieejamības audits. N06 apraksta konkrēto pārbaudi, nevis garantē turpmāku drošību.

## 4.4 Tiesības

Reģistrācija piešķir lomu `user`. Klients nevar ar reģistrācijas pieprasījumu izveidot administratoru. `/api/auth/me` lietotāju un viņa lomu nolasa no datubāzes. `require_admin` ir sagatavota servera pārbaude, taču administratora darbību galapunkti vēl nav ieviesti. Vecā klienta administratora priekšskatījuma pārslēgšana ir noņemta.

## 4.5 Nākamā posma secība

Kopu API ar īpašnieka pārbaudi ir ieviests. Nākamais posms ir mācību progresa saglabāšana, turpmāko shēmu migrācijas un servera pārbaudīti punkti. Moderācija un īsta līderu tabula vēl jāizstrādā.
