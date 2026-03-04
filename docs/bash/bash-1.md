# Ljuske za rad s OS 1

Ljuska *(shell)* je korisnički program za interakciju s operacijskim sustavom. Korisnik unosi naredbe putem CLI, ljuska ih interpretira, a jezgra izvršava. Bash je jedna od najčešće korištenih ljuski na Linux sustavima, a može se koristiti i kao programski (skriptni) jezik za automatizaciju zadataka.

Postoje dva načina korištenja ljuski:
- **Interaktivno:** Korisnik izravno unosi naredbe jednu po jednu u terminal i odmah dobiva povratnu informaciju.
- **Neinteraktivno:** Ljuska čita i izvršava niz naredbi zapisanih u datoteci (skripti). Ovaj način je ključan za automatizaciju zadataka.

## Ponavljanje

U terminalu, na početku svake naredbe obično vidimo oznaku poput ove: `korisnik@racunalo:~$`
- `korisnik`: Ime trenutno prijavljenog korisnika
- `racunalo`: Naziv uređaja na kojem smo prijavljeni
- `~`: Trenutna putanja direktorija u kojem se nalazimo

Iza znaka `$` možemo upisivati vlastite naredbe. Naredbe se izvršavaju u onom direktoriju u kojem se nalazimo u trenutku pokretanja naredbe.

:::info Podsjetnik
Terminal možete otvoriti kraticom `Ctrl + Alt + T`
:::

:::info Savjet
Za ponovno pregledavanje i izvršavanje prethodno unesenih naredbi koristite tipke &uarr; i &darr; na tipkovnici.
:::

Ponovite osnovno značenje sljedećih naredbi, a detalje pronađite u dokumentaciji (*manual,* `man`, izlaz pritiskom na tipku `q`):

```bash
pwd, cd, ls, mkdir, touch, cat, less, echo, cp, mv, rm, find, grep, sudo...
```

### Navigacija i posebne putanje

Linux koristi stablastu strukturu datotečnog sustava koja kreće iz korijena `/`.

![](L01_datotecni_sustavi_nobg.png#gh-light-mode-only)

Navigacija se svodi na kretanje od mjesta gdje se nalazite do mjesta gdje želite doći, pri čemu je "mjesto" direktorij u kojem se trenutno nalazite. Kako biste definirali ciljnu lokaciju, možete koristiti:
- **Apsolutna putanja:** Kreće od korijena `/` i uvijek je ista bez obzira gdje se nalazite
```bash
/home/korisnik/dokumenti/vjezba.txt
```
- **Relativna putanja:** Kreće od mjesta gdje se trenutno nalazite
```bash
./dokumenti/vjezba.txt  # ako ste već u `/home/korisnik/`
```

| Putanja | Opis                     |
|:-------:|--------------------------|
|   `.`   | Trenutni direktorij      |
|  `..`   | Naddirektorij *(parent)* |
|   `~`   | *home* direktorij        |
|   `/`   | *root* direktorij        |

### Wildcards

Naredbe mogu koristiti zamjenske znakove za izvođenje radnji na više datoteka odjednom ili za pronalaženje dijela fraze u tekstualnoj datoteci. Morate biti oprezni ako sljedeće znakove koristite doslovno!

|    Znak     | Opis                       |
|:-----------:|----------------------------|
|     `?`     | Zamjena jednog znaka       |
|     `*`     | Zamjena 0 ili više znakova |
|    `[]`     | Raspon                     |
|    `[!]`    | Osim raspona               |
| `[:digit:]` | Brojevi (0-9)              |
| `[:upper:]` | Velika slova               |

### Primjer 1

Zadana je sljedeća struktura direktorija:

```bash
$ ls -al
...
-rw-r--r-- 1 root root   0 Feb 14 11:49 A123f
-rw-r--r-- 1 root root   0 Feb 14 11:49 Abf
-rw-r--r-- 1 root root   0 Feb 14 11:49 Acf
-rw-r--r-- 1 root root   0 Feb 14 11:49 Aeeefhf
-rw-r--r-- 1 root root   0 Feb 14 11:49 Awertf
-rw-r--r-- 1 root root   0 Feb 14 11:49 Bf
```

:::info Pitanje
Koje će se datoteke ispisati ako pokrenemo sljedeće naredbe?
```bash
ls -al A?f
ls -al A*f
ls -al ?*f
ls -al A[0-9]f
ls -al A[!b-d]*f
```
:::

### Redirekcija

Svaki proces koristi: `stdin (0)`, `stdout (1)` i `stderr (2)`.

|  Operator  | Opis                                                   |
|:----------:|--------------------------------------------------------|
|    `>`     | Redirekcija standardnog izlaza                         |
|    `>>`    | Redirekcija standardnog izlaza *(append)*              |
| `1> 2> &>` | Redirekcija standardnog i error izlaza                 |
|    `<`     | Redirekcija standardnog ulaza                          |
|    `\|`    | Redirekcija izlaza jedne naredbe u ulaz druge *(pipe)* |

:::info Pitanje
Što očekujete kao rezultat sljedećih naredbi?

```bash
echo "hello world!" > my_file.txt
echo "hello friend" >> my_file.txt
sort < my_file.txt
find / -name "*.conf" 1> find_noerror.txt 2> find_error.txt
cat *.log | grep -i error | sort
```
:::

### Dopuštenja

U detaljnom ispisu sadržaja direktorija, u prvom su stupcu navedena dopuštenja za svaku datoteku:

```bash
$ ls -al
...
drwxr-xr-x 1 root root  4096 Mar  9 14:48 data
-rw-r--r-- 1 root root    24 Mar 21 14:35 my_file.txt
```

:::info Pitanje
Što predstavlja prvi bit dopuštenja?
:::

- Prvi `rwx` skup odnosi se na dozvole koje ima vlasnik
- Sljedeća tri znaka odnose se na dozvole koje ima grupa
- Posljednja tri znaka odnose se na dozvole koje imaju ostali korisnici

| Bit dopuštenja | Na datoteci              | Na direktoriju                              |
|:--------------:|--------------------------|---------------------------------------------|
|   `r` *read*   | Čitanje datoteke         | Izlistavanje sadržaja direktorija           |
|  `w` *write*   | Uređivanje datoteke      | Stvaranje i brisanje datoteka u direktoriju |
| `x` *execute*  | **Izvršavanje datoteke** | Pristup direktoriju                         |

Za promjenu dopuštenja koristimo naredbu `chmod` i jedan od dva oblika:

- [Numerički](https://www.cyberciti.biz/faq/unix-linux-bsd-chmod-numeric-permissions-notation-command/)

```bash
chmod 755 my_file.txt
```

- Simbolički

```bash
chmod u=rw,go=r my_file.txt
chmod +x my_file.sh
chmod g-w my_file.txt
```

:::info Napomena
Naredba `whoami` prikazuje trenutnog korisnika. Naredba `chown` koristi se za promjenu vlasnika, npr. `sudo chown korisnik:grupa datoteka`.
:::

### Zadatak 1

- U svom korisničkom direktoriju `~` izradite sljedeće direktorije jednom naredbom: `Vjezba`, `Backup`, `Skripte`, `Temp`
- Unutar direktorija `Vjezba` izradite datoteku naziva `prvi.txt` i upišite u nju tekst `Ovo je prvi red.`
- Kopirajte datoteku `prvi.txt` iz direktorija `Vjezba` u direktorij `Backup`
- Premjestite direktorij `Temp` (zajedno sa svim eventualnim sadržajem) u direktorij `Skripte`
- U direktoriju `Vjezba` kreirajte još dvije prazne datoteke: `drugi.txt` i `treci.log`
- Preimenujte direktorij `Skripte` u `Alati`
- Iz direktorija `Vjezba` obrišite sve datoteke koje završavaju ekstenzijom `.log`
- Iz direktorija `/etc` kopirajte u direktorij `Vjezba` sve datoteke koje počinju slovom `p`
- Izlistajte sve datoteke u direktoriju `Vjezba` tako da budu sortirane po veličini (najveća prva) koristeći dugi format ispisa
- Izlistajte samo nazive svih datoteka u direktoriju `Vjezba` i taj izlaz spremite u novu datoteku naziva `popis_vjezba.txt` unutar istog direktorija
- Ispišite sadržaj datoteke `/etc/hosts`
- Kopirajte prva 3 retka datoteke `/etc/passwd` u novu datoteku naziva `prvih_3.txt` u vašem korisničkom direktoriju
- Pronađite i ispišite sve retke iz datoteke `/etc/services` koji sadrže riječ `http`, bez obzira na veličinu slova
- Provjerite koliko redaka u datoteci `prvih_3.txt` ne sadrži slovo `a`
- Ispišite današnji datum i vrijeme u formatu: `godina-mjesec-dan_sat:minuta` (npr. `2026-03-17_15:00`)
- Pomoću jedne naredbe provjerite kojim grupama pripada trenutno prijavljen korisnik i spremite taj izlaz u datoteku `moje_grupe.txt` unutar direktorija `Vjezba`
- Koristeći odgovarajuću naredbu *(no hard coding!),* nadodajte ime trenutno prijavljenog korisnika na kraj datoteke `moje_grupe.txt`
- Pomoću odgovarajuće naredbe, ispišite naziv operacijskog sustava i verziju kernela koju koristite
- Pomoću odgovarajuće naredbe provjerite trenutni radni direktorij
- U direktoriju `Backup` kreirajte novi direktorij `Zasticeno`
- Koristeći numerički oblik, promijenite dozvole direktoriju `Zasticeno` tako da vlasnik ima sve dozvole, grupa ima samo dozvole čitanja i izvršavanja, a ostali nemaju nikakve dozvole
- Koristeći simbolički oblik, promijenite dozvole direktoriju `Zasticeno` tako da grupa dobije i dozvolu pisanja
