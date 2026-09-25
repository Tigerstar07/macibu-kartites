# 4. Prasību melnraksts

> Šis ir **sākotnējs melnraksts** 1. posmam. Pilna prasību specifikācija ar
> lietošanas gadījumu (*use case*) diagrammu, ieejas/izejas informāciju un
> uzdevumu sadalījumu tiek izstrādāta 2. posmā.

## 4.1. Ekrāni / skati (min. 4: savstarpēji saistīti)

1. **Sākums / publiskās kopas**: kopu saraksts ar meklēšanu un filtru
2. **Reģistrācija / pieslēgšanās**: formas ar validāciju
3. **Kopas skats**: kopas info + kartīšu saraksts, poga "Mācīties"
4. **Kartītes redaktors**: kartītes izveide un labošana (CRUD)
5. **Mācību sesija**: kartītes apgriešana, atbildes novērtējums, progress
6. **Profils / statistika**: precizitāte, sērija, līga, RP vēsture
7. **Līderu tabula**: nedēļas un visu laiku rangs
8. **Administratora panelis**: kopu, lietotāju un sūdzību pārvaldība

## 4.2. Minimālās funkcionālās prasības (kartējums)

| Prasība | Risinājums projektā |
|---------|---------------------|
| ≥ 4 saistīti ekrāni | Skat. 4.1. |
| Pilns CRUD kādam datu tipam | **Kartīšu kopa (Deck)** un **Kartīte (Card)**: izveide, lasīšana, labošana, dzēšana |
| Datu saglabāšana datubāzē | PostgreSQL / SQLite caur SQLAlchemy |
| ≥ 2 formām datu validācija | Reģistrācija (e-pasts, parole ≥ 8 simboli, paroļu sakritība); kartīte (priekšpuse/aizmugure obligāta, garuma limits); kopa (nosaukums 3-60 simboli) |
| Kļūdaini dati neļauj saglabāt + saprotams paziņojums | Backend Pydantic validācija + frontend lauka kļūdas |
| Apstiprinājums pēc izveides/labošanas/dzēšanas | "Toast" paziņojums + saraksta atjaunināšana |
| Dzēšanai nepieciešams apstiprinājums | Modālais dialogs "Vai tiešām dzēst?" |
| Meklēšana vai filtrēšana pēc ≥ 1 kritērija | Meklēšana pēc kopas nosaukuma; filtrs pēc kategorijas / taga / valodas |

## 4.3. Nefunkcionālās prasības

- Konsekvents dizains visos ekrānos (viena krāsu palete, navigācija, komponentes).
- Saprotami kļūdu un informācijas paziņojumi.
- Darbība bez kritiskām kļūdām demonstrācijas laikā.
- Responsīvs / adaptīvs izkārtojums dažādos loga izmēros.
- Vienots datuma, laika un skaitļu formāts visā sistēmā.

## 4.4. Datu entītijas (melnraksts: precizē 2. posmā ER diagrammā)

| Entītija | Galvenie lauki |
|----------|----------------|
| **User** | id, e-pasts, paroles jaucējs, loma (guest/user/admin), reģistrācijas datums |
| **Deck** | id, īpašnieks (User), nosaukums, apraksts, kategorija, valoda, publisks (jā/nē), izveidots |
| **Card** | id, deck_id, priekšpuse, aizmugure, izveidots, labots |
| **Review** | id, user_id, card_id, datums, novērtējums (0-5), nākamā atkārtošana, intervāls, *ease factor* |
| **Score** | user_id, total_rp, week_rp, week_start, streak_days, last_study_date, league |
| **Category** | id, nosaukums |
| **Report** | id, deck_id, iesniedzējs, iemesls, statuss, izveidots |

## 4.5. Lietotāju lomas un tiesības (melnraksts)

| Darbība | Viesis | Lietotājs | Admins |
|---------|:---:|:---:|:---:|
| Skatīt publiskās kopas | ✔ | ✔ | ✔ |
| Demo mācību sesija | ✔ | ✔ | ✔ |
| Skatīt līderu tabulu | ✔ | ✔ | ✔ |
| Reģistrēties / pieslēgties | ✔ |, |, |
| CRUD savām kopām un kartītēm |, | ✔ | ✔ |
| Mācīties ar progresa saglabāšanu un RP |, | ✔ | ✔ |
| Iesniegt sūdzību par kopu |, | ✔ | ✔ |
| Moderēt kopas, pārvaldīt lietotājus un kategorijas |, |, | ✔ |
