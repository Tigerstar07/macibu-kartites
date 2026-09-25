# 5. Rangu sistēma: sākotnējā koncepcija

> Melnraksts 1. posmam. Precīzas formulas un robežas tiek apstiprinātas 2. posmā.

Mērķis: motivēt lietotāju atkārtot kartītes **regulāri** un **godīgi**, nevis
"zubrīt" pēdējā brīdī.

## 5.1. Rangu punkti (RP)

RP piešķir **servera pusē** pēc katras mācību sesijas:

| Darbība | RP |
|---------|----|
| Atkārtota unikāla kartīte (sesijā) | +1 |
| Pareiza atbilde (novērtējums ≥ 3 no 5) | +2 |
| Izpildīts dienas mērķis (piem., 20 kartītes) | +10 |
| Dienu sērijas (*streak*) reizinātājs | ×1.0 … ×1.5 |

- Sērijas reizinātājs aug par 0.1 par katru secīgu mācību dienu, maksimums ×1.5
  (7 dienas). Izlaista diena atiestata sēriju uz ×1.0.
- Skaita **unikālas** kartītes dienā, vienas kartītes atkārtota "grindošana"
  papildu RP nedod.

## 5.2. Līgas

Pēc **nedēļas RP** (atiestatās pirmdienās 00:00):

| Līga | Nedēļas RP |
|------|-----------|
| Bronze | 0, 199 |
| Silver | 200, 499 |
| Gold | 500, 999 |
| Platinum | 1000, 1999 |
| Diamond | 2000+ |

## 5.3. Līderu tabula

- **Nedēļas**: kārto pēc nedēļas RP, atiestatās katru pirmdienu.
- **Visu laiku**: kārto pēc kopējā RP.
- Rāda pozīciju, lietotājvārdu, līgu, sēriju.

## 5.4. Antimanipulācijas pasākumi

- Visi RP aprēķini notiek serverī, nevis klientā.
- Dienas RP griesti (piem., 300 RP dienā).
- Skaita tikai unikālas kartītes dienā.
- Novērtējums tiek pieņemts tikai kartītēm, kuru atbilde faktiski parādīta.

## 5.5. Datu modelis (skat. arī `04-prasibu-melnraksts.md`)

```
Score(user_id, total_rp, week_rp, week_start, streak_days, last_study_date, league)
```

## 5.6. Atvērtie jautājumi 2. posmam

- Līga pēc nedēļas RP vai pēc kopējā RP?
- Vai rādīt RP pieauguma animāciju sesijas beigās?
- Sezonu ilgums (nedēļa / mēnesis) un balvas par augstu vietu.
- Vai viesim rādīt "ēnu" RP, lai motivētu reģistrēties?
