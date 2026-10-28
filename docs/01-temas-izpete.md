# 1 Tēmas izvēle un izpēte

## 1.1 Risināmā problēma

Gatavojoties pārbaudes darbiem, skolēnam vajag atkārtot jēdzienus, faktus un vārdu krājumu. Papīra kartītes ir viegli izveidot, taču atkārtošanas reižu un rezultātu uzskaite jāveic pašam. Šī projekta mērķis ir apvienot kartīšu atkārtošanu ar īsu spēles sesiju un redzamu progresu.

## 1.2 Mērķauditorija

Galvenā mērķauditorija ir skolēni, kuri izmanto datoru vai tālruni un grib atkārtot mācību vielu īsās sesijās. Lietotājam vajag izvēlēties tēmu, saprast jautājumu, sniegt atbildi un saņemt skaidru rezultātu. Personīgo kopu redaktors paredzēts paša mācību satura ievadīšanai.

Skolotāju koplietošanas iespējas un satura moderācija ir turpmākās attīstības ieceres. Šī versija vēl nedod skolotājam atsevišķu darbvietu.

## 1.3 Izvēlētā pieeja

SM-2 algoritms aprēķina nākamās atkārtošanas laiku no atbildes novērtējuma. Algoritma sākotnējais apraksts publicēts SuperMemo dokumentācijā [A4]. Projektā kartītes tiek pasniegtas kā jautājumi ar atbilžu variantiem, bet novērtējumu aprēķina klienta kods. Rangu punkti un balvas paredzēti regulāras lietošanas motivēšanai. To ietekme uz mācību rezultātiem šajā projektā nav eksperimentāli izmērīta.

Par atskaites punktiem var izmantot Anki kartīšu mācīšanos un SuperMemo atkārtošanas algoritma aprakstu. Šī projekta atšķirība ir paša izveidota spēles plūsma ar līgām un balvām. Tas nav šo lietotņu pilns aizstājējs.

## 1.4 Darba apjoms

Izstrāde notiek pa daļām. Sākotnējais React prototips parāda kartītes, spēli un balvas. Pārskatāmais papildinājums pievieno kontus un servera datubāzes modeļus. Nākamajam posmam vajag savienot kopu un progresa datus ar API, ieviest servera pārbaudītu punktu uzskaiti un tikai tad veidot īstu kopīgu līderu tabulu.

## 1.5 Panākumu kritēriji

Lietotājs var izveidot kontu, pieslēgties, izspēlēt sesiju un pēc pārlūka pārlādes turpināt ar saviem vietējiem datiem. Kļūdainai ievadei ir saprotams paziņojums. Dažādu kontu dati vienā pārlūkā nesajaucas. Dokumentācija ļauj citam komandas dalībniekam palaist projektu un atkārtot pārbaudes.

Avotu apzīmējumi izskaidroti [avotu sarakstā](11-avoti.md).
