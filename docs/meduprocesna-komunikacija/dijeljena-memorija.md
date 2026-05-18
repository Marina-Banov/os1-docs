# Dijeljena memorija (Shared memory)

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

Dijeljena memorija je najjednostavniji i najefikasniji oblik međuprocesne komunikacije.

Da bi procesi pristupili dijeljenoj memoriji, moraju definirati jedinstveni ključ kako bi se dogovorili oko adrese kojoj će pristupati. Funkcija `ftok()` generira taj ključ koristeći definiranu datoteku i identifikator. Ako vas zanima više, možete proučiti [zašto](https://www.quora.com/Why-do-we-use-a-file-file-path-as-the-input-when-creating-a-key-with-ftok-function-in-inter-process-communication-What-is-the-purpose-of-the-file-when-creating-shared-memory) se u ovom slučaju koristi putanja datoteke i [kako](https://stackoverflow.com/a/3155312/11497334) odabrati primjerenu datoteku.  
Nakon toga, procesi dohvaćaju identifikator bloka dijeljene memorije (`shmget`, *open*), a potom i sam blok dijeljene memorije (`shmat`, *attach*). Procesi mogu slobodno čitati i pisati u tu memoriju, a kada završe s radom moraju otpustiti (`shmdt`, *detach*) korištene resurse. Blokovi dijeljene memorije nalaze se izvan memorije procesa i neće automatski nestati kada ih procesi otpuste, već je potrebno izričito obrisati (`shmctl`, *remove*) dijeljenu memoriju.

## Primjer 1: Dijeljena memorija

U zadanom primjeru prvi program *(writer)* zapisuje poruku u blok dijeljene memorije, a drugi *(reader)* čita poruku iz tog bloka:

<Tabs>
  <TabItem value="c" label="C">

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
  </TabItem>
  <TabItem value="python" label="Python">

Upravljanje dijeljenom memorijom u Pythonu je moguće uz paket `sysv-ipc` ([dokumentacija](http://semanchuk.com/philip/sysv_ipc/)) koji ćete po potrebi morati prvo instalirati:

```bash
pip install sysv-ipc
```

```python title="P01_shm-writer.py"
import os
import sysv_ipc

key = sysv_ipc.ftok("/tmp", 65, silence_warning=True)
message = "Hello from shared memory!"
shm = sysv_ipc.SharedMemory(key, flags=sysv_ipc.IPC_CREAT)
shm.attach()
shm.write(message.encode() + b"\0")
print(f'[WRITER {os.getpid()}]: Message "{message}" sent to shared memory [{key}]')
shm.detach()
```
```bash
python3 P01_shm-writer.py
```

```python title="P01_shm-reader.py"
import os
import sysv_ipc

key = sysv_ipc.ftok("/tmp", 65, silence_warning=True)
shm = sysv_ipc.SharedMemory(key)
shm.attach()
message = shm.read()
print(
    f"[READER {os.getpid()}]: Message \"{message.decode()}\" received from shared memory [{key}]"
)
shm.detach()
shm.remove()
```
```bash
python3 P01_shm-reader.py
```
  </TabItem>
</Tabs>

:::info Napomena
Kada više procesa pokušava istovremeno pristupiti dijeljenoj memoriji, pojavljuje se problem međusobnog isključivanja koji može dovesti do konflikata i neželjenih rezultata. Potrebno je implementirati mehanizme koji će osigurati sigurno korištenje memorije, slično kao i kod višedretvenih programa.
:::
