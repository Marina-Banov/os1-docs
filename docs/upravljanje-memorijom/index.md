---
sidebar_position: 14
---

# Upravljanje memorijom

U današnjim ćemo vježbama istražiti algoritme za dodjeljivanje memorije i *buddy system*. U svrhu preglednosti koda, funkcije zajedničke svim algoritmima izdvojene su u posebnu knjižnicu:

```c title="L11_memory_management.h"
#ifndef MEMORY_MANAGEMENT_H
#define MEMORY_MANAGEMENT_H

#define MAX_MEMORY 1024
#define SCALE 10
#define MAX_PROCESSES 20

typedef struct {
    int id;      // PID procesa ili -1 u slučaju da je prazan prostor
    int start;
    int end;
} Block;

typedef struct {
    Block free_memory[MAX_PROCESSES];
    Block allocated_memory[MAX_PROCESSES];
    int free_count;
    int allocated_count;
} Memory;

void deallocate(Memory *memory, int id);
void merge_blocks(Memory *memory);
void compact_memory(Memory *memory);
void visualize_ascii(Memory *memory);

#endif // MEMORY_MANAGEMENT_H
```
```c title="L11_memory_management.c"
#include "L11_memory_management.h"
#include <stdio.h>
#include <string.h>

void deallocate(Memory *memory, int id) {
    for (int i = 0; i < memory->allocated_count; i++) {
        if (memory->allocated_memory[i].id == id) {
            // Prebaci u slobodnu memoriju
            if (memory->free_count < MAX_PROCESSES) {
                Block freed = memory->allocated_memory[i];
                freed.id = -1;
                memory->free_memory[memory->free_count++] = freed;
            }
            // Izbaci iz alocirane memorije i pomakni naredne blokove lijevo
            for (int j = i; j < memory->allocated_count - 1; j++) {
                memory->allocated_memory[j] = memory->allocated_memory[j + 1];
            }
            memory->allocated_count--;
            break;
        }
    }
}

void merge_blocks(Memory *memory) {
    // Sortiranje blokova prema početnoj adresi
    for (int i = 1; i < memory->free_count; i++) {
        Block key = memory->free_memory[i];
        int j = i - 1;
        
        while (j >= 0 && memory->free_memory[j].start > key.start) {
            memory->free_memory[j + 1] = memory->free_memory[j];
            j--;
        }
        memory->free_memory[j + 1] = key;
    }

    // Spajanje susjednih blokova
    int i = 0;
    while (i < memory->free_count - 1) {
        Block *curr = &memory->free_memory[i];
        Block *next = &memory->free_memory[i + 1];
        
        if (curr->end >= next->start) {
            curr->end = (next->end > curr->end) ? next->end : curr->end;
            // Pomak preostalih blokova ulijevo
            for (int j = i + 1; j < memory->free_count - 1; j++) {
                memory->free_memory[j] = memory->free_memory[j + 1];
            }
            memory->free_count--;
        } else {
            i++;
        }
    }
}

void compact_memory(Memory *memory) {
    // Sortiranje alociranih blokova prema početnoj adresi
    for (int i = 1; i < memory->allocated_count; i++) {
        Block key = memory->allocated_memory[i];
        int j = i - 1;
        while (j >= 0 && memory->allocated_memory[j].start > key.start) {
            memory->allocated_memory[j + 1] = memory->allocated_memory[j];
            j--;
        }
        memory->allocated_memory[j + 1] = key;
    }

    // Pomicanje blokova jedan do drugog na početak memorije
    int current_start = 0;
    for (int i = 0; i < memory->allocated_count; i++) {
        int size = memory->allocated_memory[i].end - memory->allocated_memory[i].start;
        memory->allocated_memory[i].start = current_start;
        memory->allocated_memory[i].end = current_start + size;
        current_start += size;
    }

    // Postavljanje jednog slobodnog bloka za preostali prostor
    if (memory->free_count > 0) {
        memory->free_count = 1;
        memory->free_memory[0].start = current_start;
        memory->free_memory[0].end = MAX_MEMORY;
        memory->free_memory[0].id = -1;
    } else if (current_start < MAX_MEMORY) {
        memory->free_count = 1;
        memory->free_memory[0].start = current_start;
        memory->free_memory[0].end = MAX_MEMORY;
        memory->free_memory[0].id = -1;
    } else {
        memory->free_count = 0;
    }
}

void visualize_ascii(Memory *memory) {
    printf("\nMemory Allocation Visualization:\n\n");
    int total_width = MAX_MEMORY / SCALE;

    for (int i = 0; i < memory->allocated_count; ++i) {
        Block *block = &memory->allocated_memory[i];
        char line[total_width + 1];
        for (int j = 0; j < total_width; ++j) {
            line[j] = '_';
        }
        line[total_width] = '\0';

        int start_pos = block->start / SCALE;
        int end_pos = block->end / SCALE;
        if (end_pos > total_width) end_pos = total_width;

        for (int j = start_pos; j < end_pos; ++j) {
            line[j] = '#';
        }

        printf("Process %d: %s\n", block->id, line);
    }
}
```

## Primjer 1: *First-fit*

*First-fit* [algoritam](https://www.geeksforgeeks.org/first-fit-allocation-in-operating-systems/) pronalazi prvi slobodni blok memorije koji je dovoljno velik da zadovolji zahtjeve procesa koji traži memoriju. Primjerice, ako proces traži 100 KB memorije, algoritam će proći kroz listu slobodnih blokova i pronaći prvi blok koji je veći ili jednak 100 KB. Ako takav blok postoji, on se dodjeljuje procesu tako što se blok podijeli na dva dijela - jedan koji zauzima proces i drugi koji ostaje slobodan.

Kada se proces završi, zauzeti dio memorije se oslobađa i, ako je to moguće, slobodni dijelovi susjednih blokova se spajaju kako bi se stvorio jedan veći slobodan blok (funkcije `deallocate` i `merge_blocks`).

```c title="L11_first_fit.c"
#include <stdio.h>
#include "L11_memory_management.h"

void allocate(Memory *memory, int id, int size) {
    for (int i = 0; i < memory->free_count; i++) {
        Block *free_block = &memory->free_memory[i];
        int available_size = free_block->end - free_block->start;

        if (available_size >= size) {
            // Stvaranje novog alociranog bloka
            Block allocated = {
                .id = id,
                .start = free_block->start,
                .end = free_block->start + size
            };
            
            // Ažuriranje slobodnog bloka
            free_block->start += size;
            
            // Uklanjanje bloka u slučaju da je prazan
            if (free_block->start >= free_block->end) {
                for (int j = i; j < memory->free_count - 1; j++) {
                    memory->free_memory[j] = memory->free_memory[j + 1];
                }
                memory->free_count--;
            }
            
            // Dodavanje bloka u alociranu memoriju
            if (memory->allocated_count < MAX_PROCESSES) {
                memory->allocated_memory[memory->allocated_count++] = allocated;
            }
            printf("Allocating Process ID %d... Block [%d-%d]\n", id, allocated.start, allocated.end);
            return;
        }
    }

    printf("Could not allocate Process ID %d of size %d\n", id, size);
}

int main() {
    Memory memory = { .free_memory = {[0] = {.id = -1, .start = 0, .end = MAX_MEMORY}},
                      .allocated_memory = {0},
                      .free_count = 1,
                      .allocated_count = 0};

    allocate(&memory, 1, 100);
    allocate(&memory, 2, 200);
    allocate(&memory, 3, 100);
    allocate(&memory, 4, 200);
    deallocate(&memory, 3);
    merge_blocks(&memory);
    compact_memory(&memory);
    allocate(&memory, 5, 150);
    deallocate(&memory, 4);
    merge_blocks(&memory);
    // compact_memory(&memory);
    allocate(&memory, 6, 150);
    
    visualize_ascii(&memory);
    return 0;
}
```

```bash
gcc L11_first_fit.c L11_memory_management.c -o first_fit && ./first_fit
```

## Primjer 2: *Next-fit*

*Next-fit* [algoritam](https://www.geeksforgeeks.org/program-for-next-fit-algorithm-in-memory-management/) prolazi redom kroz listu slobodnih blokova memorije, slično kao *First-fit* algoritam. Glavna razlika je u tome što *Next-fit* počinje od mjesta gdje je završila prethodna alokacija. *Next-fit* ima tendenciju da alocira procese blizu prethodno alociranih blokova, što može rezultirati manjim fragmentiranjem memorije.

```c title="L11_next_fit.c"
#include <stdio.h>
#include "L11_memory_management.h"

int last_index = 0;    // Potrebno pamtiti gdje je alociran posljednji blok

void allocate(Memory *memory, int id, int size) {
    const int initial_free_count = memory->free_count;

    for (int i = 0; i < initial_free_count; i++) {
        const int current_idx = (last_index + i) % initial_free_count;
        Block *free_block = &memory->free_memory[current_idx];
        const int block_size = free_block->end - free_block->start;
        
        if (block_size < size) continue;

        // Stvaranje novog alociranog bloka
        Block allocated = {
            .id = id,
            .start = free_block->start,
            .end = free_block->start + size
        };

        // Dodavanje bloka u alociranu memoriju
        if (memory->allocated_count < MAX_PROCESSES) {
            memory->allocated_memory[memory->allocated_count++] = allocated;
        }

        // Ažuriranje slobodnih blokova
        if (block_size == size) {
            // Uklanjanje bloka u slučaju da je prazan
            for (int j = current_idx; j < memory->free_count - 1; j++) {
                memory->free_memory[j] = memory->free_memory[j + 1];
            }
            memory->free_count--;
            
            // Ažuriranje last_index ako je potrebno
            if (last_index >= memory->free_count) {
                last_index = 0;
            }
        } else {
            // Podjela slobodnog bloka
            free_block->start += size;
        }

        // Ažuriranje početne pozicije
        last_index = current_idx;
        printf("Allocating Process ID %d... Block [%d-%d]\n", id, allocated.start, allocated.end);
        return;
    }

    printf("Could not allocate Process ID %d of size %d\n", id, size);
}


int main() {
    Memory memory = { .free_memory = {[0] = {.id = -1, .start = 0, .end = MAX_MEMORY}},
                      .allocated_memory = {0},
                      .free_count = 1,
                      .allocated_count = 0};

    allocate(&memory, 1, 100);
    allocate(&memory, 2, 200);
    allocate(&memory, 3, 100);
    allocate(&memory, 4, 200);
    deallocate(&memory, 3);
    merge_blocks(&memory);
    allocate(&memory, 5, 150);
    deallocate(&memory, 4);
    merge_blocks(&memory);
    allocate(&memory, 6, 150);
    
    visualize_ascii(&memory);
    return 0;
}
```

```bash
gcc L11_next_fit.c L11_memory_management.c -o next_fit && ./next_fit
```

## Primjer 3: *Best-fit*

*Best-fit* [algoritam](https://www.geeksforgeeks.org/best-fit-allocation-in-operating-system/) prolazi kroz listu slobodnih blokova i odabire najmanji slobodni blok koji je dovoljno velik da zadovolji zahtjeve procesa.

```c title="L11_best_fit.c"
#include <stdio.h>
#include "L11_memory_management.h"

void allocate(Memory *memory, int id, int size) {
    int best_block_index = -1;
    int best_block_size = MAX_MEMORY + 1;  // Veće od mogućeg maksimuma

    // Traženje bloka koji najbolje odgovara
    for (int i = 0; i < memory->free_count; i++) {
        Block *block = &memory->free_memory[i];
        int block_size = block->end - block->start;
        
        if (block_size >= size && block_size < best_block_size) {
            best_block_index = i;
            best_block_size = block_size;
        }
    }

    if (best_block_index != -1) {
        Block *best_block = &memory->free_memory[best_block_index];
        
        // Stvaranje novog alociranog bloka
        Block allocated = {
            .id = id,
            .start = best_block->start,
            .end = best_block->start + size
        };

        // Dodavanje bloka u alociranu memoriju
        if (memory->allocated_count < MAX_PROCESSES) {
            memory->allocated_memory[memory->allocated_count++] = allocated;
        }

        // Ažuriranje slobodnih blokova
        if (best_block_size == size) {
            // Uklanjanje bloka u slučaju da je prazan
            for (int j = best_block_index; j < memory->free_count - 1; j++) {
                memory->free_memory[j] = memory->free_memory[j + 1];
            }
            memory->free_count--;
        } else {
            // Ažuriranje postojećeg bloka
            best_block->start += size;
        }

        printf("Allocating Process ID %d... Block [%d-%d]\n", id, allocated.start, allocated.end);
        return;
    }

    printf("Could not allocate Process ID %d of size %d\n", id, size);
}


int main() {
    Memory memory = { .free_memory = {[0] = {.id = -1, .start = 0, .end = MAX_MEMORY}},
                      .allocated_memory = {0},
                      .free_count = 1,
                      .allocated_count = 0};

    allocate(&memory, 1, 100);
    allocate(&memory, 2, 200);
    allocate(&memory, 3, 100);
    allocate(&memory, 4, 200);
    deallocate(&memory, 3);
    merge_blocks(&memory);
    allocate(&memory, 5, 150);
    deallocate(&memory, 4);
    merge_blocks(&memory);
    allocate(&memory, 6, 150);
    
    visualize_ascii(&memory);
    return 0;
}
```

```bash
gcc L11_best_fit.c L11_memory_management.c -o best_fit && ./best_fit
```

## Primjer 4: *Worst-fit*

*Worst-fit* [algoritam](https://www.geeksforgeeks.org/worst-fit-allocation-in-operating-systems/) prolazi kroz listu slobodnih blokova i odabire najveći slobodni blok (koji je dovoljno velik da zadovolji zahtjeve procesa). Većina koda iz *best-fit* algoritma se može ponovno iskoristiti.

```c title="L11_worst_fit.c"
#include <stdio.h>
#include "L11_memory_management.h"

void allocate(Memory *memory, int id, int size) {
    int worst_block_index = -1;
    int worst_block_size = 0;  // Promjena

    // Traženje bloka koji "najgore" odgovara
    for (int i = 0; i < memory->free_count; i++) {
        Block *block = &memory->free_memory[i];
        int block_size = block->end - block->start;
        
        if (block_size >= size && block_size > worst_block_size) {    // Promjena
            worst_block_index = i;
            worst_block_size = block_size;
        }
    }

    if (worst_block_index != -1) {
        Block *worst_block = &memory->free_memory[worst_block_index];
        
        // Stvaranje novog alociranog bloka
        Block allocated = {
            .id = id,
            .start = worst_block->start,
            .end = worst_block->start + size
        };

        // Dodavanje bloka u alociranu memoriju
        if (memory->allocated_count < MAX_PROCESSES) {
            memory->allocated_memory[memory->allocated_count++] = allocated;
        }

        // Ažuriranje slobodnog bloka
        if (worst_block_size == size) {
            // Uklanjanje bloka u slučaju da je prazan
            for (int j = worst_block_index; j < memory->free_count - 1; j++) {
                memory->free_memory[j] = memory->free_memory[j + 1];
            }
            memory->free_count--;
        } else {
            // Ažuriranje postojećeg bloka
            worst_block->start += size;
        }

        printf("Allocating Process ID %d... Block [%d-%d]\n", id, allocated.start, allocated.end);
        return;
    }

    printf("Could not allocate Process ID %d of size %d\n", id, size);
}


int main() {
    Memory memory = { .free_memory = {[0] = {.id = -1, .start = 0, .end = MAX_MEMORY}},
                      .allocated_memory = {0},
                      .free_count = 1,
                      .allocated_count = 0};

    allocate(&memory, 1, 100);
    allocate(&memory, 2, 200);
    allocate(&memory, 3, 100);
    allocate(&memory, 4, 200);
    deallocate(&memory, 3);
    merge_blocks(&memory);
    allocate(&memory, 5, 150);
    deallocate(&memory, 4);
    merge_blocks(&memory);
    allocate(&memory, 6, 150);
    
    visualize_ascii(&memory);
    return 0;
}
```

```bash
gcc L11_worst_fit.c L11_memory_management.c -o worst_fit && ./worst_fit
```

## Zadatak 1: *Random-fit*

*Random-fit* algoritam dodjeljuje nove procese slučajno odabranim slobodnim blokovima. Algoritam nasumično odabire jedan blok iz liste slobodnih blokova i provjerava je li dovoljno velik za novi proces. Ako je blok dovoljno velik, jedan dio se dodjeljuje novom procesu, a preostali dio bloka se označava kao slobodan i dodaje se u listu slobodnih blokova. Ako ne postoji dovoljno veliki slobodni blok za novi proces, algoritam vraća neuspjeh. *Random-fit* može dovesti do fragmentacije memorije.

Nadopunite sljedeći kod tako što ćete nasumično odabrati blok iz liste slobodnih blokova. Pritom možete koristiti [funkciju](https://en.cppreference.com/w/c/numeric/random/rand) `rand()`. Pazite na slučaj u kojem nije moguće smjestiti proces niti u jedan slobodni blok, odnosno izlazak iz beskonačne petlje.

```c title="L11_random_fit.c"
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include "L11_memory_management.h"

void allocate(Memory *memory, int id, int size) {
    if (memory->free_count == 0) {
        printf("Could not allocate Process ID %d of size %d\n", id, size);
        return;
    }

    // Polje indeksa slobodnih blokova
    int free_block_indices[MAX_PROCESSES];
    for (int i = 0; i < memory->free_count; i++) {
        free_block_indices[i] = i;
    }

    int block_idx_visited[MAX_PROCESSES] = {0};
    int initial_free_count = memory->free_count;

    // while (...) {
        // Odabir nasumičnog bloka (nasumični indeks iz polja free_memory)
        int random_idx = ...

        Block *free_block = &memory->free_memory[random_idx];
        int block_size = free_block->end - free_block->start;

        // Provjera ako trenutni blok zadovoljava potrebe procesa
        // ...

        // Stvori alocirani blok
        // Block allocated = ...

        if (memory->allocated_count < MAX_PROCESSES) {
            memory->allocated_memory[memory->allocated_count++] = allocated;
        }

        if (block_size == size) {
            for (int j = random_idx; j < memory->free_count - 1; j++) {
                memory->free_memory[j] = memory->free_memory[j + 1];
            }
            memory->free_count--;
        } else {
            free_block->start += size;
        }

        printf("Allocating Process ID %d... Block [%d-%d]\n", id, allocated.start, allocated.end);
        return;
    }

    printf("Could not allocate Process ID %d of size %d\n", id, size);
}


int main() {
    Memory memory = { .free_memory = {[0] = {.id = -1, .start = 0, .end = MAX_MEMORY}},
                      .allocated_memory = {0},
                      .free_count = 1,
                      .allocated_count = 0};

    srand(time(NULL));    
    allocate(&memory, 1, 100);
    allocate(&memory, 2, 200);
    allocate(&memory, 3, 100);
    allocate(&memory, 4, 200);
    deallocate(&memory, 3);
    merge_blocks(&memory);
    allocate(&memory, 5, 150);
    deallocate(&memory, 4);
    merge_blocks(&memory);
    allocate(&memory, 6, 150);
    
    visualize_ascii(&memory);
    return 0;
}
```

```bash
gcc L11_random_fit.c L11_memory_management.c -o random_fit && ./random_fit
```

## Zadatak 2: Nasumično kreiranje procesa

Nadopunite sljedeći kod kako biste realizirali kreiranje procesa s nasumičnim veličinama memorije (raspon 50-400 s korakom 10). Pritom možete koristiti [funkciju](https://en.cppreference.com/w/c/numeric/random/rand) `rand()`.

```c title="L11_random_generation.c"
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include "L11_memory_management.h"

void allocate(Memory *memory, int id, int size) {
    // Koristite vama najdražu funkciju za alokaciju memorije
}

int main() {
    Memory memory = { .free_memory = {[0] = {.id = -1, .start = 0, .end = MAX_MEMORY}},
                      .allocated_memory = {0},
                      .free_count = 1,
                      .allocated_count = 0};

    srand(time(NULL));    
    int num_processes = 10;    // Broj procesa za nasumično generirati
    for (int i = 0; i < num_processes; i++) {
        // Nasumično kreiranje i alokacija procesa
        // ...

        // Nasumična dealokacija procesa
        int should_dealloc = rand() % 2;
        if (should_dealloc == 1 && memory.allocated_count > 0) {
            int random_idx = (rand() / RAND_MAX + 1u) * memory.allocated_count;
            Block *block = &memory.allocated_memory[random_idx];
            deallocate(&memory, block->id);
            merge_blocks(&memory);
        }
    }
    
    visualize_ascii(&memory);
    return 0;
}
```

```bash
gcc L11_random_generation.c L11_memory_management.c -o random_generation && ./random_generation
```

## *Buddy system*

*Buddy system* je algoritam za upravljanje memorijom koji dijeli memorijski prostor na blokove veličine $2^k$. Algoritam radi s parovima blokova, gdje svaki blok ima svog partnera ili prijatelja *(buddy)* s kojim se može spojiti nazad u veći blok kada oba postanu slobodna. *Buddy system* započinje s cijelim memorijskim prostorom kao jednim velikim blokom.

Prilikom alokacije, algoritam traži najmanji slobodni blok koji je dovoljno velik da zadovolji taj zahtjev. Ako takav blok nije dostupan, veći blok se dijeli na dva jednaka manja bloka. Ovi manji blokovi su *buddy* par (prijatelji). Proces se ponavlja sve dok se ne dobije blok odgovarajuće veličine. Jedan od tih blokova se dodjeljuje zahtjevu, dok drugi ostaje slobodan.

Prilikom dealokacije, kada se blok memorije oslobodi, provjerava se njegov *buddy*. Ako je i *buddy* blok slobodan **(te ako imaju istu veličinu)**, oba bloka se spajaju nazad u veći blok. Ovaj veći blok može se dalje spajati sa svojim *buddy* blokom, i tako dalje, sve dok nije moguće dodatno spajanje.

```c title="L11_buddy_system.c"
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include "L11_memory_management.h"

void allocate_buddy_system(Memory *memory, int id, int size) {
    // Izračun potrebne veličine bloka
    int req_size = (int)pow(2, ceil(log2(size)));
    if (req_size > MAX_MEMORY) {
        printf("Requested size exceeds maximum memory\n");
        return;
    }

    // Traženje bloka koji najbolje odgovara (najmannji blok >= req_size)
    int best_idx = -1;
    int best_block_size = MAX_MEMORY + 1;
    
    for (int i = 0; i < memory->free_count; i++) {
        Block *block = &memory->free_memory[i];
        int block_size = block->end - block->start;
        
        if (block_size >= req_size && block_size < best_block_size) {
            best_idx = i;
            best_block_size = block_size;
        }
    }

    if (best_idx == -1) {
        printf("Could not allocate Process ID %d of size %d\n", id, req_size);
        return;
    }

    // Podjela bloka dok ne dođemo do odgovarajuće veličine
    Block *best_block = &memory->free_memory[best_idx];
    while (1) {
        int current_size = best_block->end - best_block->start;
        int half_size = current_size / 2;
        
        if (half_size < req_size || current_size == req_size) break;
        
        // Podjela na dva jednaka buddyja
        if (memory->free_count < MAX_PROCESSES) {
            // Stvaranje novog buddy bloka
            Block new_buddy = {
                .id = -1,
                .start = best_block->start + half_size,
                .end = best_block->end
            };
            
            // Ažuriranje postojećeg bloka
            best_block->end = best_block->start + half_size;
            
            // Ubacivanje buddyja nakon postojećeg bloka
            for (int j = memory->free_count; j > best_idx + 1; j--) {
                memory->free_memory[j] = memory->free_memory[j - 1];
            }
            memory->free_memory[best_idx + 1] = new_buddy;
            memory->free_count++;
        } else {
            break; // Blok nije dovoljno velik za podjelu
        }
    }

    // Stvaranje novog alociranog bloka
    Block allocated = {
        .id = id,
        .start = best_block->start,
        .end = best_block->start + req_size
    };

    // Dodavanje bloka u alociranu memoriju
    if (memory->allocated_count < MAX_PROCESSES) {
        memory->allocated_memory[memory->allocated_count++] = allocated;
    }

    // Izbacivanje iz slobodne memorije
    for (int j = best_idx; j < memory->free_count - 1; j++) {
        memory->free_memory[j] = memory->free_memory[j + 1];
    }
    memory->free_count--;

    printf("Allocating Process ID %d... Block [%d-%d]\n", id, allocated.start, allocated.end);
}

void merge_blocks_buddy_system(Memory *memory) {
    // Sortiranje slobodnih blokova po početnoj adresi
    for (int i = 1; i < memory->free_count; i++) {
        Block key = memory->free_memory[i];
        int j = i - 1;
        while (j >= 0 && memory->free_memory[j].start > key.start) {
            memory->free_memory[j + 1] = memory->free_memory[j];
            j--;
        }
        memory->free_memory[j + 1] = key;
    }

    // Spajanje buddy blokova
    int i = 0;
    while (i < memory->free_count - 1) {
        Block *current = &memory->free_memory[i];
        Block *next = &memory->free_memory[i + 1];
        
        int current_size = current->end - current->start;
        int next_size = next->end - next->start;
        
        if (current_size == next_size && 
            current->end == next->start && 
            (current->start % (2 * current_size)) == 0) {
            // Spajanje buddyja
            current->end = next->end;
            
            // Pomak preostalih blokova ulijevo
            for (int j = i + 1; j < memory->free_count - 1; j++) {
                memory->free_memory[j] = memory->free_memory[j + 1];
            }
            memory->free_count--;
            i = (i > 0) ? i - 1 : 0;
        } else {
            i++;
        }
    }
}


int main() {
    Memory memory = { .free_memory = {[0] = {.id = -1, .start = 0, .end = MAX_MEMORY}},
                      .allocated_memory = {0},
                      .free_count = 1,
                      .allocated_count = 0};

    allocate_buddy_system(&memory, 1, 100);
    allocate_buddy_system(&memory, 2, 200);
    allocate_buddy_system(&memory, 3, 100);
    allocate_buddy_system(&memory, 4, 200);
    deallocate(&memory, 3);
    merge_blocks_buddy_system(&memory);
    allocate_buddy_system(&memory, 5, 150);
    deallocate(&memory, 4);
    merge_blocks_buddy_system(&memory);
    allocate_buddy_system(&memory, 6, 50);
    
    visualize_ascii(&memory);
    return 0;
}
```

```bash
gcc L11_buddy_system.c L11_memory_management.c -lm -o buddy_system && ./buddy_system
```
