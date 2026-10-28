# 8 Lietotāja ceļvedis

## 8.1 Darba sākšana

Palaid serveri un klientu pēc galvenā README instrukcijas. Atver `http://localhost:5173`. Pirms spēles atveras pieslēgšanās forma. Šajā versijā spēles izmantošanai vajag kontu.

## 8.2 Konta izveide

1. Izvēlies “Vēl nav konta? Reģistrēties”.
2. Ievadi vārdu ar vismaz 2 rakstzīmēm un derīgu e-pasta adresi.
3. Ievadi paroli ar vismaz 8 rakstzīmēm un atkārto to otrajā paroles laukā.
4. Spied “Reģistrēties”. Pēc veiksmīgas konta izveides atveras sākumlapa.

Ja paroles nesakrīt vai vārds sastāv tikai no atstarpēm, forma parāda kļūdu. Ja e-pasts jau reģistrēts, izvēlies pieslēgšanos. Lietotne nesūta e-pasta apstiprinājumu un neveic Google konta autentifikāciju.

## 8.3 Pieslēgšanās un sesija

Ievadi reģistrācijā lietoto e-pastu un paroli. Nepareizas paroles gadījumā parādās ziņa “Nepareizs e-pasts vai parole.” Pēc lapas pārlādes lietotne pārbauda saglabāto marķieri serverī. Beigusies sesija atver pieslēgšanās formu.

Ja API nevar sasniegt, parādās savienojuma kļūda. Palaid serveri vai pārbaudi tā adresi un spied “Mēģināt vēlreiz”. Šāda kļūda pati par sevi neizdzēš konta marķieri. Lai izvēlētos citu kontu, izmanto attiecīgo pogu kļūdas ekrānā.

## 8.4 Mācību sesija

Spēlei par punktiem sākumlapā spied “Spēlēt Ranked”. Kustīgā josla izlozē vienu tavam rangam pieejamu kopu, parāda rezultātu un automātiski sāk spēli. Atbildi, izvēloties vienu no parādītajiem variantiem. Spēle parāda pareizo atbildi un aprēķina kartītes atkārtošanas progresu. Pēc sesijas var apskatīt rezultātu. Atkārtota Ranked spēle sāk jaunu izlozi atbilstoši pašreizējam rangam.

Ja gribi trenēt konkrētu tēmu, atver “Kopas”, izvēlies kopu un spied “Spēlēt”. Šis treniņš nedod RP. Personīgās kopas arī paredzētas treniņam.

## 8.5 Savas kopas

Kopu sarakstā izvēlies jaunas kopas izveidi. Norādi nosaukumu, tēmu un vismaz 5 kartītes. Katrā kartītē vajadzīgs jautājums un pareizā atbilde. Nepareizie varianti nedrīkst sakrist ar pareizo atbildi vai atkārtoties. Saglabā kopu, lai tā parādītos tavā sarakstā. Labošanai atver kopas redaktoru; dzēšanai apstiprini dialogu.

Saglabājot kopu, klients sagaida servera apstiprinājumu. Ieslēgta atzīme “Publiska kopa” ļauj to atrast un spēlēt citiem kontiem. Izslēgta atzīme kopu atstāj pieejamu tikai īpašniekam. Citi lietotāji var izveidot savu kopiju, bet nevar mainīt oriģinālu.

Agrāk izveidotās lokālās kopas automātiski augšupielādē pēc īpašnieka pieslēgšanās vai lapas pārlādes. Tāpēc pēc šī atjauninājuma kopas autoram vienreiz jāatver vietne tajā pašā pārlūkā, kurā kopa izveidota. Cits lietotājs pēc tam var spiest “Atjaunot kopas” un meklēt pēc nosaukuma. Saraksts atjaunojas arī pēc atgriešanās cilnē un ik pēc 30 sekundēm.

Ja serveris nepieņem kopu vai nav sasniedzams, parādās kļūda. Vecā lokālā kopija paliek saglabāta. Jaunu redaktora saturu nezaudē neveiksmīga saglabāšana. Ja cita ierīce jau mainījusi kopu, serveris noraida vecās versijas pārrakstīšanu; atver atjaunoto kopu vēlreiz.

## 8.6 Profils un izrakstīšanās

Profilā var skatīt statistiku, sasniegumus, kolekciju un iestatījumus. Izrakstīšanās atrodas sadaļā “Profils”, cilnē “Iestatījumi”, pie rindas “Konts”. Poga “Izrakstīties” atver pieslēgšanos arī citās tās pašas vietnes cilnēs.

Izrakstīšanās neizdzēš konta vietējo progresu. Pieslēdzoties tam pašam kontam tajā pašā pārlūkā, dati atjaunojas. Cits konts saņem atsevišķu glabātuvi. Vārda vai avatāra maiņa profilā pagaidām ir vietēja izmaiņa.

## 8.7 Datu robežas

Citā ierīcē iespējams pieslēgties kontam un atvērt serverī saglabātās kopas, taču spēles progress netiek sinhronizēts. Pārlūka vietnes datu dzēšana izdzēš vietējo progresu un vēl neaugšupielādētās kopas. Serverī jau saglabātās kopas paliek pieejamas pēc pieslēgšanās. Privātā pārlūkošana var nesaglabāt vietējos datus pēc loga aizvēršanas. Koplietotā datorā izraksties pēc lietošanas.
