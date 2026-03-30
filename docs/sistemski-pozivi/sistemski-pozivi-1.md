# Sistemski pozivi 1

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

## Jezgreni i korisnički način rada

Korisnički su programi obično ograničeni na **vlastiti adresni prostor** i imaju niske privilegije. To znači da obična aplikacija ne može izravno pristupiti ili modificirati memoriju drugog programa ili jezgre OS-a. Također, ne može izravno manipulirati sklopovljem.

Ako aplikacija treba izvršiti neku operaciju koja uključuje sklopovlje (npr. čitanje datoteke s diska ili slanje podataka putem mreže), jezgra OS-a to može omogućiti kroz **strogo definirane operacije**.

Moderne arhitekture procesora koriste koncept prstenova privilegija. Kod koji se izvršava u jezgrenom načinu rada može pristupiti bilo kojoj memorijskoj adresi i hardverskom resursu. Osjetljive operacije izvršava jezgra OS na **najvišoj razini privilegija**. Korisničkim su programima ove usluge dostupne putem sistemskih poziva.

![](https://upload.wikimedia.org/wikipedia/commons/2/2f/Priv_rings.svg)

| Jezgreni način rada                       | Korisnički način rada               |
|-------------------------------------------|-------------------------------------|
| Operacijski sustav                        | Aplikacije na korisničkoj razini    |
| Upravljanje resursima i sklopovljem       | Pokretanje korisničkih aplikacija   |
| Visoka razina privilegija                 | Niska razina privilegija            |
| Neograničen pristup sklopovlju            | Ograničen pristup sklopovlju        |
| Potpuni pristup memoriji sustava          | Ograničen pristup memoriji sustava  |
| Problemi s jezgrom mogu srušiti cijeli OS | Problemi s aplikacijom su izolirani |

## Kada koristimo sistemske pozive?

Sistemski su pozivi uključeni u gotovo svaku operaciju koja izlazi izvan okvira same računske logike programa:

1. **Upravljanje procesima:** Kreiranje novih procesa, njihova terminacija ili promjena prioriteta.
2. **Upravljanje datotekama:** Sve radnje poput otvaranja, čitanja, pisanja, brisanja ili pretraživanja datoteka na disku.
3. **Upravljanje uređajima:** Komunikacija s ulazno/izlaznim uređajima i konfiguracija sklopovlja.
4. **Održavanje i informacije:** Informacije o vremenu, korisnicima i resursima, konfiguracija parametara sustava.
5. **Komunikacija:** Dijeljenje memorije između procesa, sinkronizacija i mrežni prijenos podataka.
6. **Sigurnost:** Provjera prava pristupa, autentikacija korisnika, enkripcija i dekripcija podataka.

S druge strane, čiste aritmetičke operacije, logičke operacije unutar procesora ili manipuliranje lokalnim varijablama unutar memorijskog prostora programa **ne zahtijevaju** sistemske pozive jer ne utječu izravno na integritet cijelog sustava.

## Kako funkcioniraju sistemski pozivi?

Implementacija se sistemskih poziva razlikuje ovisno o arhitekturi procesora. Korisnički programi u pravilu ne moraju znati kako je sistemski poziv implementiran i većina je detalja skrivena od programera. Potrebno je samo ispravno pozivati funkcije sistemskih poziva koristeći [API](https://www.howtogeek.com/343877/what-is-an-api/) *(Application Programming Interface).*

Pobrinite se da je na vašem sustavu instaliran dijagnostički alat `strace`:

```bash
sudo apt install strace
```

Isječak iz službene dokumentacije:

```bash
man syscalls 2>/dev/null | head -n 25 | tail -n 13
```

```
    System calls and library wrapper functions
       System calls are generally not invoked directly, but rather via wrapper
       functions in glibc (or perhaps some other library).  For details of di‐
       rect invocation of a system call, see intro(2).  Often, but not always,
       the  name of the wrapper function is the same as the name of the system
       call that it invokes.  For example, glibc contains a  function  chdir()
       which invokes the underlying "chdir" system call.

       Often the glibc wrapper function is quite thin, doing little work other
       than copying arguments to the right registers before invoking the  sys‐
       tem  call,  and  then setting errno appropriately after the system call
       has returned.   (These  are  the  same  steps  that  are  performed  by
       syscall(2), which can be used to invoke system calls for which no wrap‐
```

### Primjer 1

Kreirajmo jednostavan C program:

```c title="P01_hello-world.c"
#include <stdlib.h>
#include <stdio.h>

int main(int argc, char const *argv[]) {
    int day = 20, month = 4, year = 2024;
    printf("%d. %d. %d.\n", day, month, year);
    return 0;
}
```

Nakon prevođenja programa, možemo analizirati njegove sistemske pozive koristeći `strace`:

```bash
gcc P01_hello-world.c -o P01_hello-world
./P01_hello-world
strace ./P01_hello-world
```

Vidimo da je funkcija `printf` zapravo *wrapper* za sistemski poziv `write`. Funkcija `write` prihvaća tri argumenta:

- Referencu na izlazni tok podataka (u ovom slučaju `1` označava standardni izlaz)
- Adresu znakovnog niza (dovoljno je proslijediti znakovni niz, prevoditelj će se pobrinuti za alokaciju memorije)
- Duljinu znakovnog niza (broj bajtova, u ovom slučaju 13)

### Zadatak 1: Dijagnostički alat `strace`

```bash
strace ./P01_hello-world
```

Uz sve sistemske pozive želimo i vrijeme kada su se izvršavali, to radimo s `-t`. Specifične sistemske pozive možemo pratiti s `-e`:

```bash
strace -t -e trace=openat,read ./P01_hello-world
```

Detaljnije vrijeme možemo dobiti s `-tt`:

```bash
strace -tt -e trace=openat,read ./P01_hello-world
```

Dodajmo `-c` opciju kako bi dobili statistički prikaz koji je vizualno prihvatljiviji:
```bash
strace -c ./P01_hello-world
```

- Napišite naredbu za detaljni prikaz vremena i pratite sistemske pozive `openat` i `write`
- Napišite naredbu da pratite samo sistemski poziv `read`, ali uz statistički prikaz
- Napišite naredbu koja koristi statistički prikaz i prati sistemske pozive `openat` i `read`

### Primjer 2: [UNIX timestamp](https://www.unixtimestamp.com/)

Usporedite izvršavanje koda za ispis trenutačnog vremena pisanog u Bashu, C-u i Pythonu:

<Tabs>
  <TabItem value="bash" label="Bash">

```bash title="P02_unix-timestamp.sh"
#!/bin/bash

timer=$(date +%s)
current_time=$(date)

echo "Timer: $timer"
echo "The current time is:"
echo "$current_time"
if [ $(date +%Z) = "BST" ]
then
    echo "Daylight savings time"
else
    echo "Standard time"
fi
```
```bash
chmod +x P02_unix-timestamp.sh
strace -c ./P02_unix-timestamp.sh
```
  </TabItem>
  <TabItem value="c" label="C">

```c title="P02_unix-timestamp.c"
#include <stdlib.h>
#include <stdio.h>
#include <time.h>

int main(int argc, char const *argv[]) {
    time_t timer = time(NULL);
    char *current_time = ctime(&timer);
    struct tm *tm_info = localtime(&timer);

    printf("Timer: %ld\n", timer);
    printf("The current time is: \n%s", current_time);
    if (tm_info -> tm_isdst) {
        printf("Daylight savings time\n");
    } else {
        printf("Standard time\n");
    }

    return 0;
}
```
```bash
gcc P02_unix-timestamp.c -o P02_unix-timestamp
strace -c ./P02_unix-timestamp
```
  </TabItem>
  <TabItem value="python" label="Python">

```python title="P02_unix-timestamp.py"
from datetime import datetime
import time

current_time = datetime.now()
timer = int(time.time())
tm_info = time.localtime()

print(f"Timer: {timer}")
print(f"The current time is: \n{current_time}")
if tm_info.tm_isdst:
    print("Daylight savings time")
else:
    print("Standard time")
```
```bash
strace -c python3 P02_unix-timestamp.py
```
  </TabItem>
</Tabs>

## Zadaci za vježbu

### Zadatak 2: `txt` datoteke

Napišite program koji će ispisivati broj `txt` datoteka u mapi koja je dana kao CLI argument programu. Ako taj argument nije dan, onda treba ispisati broj datoteka u mapi gdje je spremljen program (u tom slučaju kreirajte barem jednu `txt` datoteku).

<Tabs>
  <TabItem value="c" label="Primjer u C-u">

```c title="Z02_txt-datoteke.c"
#include <stdlib.h>
#include <stdio.h>
#include <dirent.h>
#include <string.h>

int main(int argc, char const *argv[]) {
    // Pročitati direktorij iz prvog argumenta ako postoji
    // ili dodijeliti defaultnu vrijednost (".")
    const char *dir_name = (argc > 1 ? argv[1] : ".");

    // Provjeriti postoji li direktorij
    DIR *pdir = opendir(dir_name);
    if (pdir == NULL) {
        perror("Can't open directory");
        return 1;
    }

    // Ako je direktorij mapa gdje je spremljen program,
    // stvoriti bar jednu txt datoteku
    if (strcmp(dir_name, ".") == 0) {
        printf("Creating dummy file\n");
        FILE *fp = fopen("Z02_dummy-file.txt", "w");
        fclose(fp);
        printf("Dummy file created\n");
    }

    // Iterirati po datotekama u direktoriju i za svaku datoteku
    // koja ima ekstenziju .txt inkrementirati varijablu txt_files
    int txt_files = 0;
    struct dirent *dent;
    while ((dent = readdir(pdir)) != NULL) {
        // readdir() returns a pointer to a dirent structure
        // representing the next directory entry in the
        // directory stream
        int d_name_len = strlen(dent -> d_name);
        if (d_name_len > 4 &&
            strcmp(dent -> d_name + (d_name_len - 4), ".txt") == 0) {
            txt_files++;
        }
    }

    // Ispisati broj txt datoteka
    printf("Number of txt files: %i\n", txt_files);
    closedir(pdir);
    return 0;
}
```
```bash
gcc Z02_txt-datoteke.c -o Z02_txt-datoteke
strace -c ./Z02_txt-datoteke
```
  </TabItem>
  <TabItem value="bash" label="Bash predložak">

```bash title="Z02_txt-datoteke.sh"
#!/bin/bash

# TODO: Pročitati direktorij iz prvog argumenta ako postoji
# ili dodijeliti defaultnu vrijednost (".")
# dir_name=...

# TODO: Provjeriti postoji li direktorij

# TODO: Ako je direktorij mapa gdje je spremljen program,
# stvoriti bar jednu txt datoteku
if [ $dir_name = . ]
then
    # ...
fi

# TODO: Ispisati broj txt datoteka

```
```bash
chmod +x Z02_txt-datoteke.sh
strace -c ./Z02_txt-datoteke.sh
```

:::info Napomene
- Bash sintaksa `${n:-val}` vraća vrijednost `n`-tog argumenta ako on postoji, a u suprotnom vraća ono što je zadano u `val`
- Da biste uspješno riješili zadatak, nije potrebno iterirati po datotekama u direktoriju i za svaku datoteku koja ima ekstenziju `.txt` inkrementirati varijablu `txt_files`. Dovoljno je koristiti ugrađene Bash naredbe i mehanizme.
:::

  </TabItem>
</Tabs>
