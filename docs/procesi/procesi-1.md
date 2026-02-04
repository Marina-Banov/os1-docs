# Procesi 1

## Pregled procesa

- `ps` - daje informacije o procesima koji se trenutno izvršavaju, uključujući i njihov jedinstveni identifikacijski broj (PID)
- `pgrep` - pretraga procesa po imenu
- `pidof` - ispis `PID`-ova procesa s određenim imenom
- `pstree` - prikaz stabla procesa
- `top` - prikazuje i ažurira sortirane informacije o Linux procesima
- `htop` - interaktivni preglednik procesa
- `atop` - [Advanced System and Process Monitor](https://atoptool.nl/)

```bash
ps
```

Detaljnije informacije možemo dobiti sa `-f`:

```bash
ps -f
```

Ako nas zanima proces s poznatim PID-om, možemo ga provjeriti sa `-p`:

```bash
ps -fp 1
```

Naredba `ps` obično prikazuje samo procese povezane s trenutnom ljuskom/sesijom. To znači da će se unutar terminala prikazati samo oni procesi koji se odnose na njegovo izvršavanje. Ako želimo vidjeti sve procese koji se izvode na sustavu, možemo koristiti `-e`:

```bash
ps -fe
```

Možemo filtrirati procese po određenom korisniku:

```bash
ps -fu $USER
```

Ako želimo filtrirati procese po imenu, možemo koristiti `grep`:

```bash
ps -e | grep python
```

Jednostavnije je koristiti `pgrep`:

```bash
pgrep python
```

Ako nas zanima PID procesa kojem poznajemo ime, možemo koristiti `pidof`:

```bash
pidof python3
```

Grafički prikaz roditelja i djece procesa možemo vidjeti sa `pstree`:

```bash
pstree
```

- Napišite naredbu kojom ćete prikazati sve procese koje je pokrenuo korisnik `root`, uz detaljne informacije
- Isprobajte osnovno korištenje naredbi `top` i `htop` (interaktivni preglednici procesa)

U C-u ovako dohvaćamo PID trenutnog procesa:

```c title="L06_print_pid.c"
#include <stdio.h>
#include <unistd.h>

int main() {
    printf("Process ID: %d\n", getpid());
    return 0;
}
```

```bash
gcc L06_print_pid.c -o L06_print_pid && ./L06_print_pid
```

Zadana je funkcija koja računa kvadrat unesenog broja i ispisuje PID trenutnog procesa. Kreirajte listu od 10 brojeva i pozovite funkciju `square` nad svim elementima te liste:

```c title="L06_square.c"
#include <stdio.h>
#include <unistd.h>

int square(int num) {
    printf("Uneseni broj: %d, PID procesa: %d\n", num, getpid());
    return num * num;
}

int main() {
    // Kreirajte listu od 10 brojeva i pozovite funkciju `square`
    // nad svim elementima te liste

    return 0;
}
```

```bash
gcc L06_square.c -o L06_square && ./L06_square
```

Ispišite detaljne informacije o procesu s tim PID-om

## Terminiranje procesa

- `kill` - terminira proces s poznatim PID-om
- `killall` - terminira procese s poznatim imenom

Ove naredbe po *default*-u procesima šalju signal `SIGTERM (15)` kako bi se procesi normalno završili. Korisnik može procesima poslati i [drugačije signale](https://faculty.cs.niu.edu/~hutchins/csci480/signals.htm), poput `SIGKILL (9)` za trenutačan prekid procesa.

Iskoristimo prethodni primjer i napravimo ga da se vječno izvršava:

```c title="L06_infinite_square.c"
#include <stdio.h>
#include <unistd.h>

int square(int num) {
    printf("Uneseni broj: %d, PID procesa: %d\n", num, getpid());
    return num * num;
}

int main() {
    // Proširite prethodni primjer da se beskonačno izvršava

    return 0;
}
```

Pokrenimo ovaj beskonačni C proces u novom terminalu:

```bash
gcc L06_infinite_square.c -o L06_infinite_square
```

Pronađimo proces u popisu:

```bash
ps -fu $USER
```

Uništimo novokreirani proces naredbom `kill`:

```bash
kill ...
```

Provjerimo je li proces eliminiran:

```bash
ps -fu $USER
```

Sada ćemo napisati C program koji ubija procese. Ponovno pokrenite beskonačni program u terminalu:

```bash
./L06_infinite_square
```

Pohranite novi PID kao [varijablu okruženja](https://ipython.readthedocs.io/en/stable/interactive/magics.html#magic-env):

```bash
%env VICTIM_PID=...
```

Kako biste provjerili je li varijabla okruženja `VICTIM_PID` točno zapisana?

```bash
echo $VICTIM_PID
```

```c title="L06_murderer.c"
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h>

int main() {
    char* victim_pid_str = getenv("VICTIM_PID");
    if (victim_pid_str) {
        fprintf(stderr, "Varijabla okruženja VICTIM_PID nije postavljena\n");
        return 1;
    }

    pid_t victim_pid = (pid_t)atoi(victim_pid_str);
    printf("My pid is %d\n", getpid());

    kill(victim_pid, SIGTERM);

    return 0;
}
```

```bash
gcc L06_murderer.c -o L06_murderer && ./L06_murderer
```

Alat `strace` koji smo do sada koristili za praćenje sistemskih poziva u ovoj ćemo vježbi koristiti za praćenje signala koje procesi primaju. Želimo utvrditi kako će se terminirati naš beskonačni proces. Kopirajte sljedeću naredbu u terminal i **obavezno zamijenite `...` s PID-om procesa žrtve.** Naredbe koje završavaju sa znakom `&` pokreću se u pozadini. Ova `strace` naredba ignorira sve sistemske pozive procesa žrtve i bilježi samo signale koje taj proces prima u datoteku nazvanu `L06_victim_strace.out`.

```bash
strace -tt -o L06_victim_strace.out -p ... -e 'trace=all' &
ps -fu $USER
```

Ubijmo žrtvu i promotrimo signale koje vraća `strace`:

```bash
strace -tt -e 'trace=all' L06_murderer
ps -fu $USER
cat L06_victim_strace.out
```

## Siročad *(orphans)*

Pokrenimo jedan jednostavni proces u pozadini. Želimo da se naš proces nastavlja izvršavati čak i ako ugasimo terminal (efektivno ubijemo roditeljski proces). To možemo uz pomoć naredbe `nohup`. Kopirajte sljedeću naredbu u terminal:

```bash
nohup sleep 120 &
```

Pronađite proces:

```bash
ps -fu $USER
```

Zatvorite terminal u kojem ste pokrenuli pozadinski proces (roditeljski proces). Možete li još uvijek pronaći proces `sleep`? 

```bash
ps -fe | grep sleep
```

Je li došlo do promjene u popisu procesa? Što je novi roditeljski proces?

```bash
ps -fp ...
```

Nakon terminiranja roditeljskog procesa, naš pozadinski proces je postao siroče *(orphaned process)*. Tada ga je preuzeo OS kako bi se uspješno nastavilo njegovo izvršavanje do kraja.
