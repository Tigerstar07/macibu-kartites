# 9 Testēšanas pārskats

Pārbaudes datums ir 2026. gada 28. oktobris. Testi izpildīti Windows vidē ar Python 3.12.13 un Node.js 24.11.0. API darbojās lokāli 8000. portā, klients 5173. portā. Pārlūka pārbaudēs izmantots Playwright ar Chromium.

## 9.1 Automatizētās pārbaudes

| Grupa | Komanda | Rezultāts |
|---|---|---|
| Servera API un iestatīšana | `python -m pytest -q` virtuālajā vidē | 24 testi izpildīti sekmīgi |
| Klienta sesija un konti | `npm test` | 14 testi izpildīti sekmīgi |
| TypeScript tipi | `npm run typecheck` | Bez kļūdām |
| Produkcijas būvējums | `npm run build` | Izveidots; ir brīdinājums par lielu JavaScript daļu |
| JavaScript atkarības | `npm audit` | Nav atrastu zināmu ievainojamību |
| Python atkarības | `pip-audit -r requirements.txt` | Nav atrastu zināmu ievainojamību |

Servera pārbaudēs izmanto pagaidu SQLite failu. Testi aptver konta un sākuma punktu rindas izveidi, Argon2 jaucējvērtību, vārda apgriešanu un validāciju, e-pasta reģistru, vienlaicīgu reģistrāciju, pareizu un nepareizu paroli, JWT laukus un termiņu, 401 galveni, CORS un ārējās atslēgas. Atsevišķi pārbauda DB ceļu no citas mapes un konfigurācijas izveidi bez esošā faila pārrakstīšanas.

Klienta testi aptver tīkla kļūdu, 503 un 401 atšķirīgu apstrādi, lauka kļūdu tulkojumu, cilņu paziņošanu, termiņa taimera aprēķinu un kontu stāvokļa maiņu. Pārbauda, ka atkārtota ieeja nepiešķir otru sākuma lādi un lomu atjauno no servera datiem.

## 9.2 Pārlūka pārbaudes

| ID | Darbība | Novērojums |
|---|---|---|
| UI01 | Atvērt sākumlapu bez marķiera | Parādās pieslēgšanās; spēle nav uzstādīta aiz pārklājuma |
| UI02 | Reģistrēt kontu ar nesakrītošām parolēm | Redzams latvisks kļūdas paziņojums |
| UI03 | Reģistrēt ar derīgiem datiem | Atveras spēles sākumlapa ar konta vārdu |
| UI04 | Ievadīt nepareizu paroli un tad pareizu | Vispirms 401 ziņa, pēc tam sekmīga pieslēgšanās |
| UI05 | Pārlādēt lapu pēc pieslēgšanās | Sesija tiek pārbaudīta un atjaunota |
| UI06 | Izrakstīties, kad atvērtas divas cilnes | Abās atveras pieslēgšanās |
| UI07 | Sesijas pārbaudē atgriezt 503 un tad atjaunot API | Marķieris saglabājas; atkārtošanas poga atjauno skatu |
| UI08 | Apskatīt formas 1440 × 1000 un 390 × 844 | Lauki un pogas ir lietojami; tālruņa skatā nav horizontālas pārplūdes |
| UI09 | Diviem kontiem mainīt kustības iestatījumu un atgriezties pirmajā kontā | Otram kontam ir atsevišķs iestatījums; pirmajam atjaunojas savējais |
| UI10 | Lietot īsi derīgu servera parakstītu marķieri un sagaidīt termiņa beigas | Atveras pieslēgšanās un nederīgais marķieris tiek dzēsts |
| UI11 | Atvērt profila iestatījumus produkcijas būvējumā | Testēšanas rīki nav redzami |

Sesijas termiņš un kontu maiņa pārbaudīti arī produkcijas būvējumā. Imitētā 503, nepareizā parole un nokavētais marķieris apzināti rada tīkla kļūdu ierakstus pārlūka žurnālā. Tos neuzskata par lietotnes neapstrādātu izņēmumu.

## 9.3 Kļūdu labošanas pierādījumi

Pirms servera labojumiem regresijas pārbaudē bija 14 neveiksmīgi un 7 sekmīgi testi. Konstatēja tukšu vārdu pieņemšanu, neatbilstošu JWT apstrādi, trūkstošu termiņa prasību, neieslēgtas ārējās atslēgas, nedrošu noklusējuma atslēgu un no darba mapes atkarīgu DB ceļu.

Klienta sākotnējās sesijas pārbaudēs 3 testi neizdevās un 2 izdevās. Pēc labojumiem izpildās arī papildu kontu nošķiršanas, termiņa un cilņu pārbaudes. Pārbaudes atklāj iepriekšējo kļūdu un apliecina atbilstošās darbības maiņu.

## 9.4 Kas nav pārbaudīts

Nav veikts PostgreSQL integrācijas tests, pilns visu spēles režīmu audits, reālas daudzlietotāju sacensības, publiskas izvietošanas slodzes tests, Safari un Firefox pārbaude vai pilns pieejamības audits. Lielā JavaScript daļa var palēnināt pirmo ielādi vājā tīklā; turpmāk jāvērtē ekrānu ielāde pēc vajadzības. Atkarību audita rezultāts attiecas uz pārbaudes datumu.

## 9.5 Visu zaru apvienošana

Pārbaudīti visi attālinātie zari. Pēdējās neapvienotās izmaiņas bija Riharda Ranked spēles pārstrāde. Apvienojot saglabāts Valerija sadalītais spēles HUD un jaunie rangu kopu noteikumi. Pieci papildu regresijas testi pārbauda kļūdu pilno uzskaiti, nulles bilanci, kopējās un nedēļas bilances atšķirības, atkārtojuma atgūtos punktus un negatīvas bilances nepieļaušanu. Pirms labojuma visi pieci neizdevās, pēc labojuma tie izpildās sekmīgi.
