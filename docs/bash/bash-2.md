# Ljuske za rad s OS 2

## Bash skripte

Bash skripte su obične tekstualne datoteke koje sadrže niz naredbi za izvođenje u terminalu. Iako nije obavezno, dobra je praksa datotekama dodati ekstenziju `.sh`. **Skripte moraju imati postavljeno dopuštenje za izvršavanje:**
```bash
chmod +x skripta.sh 
```

Još jedna dobra praksa je započeti Bash skriptu s posebnom linijom koja se naziva *shebang:* 
```bash
#!/bin/bash
```
Ova linija govori sustavu da za interpretaciju i izvršavanje koda treba koristiti Bash ljusku.  
Više o *shebang*-u: [link 1](https://www.geeksforgeeks.org/linux-unix/using-shebang-in-linux/), [link 2](https://medium.com/@jcroyoaun/a-deeper-view-into-the-shebang-for-linux-scripting-4a26395df49d).

Postoji nekoliko načina za pokrenuti Bash skriptu:

```bash
bash ime_skripte.sh    # izvršavanje skripte
./ime_skripte.sh       # slično kao prethodna naredba
source ime_skripte.sh  # učitavanje skripte
. ime_skripte.sh       # isto kao prethodna naredba
```

:::info Napomena
Primijetite razliku između [izvršavanja i učitavanja](https://superuser.com/questions/176783/what-is-the-difference-between-executing-a-bash-script-vs-sourcing-it) skripte.
:::

### Varijable

U Bashu nije potrebno definirati tip varijable. U pravilu se varijable tretiraju kao znakovni nizovi *(string),* ali ih Bash može interpretirati kao brojeve u aritmetičkim izrazima.

Vrijednost varijabli se dodjeljuje **bez razmaka** oko znaka `=`.
Sve su varijable u Bashu prazne prije nego što im se dodijeli vrijednost. Pristupanje varijabli koja nije definirana neće baciti grešku, već će Bash vratiti prazan niz.
```bash
VARIJABLA=5
read -p "Unesi VARIJABLU: " VARIJABLA  # korisnik unosi vrijednost
```

Za pristup vrijednosti varijable koristi se znak `$`:
```bash
echo "$VARIJABLA"
```

:::info Napomena
Izbjegavajte predefinirane varijable kao što su `$BASH, $ENV, $GROUPS, $HOME, $PATH, $SECONDS, $USER...`
Međutim, s obzirom na to da je Bash osjetljiv na velika i mala slova *(case sensitive)*, varijable poput `$bash, $env...` možete slobodno koristiti.  
Popis predefiniranih varijabli možete pronaći [ovdje](https://tldp.org/LDP/abs/html/internalvariables.html).
:::

Za složenije operacije nad znakovnim nizovima, u Bashu možete koristiti [ekspanziju parametara](https://www.gnu.org/software/bash/manual/html_node/Shell-Parameter-Expansion.html):

|       Operator        | Opis                                                          |
|:---------------------:|---------------------------------------------------------------|
| `${niz:-vrijednost}`  | Ako je varijabla *niz* prazna, vraća *vrijednost*             |
| `${niz:=vrijednost}`  | Ako je varijabla *niz* prazna, postavlja ju na *vrijednost*   |
|       `${#niz}`       | Vraća duljinu stringa                                         |
|      `${niz:i}`       | Vraća podniz od indeksa *i* do kraja                          |
|  `${niz:i:duljina}`   | Vraća podniz definirane *duljine* od indeksa *i*              |
|     `${niz:(-i)}`     | Vraća zadnjih *i* znakova                                     |
| `${niz:(-i):duljina}` | Vraća podniz definirane *duljine*, brojeći *i* od kraja       |
|    `${niz#uzorak}`    | Uklanja najkraći dio *niza* od početka koji odgovara *uzorku* |
|   `${niz##uzorak}`    | Uklanja najduži dio *niza* od početka koji odgovara *uzorku*  |
|    `${niz%uzorak}`    | Uklanja najkraći dio *niza* od kraja koji odgovara *uzorku*   |
|   `${niz%%uzorak}`    | Uklanja najduži dio *niza* od kraja koji odgovara *uzorku*    |
| `${niz/uzorak/novi}`  | Zamjenjuje prvo pojavljivanje *uzorka* s *novim*              |
| `${niz//uzorak/novi}` | Zamjenjuje sva pojavljivanja *uzorka* s *novim*               |

### Navodnici

- Sve što je unutar `""` navodnika vrijedi onako kako je napisano OSIM varijabli, ugniježđenih naredbi (`` ` ``), `\n` , `\t` , `*` ...
```bash
echo "Prijavljen si kao $USER"
echo "Danas je `date`"
```

- Sve što je unutar `''` navodnika vrijedi onako kako je napisano
```bash
echo 'Prijavljen si kao $USER'
```

### Aritmetičke operacije

Za rad s cijelim brojevima u Bashu koristimo dvostruke zagrade na jedan od dva načina:

- `(( ... ))` se koristi kada samo želimo **izvršiti operaciju ili provjeriti uvjet**
```bash
(( x++ ))
```

- `$(( ... ))` se koristi kada želimo **ispisati ili dodijeliti rezultat**
```bash
echo "Rezultat je $(( 5 * 2 ))"
ans=$(( $a + $b ))               # ans=$(( a + b )) je isto ispravno 
```

### Nizovi naredbi

Bash omogućuje povezivanje naredbi u nizove s pomoću logičkih operatora:

- AND niz: `naredba2` će se izvršiti samo ako se `naredba1` uspješno izvršila

```bash
naredba1 && naredba2
```

- OR niz: `naredba2` će se izvršiti samo ako se `naredba1` izvršila s greškom

```bash
naredba1 || naredba2
```

### Provjera istinitosti i grananje

Glavni način provjere uvjeta u Bashu je korištenje uglatih zagrada `[]`:
```bash
[ "$x" -eq 0 ]                     # obratiti pozornost na razmake
[ "$x" -ne 5 ]                     # koristiti navodnike
[ "$x" -lt 3 ] || [ "$y" -eq 10 ]  # and, or
[ : ]                              # uvijek true
```

| Operator  | Opis (rad s brojevima)   |
|:---------:|--------------------------|
| `x -eq y` | x je jednak y            |
| `x -ne y` | x nije jednak y          |
| `x -gt y` | x je veći od y           |
| `x -ge y` | x je veći ili jednak y   |
| `x -lt y` | x je manji od y          |
| `x -le y` | x je manji ili jednak y  |

|  Operator   | Opis (rad s datotekama)                       |
|:-----------:|-----------------------------------------------|
|  `-e file`  | Datoteka postoji                              |
| `! -e file` | Datoteka ne postoji                           |
|  `-d file`  | Datoteka postoji i radi se o direktoriju      |
|  `-f file`  | Datoteka postoji i radi se o običnoj datoteci |


| Operator | Opis (rad sa znakovnim nizovima)        |
|:--------:|-----------------------------------------|
| `x = y`  | Stringovi x i y su jednaki              |
| `x != y` | Stringovi x i y nisu jednaki            |
|  `-n x`  | Duljina stringa nije nula (nije prazan) |
|  `-z x`  | Duljina stringa je nula (prazan)        |

:::info Napomena
Postoje i druge opcije/sintakse za ispitivanje uvjeta: naredba `test`, `[[ ]]` i `(( ))`.
:::


```bash
if [ "$uvjet1" -eq 1 ]
then
    echo "uvjet1 ispunjen"
elif [ "$uvjet2" -eq 2 ]
then
    echo "uvjet1 nije ispunjen, uvjet2 ispunjen"
else
    echo "niti jedan uvjet nije ispunjen"
fi
```

### Petlje

```bash
i=1
while (( i <= 5 ))
do
    echo $i
    (( i++ ))
done
```

```bash
for (( i=1; i <= 5; i++ ))  # for i in 1 2 3 4 5  # for i in {1..5}
do
    echo $i
done
```

### Funkcije

Dva su načina vraćanja informacija iz funkcije:
- **Ispis rezultata:** Funkcije obično koriste `echo` za ispis onoga što želimo dobiti kao rezultat. Taj ispis možemo dohvatiti u varijablu koristeći sintaksu `$()`.
- **Vraćanje izlaznog koda:** Naredba `return` ne vraća rezultat izračuna, već statusni kod (0-255). Kod 0 znači da je funkcija uspješno izvršena, dok bilo koji drugi broj signalizira grešku. Ovaj status se dohvaća varijablom `$?`.

```bash
sum()  # function sum
{
    echo $(( $1 + $2 ))
    return 52  # demonstracija, najčešće nije potrebno
}

my_sum=$(sum 4 9)  # poziv funkcije, prosljeđivanje argumenata
echo "my_sum is: $my_sum, function exit code is: $?"
```

### Argumenti

Bash koristi iste simbole za argumente skripte i argumente funkcije:
- Unutar skripte (izvan funkcije): `$1, $2, ...` su argumenti proslijeđeni prilikom pokretanja skripte u terminalu.
- Unutar funkcije: `$1, $2, ...` postaju argumenti proslijeđeni isključivo toj funkciji prilikom njezinog poziva unutar koda. Originalni argumenti skripte postaju nedostupni unutar tijela funkcije osim ako ih ne proslijedite eksplicitno.

| Posebne varijable | Opis                          |
|:-----------------:|-------------------------------|
|       `$#`        | Broj proslijeđenih argumenata |
|       `$0`        | Ime skripte                   |
|       `$1`        | Prvi argument                 |
|       `$2`        | Drugi argument                |
|       `$@`        | Svi argumenti                 |

```bash
./test.sh 2 3 saksofon
```

## Zadatak 1

Napišite skriptu koja broji od 1 do 100 u intervalima od jedne sekunde.

:::info Primjer poziva
```bash
./Z01_sekunde.sh
```
:::
:::info Izlaz
```
1
2
3
...
99
100
```
:::

## Zadatak 2

Napišite skriptu koja ispisuje svaku riječ u rečenici u obrnutom smjeru. Riječi neće biti dane pod navodnicima, tako da ćete svaku riječ dobiti kao zaseban argument.

:::info Primjer poziva
```bash
./Z02_obrnute_rijeci.sh My Name Is Jessa
```
:::
:::info Izlaz
```
yM emaN sI asseJ
```
:::

## Zadatak 3

Ispišite unos duljine $N$ u obliku pravokutnog trokuta, u $N$ redaka, tako da svaki redak bude jedan znak kraći. Znakovni niz treba skratiti s desna na lijevo.

:::info Primjer poziva
```bash
./Z03_trokut_znakova.sh znak
```
:::
:::info Izlaz
```
znak
zna
zn
z
```
:::
:::info Napomena
Dužina znakovnog niza se dobiva sintaksom `${#niz}`, a podniz sintaksom `${niz:početak:duljina}`.
:::

## Zadatak 4

Napišite skriptu koja dodaje ekstenziju `.html` svim datotekama u trenutačnom direktoriju.

:::info Primjer poziva
```bash
./Z04_ekstenzije.sh
```
:::

## Zadatak 5

Napišite skriptu koja provjerava je li zadana godina prijestupna. Koristite funkcije u Bashu.

:::info Primjer poziva
```bash
./Z05_prijestupne_godine.sh 1900
```
:::
:::info Izlaz
```
Godina 1900. nije prijestupna.
```
:::

## Zadatak 6

*N\*tk\* j\* c\*nz\*r\*r\*\* m\*j\* s\*m\*gl\*sn\*k\*!*  
Srećom, Ljudmila je pronašla sve samoglasnike koji su bili tako nepristojno uklonjeni. Vratite izvorni necenzurirani string, ako je dan cenzurirani string i niz cenzuriranih samoglasnika.

:::info Primjer poziva
```bash
./Z06_cenzura.sh 'Wh*r* d*d my v*w*ls g*?' 'eeioeo'
```
:::
:::info Izlaz
```
Where did my vowels go?
```
:::
:::info Napomena
Podniz možete zamijeniti sintaksom `${niz/podniz/zamjena}`.
:::
