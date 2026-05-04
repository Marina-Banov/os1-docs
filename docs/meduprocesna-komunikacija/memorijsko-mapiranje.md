# Memorijsko mapiranje (Mapped memory)

Memorijsko mapiranje je tehnika koja omogućava **povezivanje adresnog prostora procesa i** nekog drugog resursa na sustavu, najčešće **datoteke** pohranjene na disku. Procesi tada mogu pristupati sadržaju datoteke kao običnom polju u memoriji (pokazivaču), bez korištenja sistemskih poziva `read` i `write`.

Za uspostavljanje takvog povezivanja koristi se sistemski poziv `mmap`, koji mapira (preslikava) datoteku u virtualni adresni prostor procesa i vraća pokazivač na početak tog prostora. Nakon toga, čitanje i pisanje se svodi na rad s memorijom (npr. dereferenciranje pokazivača ili korištenje funkcija poput `strncpy`). Jezgra OS u pozadini brine o sinkronizaciji između memorije i datoteke. Kod korištenja zastavice `MAP_SHARED`, promjene koje jedan proces napravi u mapiranoj memoriji odmah se odražavaju u povezanoj datoteci i postaju vidljive drugim procesima koji su mapirali istu datoteku.

Tipičan tijek rada s memorijskim mapiranjem uključuje:

- Otvaranje datoteke (`open`)
- Određivanje njezine veličine (`fstat` ili `ftruncate`)
- Mapiranje u memoriju (`mmap`)
- Rad s podacima kao s običnom memorijom (npr. `strncpy`)
- Oslobađanje mapiranja (`munmap`)

Moguće je da više procesa mapira istu datoteku u svoj adresni prostor i umjesto da ju oni zasebno učitavaju, procesi dijele pristup datoteci. To im omogućava da komuniciraju tako što čitaju i pišu u isti segment memorije. Memorijsko mapiranje često se koristi u različitim implementacijama baza podataka ili aplikacijama za obradu podataka (npr. jedan proces je zadužen za statističku analizu podataka i zapisivanje u datoteku, a drugi proces čita rezultate i prikazuje ih korisniku).

Memorijsko mapiranje je efikasnije od klasičnog uređivanja datoteka, ali manje efikasno od korištenja dijeljene memorije jer su sistemski pozivi i pristup sekundarnoj memoriji (disku) puno sporiji od promjene lokalne memorije programa, pogotovo kada se radi o velikim datotekama.

## Primjer 2: Memorijsko mapiranje

### Klasično uređivanje datoteke

```bash
echo "Hello, world!" > P02_mmap-example.txt
cat P02_mmap-example.txt
```

```bash
gcc P02_file-no-mmap.c -o P02_file-no-mmap && ./P02_file-no-mmap
cat P02_mmap-example.txt
```

### Uređivanje datoteke uz [memorijsko mapiranje](https://pubs.opengroup.org/onlinepubs/009695399/basedefs/sys/mman.h.html)

```bash
echo "Hello, world!" > P02_mmap-example.txt
cat P02_mmap-example.txt
```

```bash
gcc P02_mmap.c -o P02_mmap && ./P02_mmap
cat P02_mmap-example.txt
```

### Međuprocesna komunikacija

```bash
gcc P02_mmap-ipc.c -o P02_mmap-ipc && ./P02_mmap-ipc
```
