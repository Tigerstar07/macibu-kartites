# 10 Reģistrācijas un datubāzes darba pārskats

## 10.1 Pārskatītā versija

Komandas ziņojumā lūgts pārbaudīt reģistrāciju, pieslēgšanos un datubāzi. Darbs atrasts zarā `5-sign-in-log-in`, komitā `10886bd`, ar ziņojumu `sign/login/DB`. Pārskates sākumā `main` un `7-database-implementation` šo papildinājumu vēl nesaturēja. Labojumu zars balstīts tieši uz šo komitu, saglabājot komandas sākotnējo darbu.

Datubāzes fails nav repozitorijā, jo `*.db` ir Git ignorēšanas noteikumos. Pārbaudīta ir shēmas izveide un datu saglabāšana jaunā izolētā datubāzē. Komandas biedra ierīces jau izveidotās datubāzes saturs šeit nav pārskatīts.

## 10.2 Novērstās kļūdas

Vārdu tagad apgriež pirms garuma pārbaudes. Atstarpes vien un pēc apgriešanas pārāk īss vārds dod 422. Reģistrācija atomāri izveido lietotāju un punktu sākuma rindu; e-pasta unikālā ierobežojuma konflikts tiek apstrādāts arī vienlaicīgos pieprasījumos.

JWT pārbaudē obligāti vajag lietotāja identifikatoru un termiņu. Nederīgi tipi, neesošs lietotājs un beidzies termiņš dod 401. Konta lomu nolasa no datubāzes. 401 atbildēm pievienota Bearer galvene. Publiski zināmā noklusējuma atslēga ir aizstāta ar obligātu konfigurāciju, bet iestatīšanas skripts ģenerē nejaušu atslēgu.

Datubāzes ceļš piesaistīts servera mapei. Saglabāts sākotnējais `macibu_kartites.db` faila nosaukums, lai neveidotu tukšu aizstājēju esošai datubāzei. Katrā SQLite savienojumā ieslēgta ārējo atslēgu pārbaude. Tabulas izveido servera dzīves cikla sākumā, nevis moduļa importa laikā.

Klientā spēles maršruti un balvu komponentes tiek atvērtas pēc konta pārbaudes. Servera nepieejamība vairs neizdzēš derīgu marķieri. Formām ir latviskas kļūdas, paroles atkārtojums, automātiskās aizpildes lauki un nosūtīšanas bloķēšana apstrādes laikā. Noņemts solījums par progresa sinhronizāciju starp ierīcēm.

Spēles stāvokli glabā katram kontam atsevišķi. Atkārtota pieslēgšanās saglabā vietējo avatāru un nepiešķir atkārtotu sākuma lādi. Pievienota izrakstīšanās. Citas cilnes reaģē uz marķiera maiņu. Pēc marķiera termiņa un atgriešanās nokavētā cilnē atkārto servera sesijas pārbaudi. Administratora priekšskatījuma pārslēgs ir noņemts; izstrādes balvu rīki neparādās produkcijas būvējumā.

## 10.3 Atkarības un dokumentācija

Sākotnējā Python auditā atrastas 22 zināmas ievainojamības trīs bibliotēkās, bet JavaScript auditā divas augstas bīstamības atkarības. `python-jose` aizstāts ar PyJWT, atjaunināts FastAPI un tā atkarības, kā arī Vite un citas saderīgās JavaScript atkarības. Pēc maiņas atkārtoti izpildīti testi, būvēšana un auditi. Precīzās versijas saglabātas atkarību failos.

README tagad norāda uz īsto klienta mapi un satur izpildāmas komandas. Dokumentācijā atsevišķi aprakstīti kontu dati serverī un spēles dati pārlūkā. Prasībām pievienots ieviešanas statuss, datu modelim faktiskās saites, API kļūdu kodi un testēšanai atkārtojamas komandas. Tekstā nav izmantotas garās domuzīmes.

## 10.4 Neatkarīgā pārskate

Neatkarīgā koda pārskatē norādīja trīs riskus: citās cilnēs paliekošu konta skatu pēc izrakstīšanās, atvērtu skatu pēc sesijas termiņa un iespējamu esošās datubāzes pazaudēšanu pēc faila nosaukuma maiņas. Visiem veikti labojumi. Vienību testi pārbauda cilņu klausītāju, termiņa aprēķinu un DB atrašanās vietu; divu cilņu izrakstīšanās pārbaudīta arī pārlūkā.

## 10.5 Tālākā komandas darba nodošana

Pirms apvienošanas komanda pārbauda savu esošo `backend/.env` un `backend/macibu_kartites.db`, uzstāda atjauninātās atkarības un izpilda testus. Esošu `.env` iestatīšanas skripts nemaina. Ja tajā vēl ir sākotnējā publiskā JWT atslēga, tā jāaizstāj ar nejaušu atslēgu. Parastos kontu datus nav paredzēts dzēst vai pārdēvēt.

Nākamais izstrādes uzdevums ir servera savienojums ar kopām un progresu. To nevar aizstāt ar vēl vienas tukšas tabulas izveidi. Pirms publiskas demonstrācijas jāizlemj arī sesiju atsaukšana, droša izvietošana un datubāzes migrācijas.
