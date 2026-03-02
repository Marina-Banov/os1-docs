---
slug: /
---

# Operacijski sustavi 1

import {TextCardsRow, Lessons} from "@site/src/components/TextCardsRow";

💥 Dobrodošli! Ove stranice namijenjene su studentima kolegija Operacijski sustavi 1 kao vodič kroz laboratorijske vježbe i materijale. Kodove zadataka možete preuzeti putem službenog Merlin sustava kolegija.

📧 Konzultacije se održavaju prije i poslije nastave ili prema dogovoru uz najavu e-mailom: [marina.banov@uniri.hr](mailto:marina.banov@uniri.hr) ili [mateo.mikulic@uniri.hr](mailto:mateo.mikulic@uniri.hr)

## Uvod

Operacijski sustav je temeljni sloj softvera koji omogućuje da hardver i aplikacije međusobno komuniciraju. OS upravlja resursima računala i koordinira rad procesa kako bi svi programi radili pravilno i pouzdano. Bez OS-a, aplikacije ne bi imale standardni način pristupa procesoru, memoriji, disku ili mreži, i sustav ne bi bio funkcionalan. Tijekom semestra bavit ćemo se sljedećim temama koje omogućuju izvršavanje glavnih zadaća OS-a:

- Ljuske za rad s OS
- Sistemski pozivi
- Procesi
- Dretve
- Međuprocesna komunikacija
- Upravljanje memorijom
- Sigurnost i zaštita

### Zašto Linux?

Za praktičan rad koristit ćemo Linux OS. Nekoliko je razloga zašto je Linux dobar za ovakvu vrstu kolegija:

- Gotovo sav softver, uključujući jezgru i osnovne pakete i knjižnice, je otvorenog koda *(open source)*. To znači da je izvorni kod javno dostupan, slobodan za pregled, korištenje, modificiranje i distribuciju. Možemo slobodno proučavati detalje implementacije sustava i nema potrebe za plaćanjem licence.
- Većina Linux jezgre napisana je u programskom jeziku C, koji omogućuje izravan pristup sklopovlju i resursima sustava, s tim da su instrukcije pisane specifično za pojedine arhitekture procesora.
- Linux na jednostavan* način pruža programerima pristup *low-level* aspektima OS-a, što je dobro za razumijevanje mehanika koje se preslikavaju i na ostale operacijske sustave.
- Većina sistemskih funkcija detaljno je dokumentirana i opisana u ugrađenim *man* stranicama.

:::info Napomena
Ako ne koristite Linux kao primarni OS, preporuča se korištenje VirtualBox virtualne mašine ili WSL-a (Windows Subsystem for Linux).
:::

### Rasprostranjenost operacijskih sustava

Operacijski sustavi nisu prisutni samo na našim stolnim računalima (Windows, macOS, Ubuntu), već su sastavni dio cijele moderne tehnologije:
- Server sale i High Performance Computing (HPC, superračunala)
- Mobilni uređaji
- Ugradbeni sustavi (npr. kućanski aparati, bankomati, ruteri, industrijski kontroleri...)
- Igraće konzole
- RTOS *(real-time OS)* ključni u avijaciji, medicini i sl.

## Sadržaj

<TextCardsRow array={Lessons}></TextCardsRow>
