# Međuprocesna komunikacija

Međuprocesna komunikacija *(Inter-process communication, IPC),* predstavlja skup mehanizama koje OS pruža procesima kako bi mogli učinkovito upravljati dijeljenim resursima i međusobno razmjenjivati podatke.

## Dijeljena memorija

Komunikacija putem dijeljene memorije ostvaruje se čitanjem i pisanjem podataka u točno određeni prostor memorijske lokacije kojoj pristupa više procesa. Svaka promjena podataka u tom prostoru odmah je vidljiva svim procesima koji koriste tu memoriju. Ovo se smatra najbržim oblikom međuprocesne komunikacije jer se pristupa memoriji izravno, bez potrebe za sistemskim pozivima. Kako bi se izbjegli problemi pri istovremenom pristupu, koriste se procesni semafori *(process semaphores),* čime se sinkronizacija rješava na sličan način kao kod višedretvenih programa.

## Memorijsko mapiranje

Memorijsko mapiranje omogućuje komunikaciju putem čitanja i pisanja u dijeljene datoteke, pri čemu jezgra OS-a upravlja operacijama prijenosa podataka na disk. Procesi tretiraju mapirani dio datoteke kao da se nalazi izravno u primarnoj memoriji, što se postiže mapiranjem bloka s medija (poput diska) na stranicu *(page)* u memoriji. Sve promjene nastale u mapiranoj memoriji automatski se i odmah odražavaju u povezanoj datoteci.

## Cjevovod

Cjevovod omogućuje jednosmjernu sekvencijalnu komunikaciju u kojoj je izlaz iz jednog procesa izravno povezan s ulazom u drugi proces. U ovom modelu jedan proces isključivo piše podatke, dok ih drugi čita. Cjevovodi se najčešće koriste za komunikaciju između dvije dretve unutar istog procesa ili između roditeljskog *(parent)* i djetetovog *(child)* procesa. Tipičan primjer u terminalu je naredba `ps -ax | grep firefox`. Cjevovod živi koliko i povezani procesi.

## Imenovani cjevovod

Imenovani cjevovod (FIFO) je varijanta cjevovoda koja ima dodijeljeno ime unutar datotečnog sustava, iako se ne ponaša kao klasična datoteka već kao tok podataka. Njegova glavna prednost je što omogućuje komunikaciju između potpuno **nepovezanih** procesa. Svaki proces s odgovarajućim pravima može otvoriti ili zatvoriti FIFO objekt te u njega pisati ili iz njega čitati. Primjer kreiranja i korištenja ovakvog kanala za dvostruki ispis je sljedeći skup naredbi:

```bash
mkfifo /tmp/helloFifo
cat < /tmp/helloFifo &
cat > /tmp/helloFifo
^C  # Ctrl + C da biste izašli iz ovog modaliteta
rm /tmp/helloFifo
```

## Komunikacija porukama

Komunikacija putem poruka slična je FIFO mehanizmu jer se poruke u pravilu uzimaju iz reda onim redoslijedom kojim su u njega pristigle. Ipak, ovaj model pruža dodatnu funkcionalnost koja omogućuje procesima da povuku *(pull)* točno određene poruke iz reda čak i prije nego što one dođu na kraj reda.

## Signali

Signali služe kao obavijesti procesu o rezultatu nekog specifičnog događaja i predstavljaju neku vrstu softverskog prekida. Postoje dva osnovna slučaja: proces može poslati signal drugom procesu (ili dretvi), ili jezgra OS-a šalje signal procesu kako bi ga obavijestila o događaju na sustavu. Kada proces detektira signal, on izvršava unaprijed definiranu funkciju za obradu, poznatu kao *handler function*.

## Utičnice

O ovoj temi ćemo učiti više sljedeći tjedan...

Sada kada smo prošli teorijski okvir, možemo prijeći na implementaciju ovih koncepata u programskom jeziku C.

import {ListItems} from "@site/src/components/ListItems";

<ListItems></ListItems>

Provjerite svoje znanje o vrstama IPC-a na ovoj poveznici:

![](./L09_slido.png)
