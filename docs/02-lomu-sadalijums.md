# 2. Lomu un pienākumu sadalījums

Komanda: **RRV** — Roberts, Rihards, Valerijs.
Metodoloģija: Agile / Kanban. Rīki: GitHub (viens kopīgs repozitorijs), Trello.

## 2.1. Princips

Visi trīs dalībnieki strādā pie **frontend, backend un testēšanas** — neviena daļa
nav tikai viena autora ziņā. Lai pienākumi būtu skaidri un izsekojami, katram
dalībniekam ir noteikta **primārā atbildības joma**: šajā jomā dalībnieks plāno
uzdevumus, pārskata citu darbu un atbild par kvalitāti.

## 2.2. Sadalījums

| Dalībnieks | Primārā atbildība | Piedalās arī |
|-----------|-------------------|--------------|
| **Roberts** | Komandas koordinācija; GitHub un Trello uzturēšana; backend — REST API struktūra, datubāze, arhitektūra | Frontend komponentes, testēšana, dokumentācija |
| **Rihards** | Frontend — UI komponentes, lietotāja plūsma, dizaina un formātu konsekvence, responsivitāte | Backend endpointi, testēšana, saskarnes skices |
| **Valerijs** | Backend — autentifikācija un lomas, rangu sistēmas loģika, atkārtošanas (SM-2) algoritms; testēšanas plāna īpašnieks | Frontend (statistika, līderu tabula), dokumentācija |

## 2.3. Kopīgie pienākumi (visi)

- Regulāri veikt `commit` savā vārdā ar skaidru ziņojumu, kas norāda Trello kartīti.
- Pirms apvienošanas pārbaudīt koda darbību un novērst konfliktus.
- Pārskatīt (*review*) vismaz viena cita dalībnieka darbu.
- Uzturēt savu Trello kartīšu statusu atbilstoši faktiskajam progresam.
- Piedalīties katrā posma prezentācijā.

## 2.4. Kanban darba noteikumi

- Kolonnas: **Backlog → To Do → In Progress → Review → Done**.
- **WIP limits:** ne vairāk kā **2 kartītes** kolonnā *In Progress* uz katru
  dalībnieku vienlaikus.
- Katra kartīte = viens konkrēts uzdevums (ieteicams 1–4 stundas), ar aprakstu,
  izpildes kritērijiem (*Definition of Done*), atbildīgo un termiņu.
- Pabeigtās kartītes pārvieto uz *Done*, tās nedzēš.
- Katram `commit` / *Pull Request* atbilst vismaz viena Trello kartīte.

## 2.5. Piezīme

Sadalījums tiek pārskatīts katra posma sākumā un vajadzības gadījumā
līdzsvarots, lai slodze starp dalībniekiem paliktu līdzvērtīga.
