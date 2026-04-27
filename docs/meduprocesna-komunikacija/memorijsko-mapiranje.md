# Memorijsko mapiranje (Mapped memory)

Memorijsko mapiranje je tehnika koja omogućava **povezivanje adresnog prostora procesa i** nekog drugog resursa na sustavu, najčešće **datoteke** pohranjene na disku. Procesi tretiraju datoteku kao da je dio primarne memorije te čitaju i pišu u nju bez tradicionalnih `read` i `write` operacija. Memorijsko mapiranje je efikasnije od klasičnog uređivanja datoteka ali manje efikasno od korištenja dijeljene memorije jer su sistemski pozivi i pristup sekundarnoj memoriji (disku) puno sporiji od promjene lokalne memorije programa, pogotovo kada se radi o velikim datotekama. Također, promjene u mapiranoj memoriji odmah se odražavaju u povezanoj datoteci.

Moguće je da više procesa mapira istu datoteku u svoj adresni prostor i umjesto da ju oni zasebno učitavaju, procesi dijele pristup datoteci. To im omogućava da komuniciraju tako što čitaju i pišu u isti segment memorije. Memorijsko mapiranje često se koristi u različitim implementacijama baza podataka ili aplikacijama za obradu podataka (npr. jedan proces je zadužen za statističku analizu podataka i zapisivanje u datoteku, a drugi proces čita rezultate i prikazuje ih korisniku).

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
