# Upravljanje memorijom

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

Jedna od osnovnih zadaća OS-a je učitavanje procesa u radnu memoriju i upravljanje korištenjem memorije.

U današnjim ćemo vježbama istražiti algoritme za dodjeljivanje memorije i *buddy system*. Ove su strategije primjenjive kod sustava s dinamičkim particioniranjem gdje se slobodni blokovi tijekom rada dijele i po potrebi ponovno spajaju. Cilj nam je minimizirati vanjsku fragmentaciju memorije i smanjiti učestalost [zbijanja](https://www.tutorialspoint.com/operating_system/images/memory_fragmentation.jpg).

<Tabs>
  <TabItem value="c" label="C">

U svrhu preglednosti koda, funkcije zajedničke svim algoritmima izdvojene su u posebnu knjižnicu `L10_memory-management.h`.
  </TabItem>
  <TabItem value="python" label="Python">

U svrhu preglednosti koda, funkcije zajedničke svim algoritmima izdvojene su u posebnu skriptu `L10_memory-management.py`.

Za grafički prikaz dodjeljivanja memorije instalirajte knjižnicu `matplotlib`:

```bash
pip install matplotlib
```
  </TabItem>
</Tabs>


## Primjer 1: *First-fit*

[*First-fit* algoritam](https://www.geeksforgeeks.org/first-fit-allocation-in-operating-systems/) pronalazi prvi slobodni blok memorije koji je dovoljno velik da zadovolji zahtjeve procesa koji traži memoriju. Primjerice, ako proces traži 100 KB memorije, algoritam će proći kroz listu slobodnih blokova i pronaći prvi blok koji je veći ili jednak 100 KB. Ako takav blok postoji, on se dodjeljuje procesu tako što se blok podijeli na dva dijela - jedan koji zauzima proces i drugi koji ostaje slobodan.

Kada se proces završi, zauzeti dio memorije se oslobađa i, ako je to moguće, slobodni dijelovi susjednih blokova se spajaju kako bi se stvorio jedan veći slobodan blok (funkcije `deallocate` i `merge_blocks`).

<Tabs>
  <TabItem value="c" label="C">

```bash
gcc P01_first-fit.c L10_memory-management.c -o P01_first-fit && ./P01_first-fit
```
  </TabItem>
  <TabItem value="python" label="Python">

```bash
python3 P01_first-fit.py
```
  </TabItem>
</Tabs>

## Primjer 2: *Next-fit*

[*Next-fit* algoritam](https://www.geeksforgeeks.org/program-for-next-fit-algorithm-in-memory-management/) prolazi redom kroz listu slobodnih blokova memorije, slično kao *First-fit* algoritam. Glavna razlika je u tome što *Next-fit* počinje od mjesta gdje je završila prethodna alokacija. *Next-fit* ima tendenciju da alocira procese blizu prethodno alociranih blokova, što može rezultirati manjim fragmentiranjem memorije.

<Tabs>
  <TabItem value="c" label="C">

```bash
gcc P02_next-fit.c L10_memory-management.c -o P02_next-fit && ./P02_next-fit
```
  </TabItem>
  <TabItem value="python" label="Python">

```bash
python3 P02_next-fit.py
```
  </TabItem>
</Tabs>

## Primjer 3: *Best-fit*

[*Best-fit* algoritam](https://www.geeksforgeeks.org/best-fit-allocation-in-operating-system/) prolazi kroz listu slobodnih blokova i odabire najmanji slobodni blok koji je dovoljno velik da zadovolji zahtjeve procesa.

<Tabs>
  <TabItem value="c" label="C">

```bash
gcc P03_best-fit.c L10_memory-management.c -o P03_best-fit && ./P03_best-fit
```
  </TabItem>
  <TabItem value="python" label="Python">

```bash
python3 P03_best-fit.py
```
  </TabItem>
</Tabs>

## Primjer 4: *Worst-fit*

[*Worst-fit* algoritam](https://www.geeksforgeeks.org/worst-fit-allocation-in-operating-systems/) prolazi kroz listu slobodnih blokova i odabire najveći slobodni blok (koji je dovoljno velik da zadovolji zahtjeve procesa). Većina koda iz *best-fit* algoritma se može ponovno iskoristiti.

<Tabs>
  <TabItem value="c" label="C">

```bash
gcc P04_worst-fit.c L10_memory-management.c -o P04_worst-fit && ./P04_worst-fit
```
  </TabItem>
  <TabItem value="python" label="Python">

```bash
python3 P04_worst-fit.py
```
  </TabItem>
</Tabs>


## Zadatak 1: *Random-fit*

*Random-fit* algoritam dodjeljuje nove procese slučajno odabranim slobodnim blokovima. Algoritam nasumično odabire jedan blok iz liste slobodnih blokova i provjerava je li dovoljno velik za novi proces. Ako je blok dovoljno velik, jedan dio se dodjeljuje novom procesu, a preostali dio bloka se označava kao slobodan i dodaje se u listu slobodnih blokova. Ako ne postoji dovoljno veliki slobodni blok za novi proces, algoritam vraća neuspjeh. *Random-fit* može dovesti do fragmentacije memorije.

<Tabs>
  <TabItem value="c" label="C">

Nadopunite sljedeći kod tako što ćete nasumično odabrati blok iz liste slobodnih blokova. Pritom možete koristiti [funkciju](https://en.cppreference.com/w/c/numeric/random/rand) `rand()`. Pazite na slučaj u kojem nije moguće smjestiti proces niti u jedan slobodni blok, odnosno izlazak iz beskonačne petlje.

```bash
gcc Z01_random-fit.c L10_memory-management.c -o Z01_random-fit && ./Z01_random-fit
```
  </TabItem>
  <TabItem value="python" label="Python">

Nadopunite sljedeći kod tako što ćete nasumično odabrati blok iz liste slobodnih blokova. Pritom možete koristiti [funkciju](https://www.w3schools.com/python/ref_random_choice.asp) `random.choice`. Pazite na slučaj u kojem nije moguće smjestiti proces niti u jedan slobodni blok, odnosno izlazak iz beskonačne petlje.

```bash
python3 Z01_random-fit.py
```
  </TabItem>
</Tabs>


## Zadatak 2: Nasumično kreiranje procesa


<Tabs>
  <TabItem value="c" label="C">

Nadopunite sljedeći kod kako biste realizirali kreiranje procesa s nasumičnim veličinama memorije (raspon 50-400 s korakom 10). Pritom možete koristiti [funkciju](https://en.cppreference.com/w/c/numeric/random/rand) `rand()`.

```bash
gcc Z02_random-generation.c L10_memory-management.c -o Z02_random-generation && ./Z02_random-generation
```
  </TabItem>
  <TabItem value="python" label="Python">

Nadopunite sljedeći kod kako biste realizirali kreiranje procesa s nasumičnim veličinama memorije (raspon 50-400 s korakom 10). Pritom možete koristiti [funkciju](https://www.w3schools.com/python/ref_random_randrange.asp) `random.randrange`.

```bash
python3 Z02_random-generation.py
```
  </TabItem>
</Tabs>

## Primjer 5: *Buddy system*

*Buddy system* je algoritam za upravljanje memorijom koji dijeli memorijski prostor na blokove veličine $2^k$. Algoritam radi s parovima blokova, gdje svaki blok ima svog partnera ili prijatelja *(buddy)* s kojim se može spojiti nazad u veći blok kada oba postanu slobodna. *Buddy system* započinje s cijelim memorijskim prostorom kao jednim velikim blokom.

<div style={{textAlign: 'center'}}>

![](./L11_buddy_system.png)

</div>

Prilikom alokacije, algoritam traži najmanji slobodni blok koji je dovoljno velik da zadovolji taj zahtjev. Ako takav blok nije dostupan, veći blok se dijeli na dva jednaka manja bloka. Ovi manji blokovi su *buddy* par (prijatelji). Proces se ponavlja sve dok se ne dobije blok odgovarajuće veličine. Jedan od tih blokova se dodjeljuje zahtjevu, dok drugi ostaje slobodan.

Prilikom dealokacije, kada se blok memorije oslobodi, provjerava se njegov *buddy*. Ako je i *buddy* blok slobodan **(te ako imaju istu veličinu)**, oba bloka se spajaju nazad u veći blok. Ovaj veći blok može se dalje spajati sa svojim *buddy* blokom, i tako dalje, sve dok nije moguće dodatno spajanje.

<Tabs>
  <TabItem value="c" label="C">

```bash
gcc P05_buddy-system.c L10_memory-management.c -lm -o P05_buddy-system && ./P05_buddy-system
```
  </TabItem>
  <TabItem value="python" label="Python">

```bash
python3 P05_buddy-system.py
```
  </TabItem>
</Tabs>
