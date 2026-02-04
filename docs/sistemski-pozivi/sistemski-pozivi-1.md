---
sidebar_position: 2
---

# Sistemski pozivi 1

Pobrinite se da je na vašem sustavu instaliran dijagnostički alat `strace`.

## Kako funkcioniraju sistemski pozivi?

Isječak iz službene dokumentacije `man syscalls 2>/dev/null | head -n 25 | tail -n 13`:

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

Kreirajmo jednostavan C program:

```c title="L04_hello_world.c"
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
gcc L04_hello_world.c -o L04_hello_world
./L04_hello_world
strace ./L04_hello_world
```

Vidimo da je funkcija `printf` zapravo *wrapper* za sistemski poziv `write`. Funkcija `write` prihvaća tri argumenta:

- Referencu na izlazni tok podataka (u ovom slučaju `1` označava standardni izlaz)
- Adresu znakovnog niza (dovoljno je proslijediti znakovni niz, prevoditelj će se pobrinuti za alokaciju memorije)
- Duljinu znakovnog niza (broj bajtova, u ovom slučaju 13)

### Zadatak 1: Dijagnostički alat `strace`

```bash
strace ./L04_hello_world
```

Uz sve sistemske pozive želimo i vrijeme kada su se izvršavali, to radimo sa `-t`. Specifične sistemske pozive možemo pratiti sa `-e`:

```bash
strace -t -e trace=openat,read ./L04_hello_world
```

Detaljnije vrijeme možemo dobiti sa `-tt`:

```bash
strace -tt -e trace=openat,read ./L04_hello_world
```

Dodajmo `-c` opciju kako bi dobili statistički prikaz koji je vizualno prihvatljiviji:
```bash
strace -c ./L04_hello_world
```

- Napišite naredbu za detaljni prikaz vremena i pratite sistemske pozive `openat` i `write`
- Napišite naredbu da pratite samo sistemski poziv `read`, ali uz statistički prikaz
- Napišite naredbu koja koristi statistički prikaz i prati sistemske pozive `openat` i `read`

## Zadaci za vježbu

### Primjer 1: [UNIX timestamp](https://www.unixtimestamp.com/)

Usporedite izvršavanje koda za ispis trenutnog vremena pisanog u Bash-u, C-u i Python-u:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="bash" label="Bash">

```bash title="L04_unix_timestamp.sh"
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
chmod +x L04_unix_timestamp.sh
strace -c ./L04_unix_timestamp.sh
```
  </TabItem>
  <TabItem value="c" label="C">

```c title="L04_unix_timestamp.c"
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
gcc L04_unix_timestamp.c -o L04_unix_timestamp
strace -c ./L04_unix_timestamp
```
  </TabItem>
  <TabItem value="python" label="Python">

```python title="L04_unix_timestamp.py"
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
strace -c python3 L04_unix_timestamp.py
```
  </TabItem>
</Tabs>

### Zadatak 2: `txt` datoteke

Napišite program koji će ispisivati broj `txt` datoteka u mapi koja je dana kao CLI argument programu. Ako taj argument nije dan, onda treba ispisati broj datoteka u mapi gdje je spremljen program (u tom slučaju kreirajte barem jednu `txt` datoteku).

<Tabs>
  <TabItem value="primjer" label="Primjer u C-u">

```c title="L04_txt_datoteke.c"
#include <stdlib.h>
#include <stdio.h>
#include <dirent.h>
#include <string.h>

int main(int argc, char const *argv[]) {
    // Pročitati direktorij iz prvog argumenta ako postoji ili dodijeliti defaultnu vrijednost (.)
    const char *dir_name = (argc > 1 ? argv[1] : ".");
    // Provjeriti postoji li direktorij
    DIR *pdir = opendir(dir_name);
    if (pdir == NULL) {
        perror("Can't open directory");
        return 1;
    }

    // Ako je direktorij mapa gdje je spremljen program, stvoriti bar jednu txt datoteku
    if (strcmp(dir_name, ".") == 0) {
        printf("Creating dummy file\n");
        FILE *fp = fopen("L04_dummy_file.txt", "w");
        fclose(fp);
        printf("Dummy file created\n");
    }

    // Proći kroz datoteke u direktoriju i prebrojati sve koje završavaju na .txt
    int txt_files = 0;
    struct dirent *dent;
    while ((dent = readdir(pdir)) != NULL) {
        // readdir() returns a pointer to a dirent structure representing the next directory entry in the directory stream
        int d_name_len = strlen(dent -> d_name);
        if (d_name_len > 4 && strcmp(dent -> d_name + (d_name_len - 4), ".txt") == 0) {
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
gcc L04_txt_datoteke.c -o L04_txt_datoteke
strace -c ./L04_txt_datoteke
```
  </TabItem>
  <TabItem value="predlozak" label="Predložak">

```bash title="L04_txt_datoteke.sh"
#!/bin/bash

# Pročitati direktorij iz prvog argumenta ili dodijeliti defaultnu vrijednost (.)

# Provjeriti postoji li direktorij

# Kreirati jednu txt datoteku ako je direktorij mapa gdje je spremljena skripta

# Proći kroz datoteke u direktoriju i prebrojati sve koje završavaju na .txt

# Ispisati broj datoteka s .txt nastavkom u zadanom direktoriju

```

```bash
chmod +x L04_txt_datoteke.sh
strace -c ./L04_txt_datoteke.sh
```

  </TabItem>
</Tabs>

**Napomena:** Bash sintaksa `${n:-val}` vraća vrijednost `n`-tog argumenta ako on postoji, a u suprotnom vraća ono što je zadano u `val`
