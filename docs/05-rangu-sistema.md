# 5 Rangu sistēma

Apraksts atbilst `src/lib/rank.ts`, `src/lib/rp.ts`, `src/lib/sm2.ts` un spēles stāvoklim. Aprēķini šajā versijā notiek klientā. Datubāzes `scores` tabula vēl nesaņem spēles rezultātus.

## 5.1 Rangu sliekšņi

Rangu nosaka kopējie RP. Nedēļas RP izmanto atsevišķajai nedēļas tabulai. Katrā līgā ir trīs pakāpes.

| Līga | III pakāpe | II pakāpe | I pakāpe |
|---|---|---|---|
| Bronza | 0 | 150 | 350 |
| Sudrabs | 600 | 850 | 1150 |
| Zelts | 1500 | 1950 | 2450 |
| Platīns | 3000 | 3600 | 4300 |
| Dimants | 5000 | 6000 | 7200 |

## 5.2 Punkti par atbildi

Pareiza atbilde ar izvēles variantiem dod 10 pamata RP, bet patiesības vai aplamības jautājums dod 6 RP. Nepareiza atbilde dod 0. Atbildes ātruma piemaksa ir 5 RP līdz 3 sekundēm, 3 RP no 3 līdz nepilnām 6 sekundēm un 1 RP no 6 līdz nepilnām 10 sekundēm. Vēlāk piemaksas nav.

Pareizo atbilžu sērijas reizinātājs sākas ar 1. Pie 3, 5, 8 un 12 pareizām atbildēm tas kļūst attiecīgi 1,2; 1,5; 2 un 2,5. Atkārtotai apguvei lieto 0,5 reizinātāju, bet RP pastiprinājumam 1,5. Atbildes punktus noapaļo līdz veselam skaitlim.

## 5.3 Sesijas rezultāts

Pie vismaz trīs atbildēm pabeigta sesija dod 20 papildu RP. Precizitātes piemaksa atbilžu punktiem ir 15 procenti no 75 procentu precizitātes, 30 procenti no 90 procentiem un 50 procenti par pilnīgi pareizu sesiju. Pirmajai dienas sesijai paredzēti 25 RP. Dienu sērijas piemaksa ir 5 procenti par dienu, nepārsniedzot 50 procentus.

Spēles plūsma var ierobežot šo aprēķinu izmantošanu. Iebūvētās kopas dod RP, bet paša veidotās kopas paredzētas treniņam bez RP. Priekšlaicīgi pārtraukta spēle nedod sesijas balvu. Atbildes atkārtošanas plānam var būt fiksētas pirms iziešanas. Tas jāņem vērā, skaidrojot atšķirību starp RP un kartītes progresu.

## 5.4 Atkārtošana

SM-2 aprēķinu ievade ir atbildes kvalitātes novērtējums. Projektā to iegūst no atbildes pareizības, ātruma un jautājuma veida. Tiek glabāta nākamā atkārtošanas reize, intervāls un viegluma koeficients. Tā ir projekta pielāgota SM-2 izmantošana, nevis Anki pilna algoritmu kopija.

## 5.5 Līderi un balvas

Nedēļas pretinieki tiek simulēti klientā. Tabula neuzrāda citu reāli reģistrētu kontu rezultātus. Paaugstinājumu balvas, lādes, dienas uzdevumi un kosmētiskie priekšmeti arī glabājas vietējā konta stāvoklī. Izstrādes režīma pārbaudes rīki neparādās produkcijas būvējumā.

Punktus var izmainīt pārlūka glabātuvē. Godīgai vairāku lietotāju sacensībai vajadzīgs serverī pārbaudīts spēles protokols un rezultātu saglabāšana. Šajā versijā pret manipulācijām aizsargātu sacensību sistēmu vēl nav.
