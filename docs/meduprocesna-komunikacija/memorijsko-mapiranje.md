---
sidebar_position: 8
---

# Memorijsko mapiranje (Mapped memory)

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

Memorijsko mapiranje je tehnika koja omogućava **povezivanje adresnog prostora procesa i** nekog drugog resursa na sustavu, najčešće **datoteke** pohranjene na disku. Procesi tretiraju datoteku kao da je dio primarne memorije te čitaju i pišu u nju bez tradicionalnih `read` i `write` operacija. Memorijsko mapiranje je efikasnije od klasičnog uređivanja datoteka ali manje efikasno od korištenja dijeljene memorije jer su sistemski pozivi i pristup sekundarnoj memoriji (disku) puno sporiji od promjene lokalne memorije programa, pogotovo kada se radi o velikim datotekama. Također, promjene u mapiranoj memoriji odmah se odražavaju u povezanoj datoteci.

Moguće je da više procesa mapira istu datoteku u svoj adresni prostor i umjesto da ju oni zasebno učitavaju, procesi dijele pristup datoteci. To im omogućava da komuniciraju tako što čitaju i pišu u isti segment memorije. Memorijsko mapiranje često se koristi u različitim implementacijama baza podataka ili aplikacijama za obradu podataka (npr. jedan proces je zadužen za statističku analizu podataka i zapisivanje u datoteku, a drugi proces čita rezultate i prikazuje ih korisniku).

## Klasično uređivanje datoteke

```bash
echo "Hello, world!" > L09_example.txt
cat L09_example.txt
```

<Tabs>
  <TabItem value="c" label="C">

```c title="L09_file.c"
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

int main() {
    FILE *file = fopen("L09_example.txt", "r+");

    // Prvo: pročitamo tekst iz datoteke
    fseek(file, 0, SEEK_END);
    long length = ftell(file);
    fseek(file, 0, SEEK_SET);

    char *text = malloc(length + 1);
    fread(text, 1, length, file);
    text[length] = '\0';

    // Drugo: ažuriramo varijablu
    char *pos = strstr(text, "world");
    if (pos) {
        char buffer[1024];
        int prefix_len = pos - text;
        strncpy(buffer, text, prefix_len);
        buffer[prefix_len] = '\0';
        strcat(buffer, "human");
        strcat(buffer, pos + strlen("world"));
        strcpy(text, buffer);
    }

    // Treće: zapišemo u datoteku
    fseek(file, 0, SEEK_SET);
    fwrite(text, 1, strlen(text), file);
    fclose(file);
    free(text);

    return 0;
}
```
```bash
gcc L09_file.c -o L09_file && ./L09_file
cat L09_example.txt
```
  </TabItem>
  <TabItem value="python" label="Python">

```python title="L09_file.py"
file = open("L09_example.txt", "r+")
# Prvo: pročitamo tekst iz datoteke
text = file.read()
# Drugo: ažuriramo varijablu
text = text.replace("world", "human")
# Treće: zapišemo u datoteku
file.seek(0)
file.write(text)
file.close()
```
```bash
python3 L09_file.py
cat L09_example.txt
```
  </TabItem>
</Tabs>

## Uređivanje datoteke uz [memorijsko mapiranje](https://pubs.opengroup.org/onlinepubs/009695399/basedefs/sys/mman.h.html)

```bash
echo "Hello, world!" > L09_example.txt
cat L09_example.txt
```

<Tabs>
  <TabItem value="c" label="C">

```c title="L09_mmap.c"
#include <stdio.h>
#include <stdlib.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>

int main() {
    int fd = open("L09_example.txt", O_RDWR);
    struct stat sb;
    fstat(fd, &sb);
    size_t size = sb.st_size;

    char *mm = mmap(NULL, size, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
    close(fd);

    // Prvo: pronalazimo početni indeks za određeni podniz
    int start = -1;
    for (int i = 0; i <= size - 5; i++) {
        if (memcmp(mm + i, "world", 5) == 0) {
            start = i;
            break;
        }
    }

    if (start != -1) {
        // Drugo: direktno ažuriramo segment mapirane memorije, datoteka se automatski ažurira
        memcpy(mm + start, "human", 5);  // "human" i "world" oboje po 5 bajtova
        msync(mm + start, 5, MS_SYNC);
    }

    munmap(mm, size);
    return 0;
}
```
```bash
gcc L09_mmap.c -o L09_mmap && ./L09_mmap
cat L09_example.txt
```
  </TabItem>
  <TabItem value="python" label="Python">

```python title="L09_mmap.py"
import mmap

file = open("L09_example.txt", "r+b")
mm = mmap.mmap(file.fileno(), 0)
file.close()

# Prvo: pronalazimo početni indeks za određeni podniz
start = mm.find(b"world")
# Drugo: direktno ažuriramo segment mapirane memorije, datoteka se automatski ažurira
mm[start:start + len(b"world")] = b"human"  # mm[7:12] = b"human"
mm.close()
```
```bash
python3 L09_mmap.py
cat L09_example.txt
```
  </TabItem>
</Tabs>

## Međuprocesna komunikacija

<Tabs>
  <TabItem value="c" label="C">


```c title="L09_mmap_ipc.c"
#include <stdio.h>
#include <stdlib.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>
#include <sys/wait.h>

void writer(int fd) {
    struct stat sb;
    fstat(fd, &sb);
    char *mm = mmap(NULL, sb.st_size, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
    close(fd);  // Zatvori FD nakon mapiranja

    printf("[WRITER %d]: Writing to mmap\n", getpid());
    strncpy(mm, "Hello, world!", 13);
    munmap(mm, sb.st_size);
    printf("[WRITER %d]: Finished\n", getpid());
}

void reader(int fd) {
    printf("[READER %d]: Waiting for WRITER\n", getpid());
    sleep(1);

    struct stat sb;
    fstat(fd, &sb);
    char *mm = mmap(NULL, sb.st_size, PROT_READ, MAP_SHARED, fd, 0);
    close(fd);  // Zatvori FD nakon mapiranja

    printf("[READER %d]: Reading from mmap\n", getpid());
    char buf[14];
    strncpy(buf, mm, 13);
    buf[13] = '\0';
    printf("[READER %d]: %s\n", getpid(), buf);
    munmap(mm, sb.st_size);
    printf("[READER %d]: Finished\n", getpid());
}

int main() {
    int fd = open("L09_example.txt", O_RDWR | O_CREAT, 0666);
    ftruncate(fd, 13);  // Osiguraj da datoteka ima 13 bajtova

    // Započni procese
    pid_t writer_pid = fork();
    if (writer_pid == 0) {
        writer(fd);
        exit(0);
    }

    pid_t reader_pid = fork();
    if (reader_pid == 0) {
        reader(fd);
        exit(0);
    }

    close(fd);  // Zatvori originalni FD u roditelju
    waitpid(writer_pid, NULL, 0);
    waitpid(reader_pid, NULL, 0);
    return 0;
}
```
```bash
gcc L09_mmap_ipc.c -o L09_mmap_ipc && ./L09_mmap_ipc
```
  </TabItem>
  <TabItem value="python" label="Python">

```python title="L09_mmap_ipc.py"
import mmap
import os
import time
import multiprocessing

def writer(fileno):
    mm = mmap.mmap(fileno, 13)
    print(f"[WRITER {os.getpid()}]: Writing to mmap")
    mm[:] = b"Hello, world!"
    mm.close()
    print(f"[WRITER {os.getpid()}]: Finished")

def reader(fileno):
    print(f"[READER {os.getpid()}]: Waiting for WRITER")
    time.sleep(1)
    mm = mmap.mmap(fileno, 13)
    print(f"[READER {os.getpid()}]: Reading from mmap")
    data = mm.readline()
    print(f"[READER {os.getpid()}]: {data}")
    mm.close()
    print(f"[READER {os.getpid()}]: Finished")

file = open("L09_example.txt", "r+b")
writer_process = multiprocessing.Process(target=writer, args=(file.fileno(),))  # sličnosti sa multithreading.Thread
writer_process.start()
reader_process = multiprocessing.Process(target=reader, args=(file.fileno(),))  # sličnosti sa multithreading.Thread
reader_process.start()
file.close()

writer_process.join()
reader_process.join()
```
```bash
python3 L09_mmap_ipc.py
```
  </TabItem>
</Tabs>
