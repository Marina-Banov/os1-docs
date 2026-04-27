# Dijeljena memorija (Shared memory)

Dijeljena memorija je najjednostavniji i najefikasniji oblik međuprocesne komunikacije.

Da bi procesi pristupili dijeljenoj memoriji, moraju definirati jedinstveni ključ kako bi se dogovorili oko adrese kojoj će pristupati. Funkcija `ftok()` generira taj ključ koristeći definiranu datoteku i identifikator. Ako vas zanima više, možete proučiti [zašto](https://www.quora.com/Why-do-we-use-a-file-file-path-as-the-input-when-creating-a-key-with-ftok-function-in-inter-process-communication-What-is-the-purpose-of-the-file-when-creating-shared-memory) se u ovom slučaju koristi putanja datoteke i [kako](https://stackoverflow.com/a/3155312/11497334) odabrati primjerenu datoteku.  
Nakon toga, procesi dohvaćaju identifikator bloka dijeljene memorije (`shmget`, *open*), a potom i sam blok dijeljene memorije (`shmat`, *attach*). Procesi mogu slobodno čitati i pisati u tu memoriju, a kada završe s radom moraju otpustiti (`shmdt`, *detach*) korištene resurse. Blokovi dijeljene memorije nalaze se izvan memorije procesa i neće automatski nestati kada ih procesi otpuste, već je potrebno izričito obrisati (`shmctl`, *remove*) dijeljenu memoriju.

## Primjer 1: Dijeljena memorija

U zadanom primjeru prvi program *(writer)* zapisuje poruku u blok dijeljene memorije, a drugi *(reader)* čita poruku iz tog bloka:

```c title="P01_shm-writer.c"
#include <stdio.h>
#include <string.h>
#include <sys/shm.h>
#include <unistd.h>

#define SHM_SIZE 1024

int main() {
    key_t key = ftok("/tmp", 65);
    char* message = "Hello from shared memory!";
    int shmid = shmget(key, SHM_SIZE, IPC_CREAT | 0666);
    char* shm_ptr = shmat(shmid, NULL, 0);
    strncpy(shm_ptr, message, SHM_SIZE);
    printf("[WRITER %d]: Message \"%s\" sent to shared memory [%d]\n", getpid(),
           message, key);
    shmdt(shm_ptr);

    return 0;
}
```
```bash
gcc P01_shm-writer.c -o P01_shm-writer && ./P01_shm-writer
```

```c title="P01_shm-reader.c"
#include <stdio.h>
#include <string.h>
#include <sys/shm.h>
#include <unistd.h>

#define SHM_SIZE 1024

int main() {
    key_t key = ftok("/tmp", 65);
    int shmid = shmget(key, SHM_SIZE, IPC_CREAT | 0666);
    char* message = (char*)shmat(shmid, NULL, 0);
    printf("[READER %d]: Message \"%s\" received from shared memory [%d]\n",
           getpid(), message, key);
    shmdt(message);
    shmctl(shmid, IPC_RMID, NULL);

    return 0;
}
```
```bash
gcc P01_shm-reader.c -o P01_shm-reader && ./P01_shm-reader
```

:::info Napomena
Kada više procesa pokušava istovremeno pristupiti dijeljenoj memoriji, pojavljuje se problem međusobnog isključivanja koji može dovesti do konflikata i neželjenih rezultata. Potrebno je implementirati mehanizme koji će osigurati sigurno korištenje memorije, slično kao i kod višedretvenih programa.
:::
