# Ljuske za rad s OS 2

## Zadatak 1

Napišite skriptu koja ispisuje svaku riječ u rečenici u obrnutom smjeru. Riječi neće biti dane pod navodnicima, tako da ćete svaku riječ dobiti kao zaseban argument.

:::info Primjer poziva
```bash
$ ./obrnute_rijeci.sh My Name Is Jessa
```
:::
:::info Izlaz
```bash
yM emaN sI asseJ
```
:::

## Zadatak 2

Ispišite unos duljine $N$ u obliku pravokutnog trokuta, u $N$ redaka, tako da svaki redak bude jedan znak kraći. Znakovni niz treba skratiti s desna na lijevo.

:::info Primjer poziva
```bash
$ ./trokut_znakova.sh znak
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

## Zadatak 3

Napišite skriptu koja provjerava je li zadana godina prijestupna. Koristite funkcije u Bash-u.

:::info Primjer poziva
```bash
$ ./prijestupne_godine.sh 1900
```
:::
:::info Izlaz
```
Godina 1900. nije prijestupna.
```
:::

## Zadatak 4

*N\*tk\* j\* c\*nz\*r\*r\*\* m\*j\* s\*m\*gl\*sn\*k\*!*  
Srećom, Ljudmila je pronašla sve samoglasnike koji su bili tako nepristojno uklonjeni. Vratite izvorni necenzurirani string, ako je dan cenzurirani string i niz cenzuriranih samoglasnika.

:::info Primjer poziva
```bash
$ ./cenzura.sh 'Wh*r* d*d my v*w*ls g*?' 'eeioeo'
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
