# 7 API apraksts

Noklusējuma API adrese ir `http://localhost:8000`. Pieprasījumi un atbildes izmanto JSON. Interaktīvais apraksts ir `/docs`, mašīnlasāmais apraksts `/openapi.json`.

## 7.1 Galapunkti

| Metode | Ceļš | Autentifikācija | Veiksmīga atbilde |
|---|---|---|---|
| GET | `/health` | Nav vajadzīga | 200 ar `{"status":"ok"}` |
| POST | `/api/auth/register` | Nav vajadzīga | 201 ar marķieri un kontu |
| POST | `/api/auth/login` | Nav vajadzīga | 200 ar marķieri un kontu |
| GET | `/api/auth/me` | Bearer JWT | 200 ar konta datiem |

## 7.2 Reģistrācija

```json
{
  "email": "skolens@example.com",
  "password": "Piemera-parole-123",
  "display_name": "Skolēns"
}
```

Parolei jābūt no 8 līdz 128 rakstzīmēm. Vārdam pēc ārējo atstarpju noņemšanas vajag no 2 līdz 80 rakstzīmēm. E-pasts ir unikāls bez atšķirības starp lielajiem un mazajiem burtiem. Lomu nevar izvēlēties; jauns konts saņem `user`.

Veiksmīgas atbildes struktūra:

```json
{
  "access_token": "<parakstits-jwt>",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "skolens@example.com",
    "display_name": "Skolēns",
    "role": "user",
    "created_at": "2026-10-28T12:00:00Z"
  }
}
```

Šie ir ilustratīvi dati, nevis demonstrācijas konta piekļuves dati.

## 7.3 Pieslēgšanās

```json
{
  "email": "skolens@example.com",
  "password": "Piemera-parole-123"
}
```

Atbildes struktūra ir tāda pati kā reģistrācijai. Neesoša konta un nepareizas paroles gadījumā atbilde ir 401 ar vienādu paziņojumu. Pieslēgšanās API ierobežo paroles garumu līdz 128 rakstzīmēm.

## 7.4 Sesijas pārbaude

Pievieno galveni:

```http
Authorization: Bearer <access_token>
```

`GET /api/auth/me` atgriež tikai `user` objektu bez ārējā marķiera apvalka. JWT vajadzīgi `sub` un `exp` lauki, pareizs HS256 paraksts un nepārsniegts termiņš. `sub` identificē pozitīvu veselu lietotāja ID. Kontam joprojām jāpastāv datubāzē. Lomu nolasa no datubāzes, nevis uzticas klienta laukam.

## 7.5 Kļūdas

| Kods | Nozīme | Klienta rīcība |
|---|---|---|
| 401 | Nepareizi piekļuves dati vai nederīgs marķieris | Pieslēgšanās formā rāda ziņu; sesijas pārbaudē izdzēš nederīgo marķieri |
| 403 | Nav vajadzīgās lomas | Rāda piekļuves kļūdu; pārbaude sagatavota nākamajiem galapunktiem |
| 409 | E-pasts jau reģistrēts | Piedāvā pieslēgties esošajam kontam |
| 422 | Neatbilstoša ievade | Rāda kļūdainā lauka ziņu latviski |
| 5xx | Servera kļūda | Saglabā marķieri un ļauj mēģināt atkārtoti |

401 atbildēm ir `WWW-Authenticate: Bearer`. Vienkāršas kļūdas formāts ir `{"detail":"Paziņojums"}`. Pydantic 422 atbildē `detail` ir kļūdu saraksts ar lauka atrašanās vietu un kļūdas tipu. Klients šo sarakstu pārvērš latviskā paziņojumā. API pieprasījumam klientā ir 10 sekunžu gaidīšanas ierobežojums.

## 7.6 Drošības robežas

Izrakstīšanās šobrīd dzēš pārlūka marķieri. Tā neatsauc jau nokopētu JWT serverī; tas paliek derīgs līdz termiņam vai atslēgas nomaiņai. Nav atsvaidzināšanas marķieru, e-pasta apstiprināšanas, paroles atjaunošanas un pieprasījumu biežuma ierobežojuma. “Gmail” šeit nozīmē iespējamu e-pasta adresi, nevis Google OAuth pieslēgšanos.
