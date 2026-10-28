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

## 5.2 Ranked spēle un kopu pieejamība

Nospiežot “Spēlēt Ranked”, sākas animēta kopas izloze. Josla apstājas pie vienas nejauši izvēlētas, spēlējamas un pašreizējam rangam pieejamas iebūvētās kopas. Pēc īsas rezultāta parādīšanas automātiski sākas spēle par RP. `rankRange` nosaka pieejamo rangu indeksu intervālu. Samazinātas kustības režīmā josla negriežas. Treniņš un personīgās kopas nedod RP. Aktīvās spēles sākuma rangs nemainās kļūdu laikā; jaunai spēlei to pārbauda vēlreiz.

## 5.3 Punkti un sodi

Pareiza pirmā atbilde dod 20 RP. Nepareiza atbilde vai laika beigas dod 20 RP sodu. Kļūdainā kartīte atkārtojas vienu reizi. Pareizs atkārtojums atgūst 10 RP, bet nepareizs atkārtojums dod vēl 20 RP sodu. Atbildes ātrums un kombo nemaina punktu skaitu. Sesijas pabeigšanai, precizitātei un dienu sērijai vairs nav atsevišķas RP piemaksas.

Kļūdu sodi tiek fiksēti uzreiz, bet sesijas beigās norēķina pilnu atbilžu rezultātu. Jau piemērotu sodu neatņem otrreiz. Kopējā un nedēļas bilance nekļūst negatīva. Piemēram, jaunam kontam piecas pareizas un piecas nepareizas pirmās atbildes bez atkārtojuma dod 0 RP. Ja visas piecas kļūdas atkārtojumā izlabo, rezultāts ir 50 RP.

Pametot Ranked spēli, zaudē līdz 20 RP par katru sākotnējās sesijas jautājumu papildus jau piemērotajiem kļūdu sodiem. Desmit jautājumu spēlei tas ir līdz 200 RP; atņem tikai pieejamos punktus. Nepabeigtas spēles pareizo atbilžu balvas un kartīšu progress netiek saglabāti. Pēc paaugstinājuma atkārtota spēle atver kopu izvēli atbilstoši jaunajam rangam.

Pastiprinātāji ir izņemti no veikala, galvenes un jaunajām lāžu un rangu balvām. Ranked spēlē tos nevar izmantot vai iegādāties. Vecajā glabātuvē palikušais lauks saglabāts datu saderībai un neietekmē punktus.

## 5.4 Atkārtošana

SM-2 aprēķinu ievade ir atbildes kvalitātes novērtējums. Projektā to iegūst no atbildes pareizības, ātruma un jautājuma veida. Tiek glabāta nākamā atkārtošanas reize, intervāls un viegluma koeficients. Tā ir projekta pielāgota SM-2 izmantošana, nevis Anki pilna algoritmu kopija.

## 5.5 Līderi un balvas

Nedēļas pretinieki tiek simulēti klientā. Tabula neuzrāda citu reāli reģistrētu kontu rezultātus. Paaugstinājumu balvas, lādes, dienas uzdevumi un kosmētiskie priekšmeti arī glabājas vietējā konta stāvoklī. Izstrādes režīma pārbaudes rīki neparādās produkcijas būvējumā.

Punktus var izmainīt pārlūka glabātuvē. Godīgai vairāku lietotāju sacensībai vajadzīgs serverī pārbaudīts spēles protokols un rezultātu saglabāšana. Šajā versijā pret manipulācijām aizsargātu sacensību sistēmu vēl nav.
