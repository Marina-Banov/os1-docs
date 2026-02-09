---
sidebar_position: 10
---

# Imenovani cjevovod (Named pipe, FIFO)

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

Imenovani cjevovod je [sličan](https://www.sfu.ca/sasdoc/sashtml/os2/zipeover.htm) prethodno navedenoj tehnici, uz neke dodatne mogućnosti. Uobičajeno nazivlje za ovakav tip komunikacijskog kanala je *named pipe/FIFO*.

Inicijalizacijom imenovanog cjevovoda stvara se referenca u datotečnom sustavu. Ta je referenca dostupna svim procesima, ali se najčešće koristi između dva nepovezana procesa. FIFO omogućava dvosmjernu komunikaciju, za što je dovoljna samo jedna instanca (za razliku od prethodno opisanog cjevovoda). Važno je naglasiti da vrijedi pravilo "prvi unutra, prvi van" *(first-in-first-out)*. Iako se više procesa može povezati na FIFO, samo jedan proces može čitati trenutno pohranjenu poruku. Nakon toga ona nestaje iz FIFO reda.

Zanimljiv primjer primjene ovog koncepta opisan je [ovdje](https://en.wikipedia.org/wiki/Named_pipe#In_Unix). U zadanom primjeru dva procesa koriste isti imenovani cjevovod kako bi čitali i pisali u njega:

<Tabs>
  <TabItem value="c" label="C">

```c title="L09_fifo_1.c"
#include <stdio.h>
#include <string.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <unistd.h>

int main()  {
    char *pipe_name = "/tmp/myfifo";
    mkfifo(pipe_name, 0666);
    int fd;
    char str1[80], str2[80];
    for (int i = 0; i < 3; i++) {
        fd = open(pipe_name, O_WRONLY);
        printf("USER 1: ");
        fgets(str1, 80, stdin);
        write(fd, str1, strlen(str1)+1);
        close(fd);

        fd = open(pipe_name, O_RDONLY);
        ssize_t bytes_read = read(fd, str2, sizeof(str2));
        str2[bytes_read] = '\0';
        printf("User 2: %s\n", str2);
        memset(str2, 0, sizeof(str2));
        close(fd);
    }
    return 0;
}
```
```c title="L09_fifo_2.c"
#include <stdio.h>
#include <string.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <unistd.h>

int main()  {
    char *pipe_name = "/tmp/myfifo";
    // mkfifo(pipe_name, 0666);
    int fd;
    char str1[80], str2[80];
    for (int i = 0; i < 3; i++) {
        fd = open(pipe_name, O_RDONLY);
        ssize_t bytes_read = read(fd, str2, sizeof(str2));
        str2[bytes_read] = '\0';
        printf("User 1: %s\n", str2);
        memset(str2, 0, sizeof(str2));
        close(fd);

        fd = open(pipe_name, O_WRONLY);
        printf("USER 2: ");
        fgets(str1, 80, stdin);
        write(fd, str1, strlen(str1)+1);
        close(fd);
    }
    return 0;
}
```
```bash
gcc L09_fifo_1.c -o L09_fifo_1
gcc L09_fifo_2.c -o L09_fifo_2
```
  </TabItem>
  <TabItem value="python" label="Python">

```python title="L09_fifo_2.py"
import os

pipe_name = "/tmp/myfifo"
# os.mkfifo(pipe_name)
for i in range(3):
    pipe = open(pipe_name, "r")
    str1 = pipe.read()
    print(f"User 1: {str1}", end="")
    pipe.close()
    pipe = open(pipe_name, "w")
    str2 = input("USER 2: ")
    pipe.write(str2)
    pipe.close()
os.remove(pipe_name)
```
```bash
python3 L09_fifo_2.py
```
  </TabItem>
</Tabs>


Pokrenite ova dva programa u dva različita terminala. Naizmjence šaljite poruke kroz cjevovod.

![](L09.gif)

**Pitanje:** Zašto prvi program ne ispisuje ništa sve dok se ne pokrene drugi program? [HINT](https://www.cs.kent.edu/~ruttan/sysprog/lectures/shmem/pipes#named_pipe_read_write)
