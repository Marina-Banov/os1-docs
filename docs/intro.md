---
slug: /
---

# Operacijski sustavi 1

import {TextCardsRow, Lessons} from "@site/src/components/TextCardsRow";

Ove stranice namijenjene su studentima kolegija Operacijski sustavi 1 kao vodič kroz laboratorijske vježbe i materijale. Kodove zadataka možete preuzeti sa službene Merlin stranice kolegija.

Konzultacije se održavaju prije i poslije nastave ili prema dogovoru uz najavu e-mailom.

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

- Gotovo sav softver, uključujući jezgru i osnovne pakete i knjižnice, je otvorenog koda *(open source)*. To znači da je izvorni kod javno dostupan, slobodan za pregled, korištenje, modificiranje i distribuciju. Možete slobodno proučavati detalje implementacije sustava i nema potrebe za plaćanjem licence.
- Većina Linux jezgre napisana je u programskom jeziku C, koji omogućuje izravan pristup sklopovlju i resursima sustava, s tim da su instrukcije pisane specifično za pojedine arhitekture procesora.
- Linux na jednostavan* način pruža programerima pristup *low-level* aspektima OS-a, što je dobro za razumijevanje mehanika koje se preslikavaju i na ostale operacijske sustave.
- Većina sistemskih funkcija detaljno je dokumentirana i opisana u ugrađenim *man* stranicama.

:::info Napomena
Ako ne koristite Linux kao primarni OS, preporučuje se korištenje jedne od dviju opcija:
- **VirtualBox:** Preuzeti VM s Merlin stranice kolegija &rarr; otvoriti VirtualBox &rarr; *File* &rarr; *Import Appliance* &rarr; odabrati .ova datoteku koju ste preuzeli &rarr; *Next* &rarr; *Finish*.
- **WSL (Windows Subsystem for Linux):** [Upute za instalaciju](https://www.youtube.com/watch?v=-Wg2r1lWrTc). WSL primarno pruža rad s Linux sustavom u terminalu, što nam je za ovaj kolegij i najvažnije. U pravilu je brži i troši manje resursa od VirtualBoxa.
:::

### Rasprostranjenost operacijskih sustava

import ImageGrid from '@site/src/components/ImageGrid';

<ImageGrid
  images={[
    { src: 'https://res.cloudinary.com/canonical/image/fetch/f_auto,q_auto,fl_sanitize,w_1088,h_630/https://assets.ubuntu.com/v1/a8e96807-desktop-xps13-small.png', caption: 'Osobna računala (Linux)' },
    { src: 'https://www.pcspecialist.co.uk/images/landing/windows/win11/win11-perspective.png', caption: 'Stolna računala (Windows)' },
    { src: 'https://www.siliconrepublic.com/wp-content/uploads/2017/03/Server-room.jpg', caption: <a href="https://www.youtube.com/watch?v=K8KXXJH8Zy4">Server sale i High Performance Computing</a> },
    { src: 'https://images.unsplash.com/photo-1560209617-059c0bd661ba?q=80&h=450&auto=format&fit=crop', caption: 'Mobilni uređaji' },
    { src: 'https://images.unsplash.com/photo-1601597110547-78516f198ce4?q=80&h=450&auto=format&fit=crop', caption: 'Ugradbeni sustavi (bankomati)' },
    { src: 'https://dlcdnwebimgs.asus.com/gain/e1424321-42b3-4b4a-8ea4-eb3309156025/', caption: 'Ugradbeni sustavi (ruteri)' },
    { src: 'https://images.unsplash.com/photo-1632923565835-6582b54f2105?q=80&h=450&auto=format&fit=crop', caption: 'Ugradbeni sustavi (kućanski aparati)' },
    { src: 'https://images.unsplash.com/photo-1665041974623-d398d035023e?q=80&h=450&auto=format&fit=crop', caption: 'Igraće konzole' },
    { src: 'https://images.unsplash.com/photo-1493673155827-a7617e74a0ca?q=80&h=450&auto=format&fit=crop', caption: 'Real-Time OS' },
  ]}
/>

## Sadržaj

<TextCardsRow array={Lessons}></TextCardsRow>
