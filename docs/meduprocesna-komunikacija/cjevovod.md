# Cjevovod (Pipe)

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

Cjevovod se koristi za jednosmjernu komunikaciju između *parent* i *child* procesa. Ovakav tip komunikacijskog kanala ponekad se naziva *anonymous/unnamed pipe*. Do sada ste se susretali s cjevovodima u Bashu kao mehanizmom redirekcije standardnog izlaza jedne naredbe u standardni ulaz druge naredbe, npr.:

```bash
man pipe | head -n 32 | tail -n 10
```
```
DESCRIPTION
    pipe()  creates  a pipe, a unidirectional data channel that can be used
    for interprocess communication.  The array pipefd is used to return two
    file  descriptors  referring to the ends of the pipe.  pipefd[0] refers
    to the read end of the pipe.  pipefd[1] refers to the write end of  the
    pipe.   Data  written  to  the write end of the pipe is buffered by the
    kernel until it is read from the read end of the pipe.  For further de‐
    tails, see pipe(7).
```

## Primjer 3: Cjevovod

Vođeni ispisom iz dokumentacije, sada ćemo istražiti kako [u kodu](https://en.wikipedia.org/wiki/Pipeline_(Unix)#Creating_pipelines_programmatically) kreirati cjevovod u svrhu međuprocesne komunikacije. Ako želimo postići potpuno dvosmjernu komunikaciju (takvu da oba procesa mogu istovremeno slati i primati podatke), potrebna su **dva cjevovoda**: jedan za slanje podataka u jednom smjeru, a drugi za slanje u drugom smjeru.

<div style={{textAlign: 'center'}}>

![](L09_pipe.png)

</div>

<Tabs>
  <TabItem value="c" label="C">

```c title="P03_pipe.c"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/wait.h>
#include <unistd.h>

int main() {
    // Koristimo dva cjevovoda
    // Prvi cjevovod za slanje poruke od roditelja do djeteta
    // Drugi cjevovod za slanje poruke od djeteta do roditelja

    int fd1[2];  // Dva kraja prvog cjevovoda
    int fd2[2];  // Dva kraja drugog cjevovoda

    if (pipe(fd1) == -1 || pipe(fd2) == -1) {
        perror("Pipe Failed");
        return 1;
    }

    pid_t forked_pid = fork();

    if (forked_pid < 0) {
        perror("Fork Failed");
        return 1;
    } else if (forked_pid > 0) {
        // Zatvaranje dijela za čitanje prvog cjevovoda
        close(fd1[0]);
        // Zatvaranje dijela za pisanje drugog cjevovoda
        close(fd2[1]);

        // Zapisivanje poruke i zatvaranje dijela za pisanje prvog cjevovoda
        char parent_str[] = "Hello, Child!";
        write(fd1[1], parent_str, strlen(parent_str) + 1);
        close(fd1[1]);

        // Čekanje da dijete završi
        wait(NULL);

        // Čitanje poruke od djeteta i zatvaranje dijela za čitanje drugog
        // cjevovoda
        char result_str[100];
        read(fd2[0], result_str, 100);
        printf("[PARENT %d] Message recieved from child: %s\n", getpid(),
               result_str);
        close(fd2[0]);
    } else {
        // Zatvaranje dijela za pisanje prvog cjevovoda
        close(fd1[1]);
        // Zatvaranje dijela za čitanje drugog cjevovoda
        close(fd2[0]);

        // Čitanje poruke od roditelja i zatvaranje dijela za čitanje prvog
        // cjevovoda
        char result_str[100];
        read(fd1[0], result_str, 100);
        printf("[CHILD %d] Message recieved from parent: %s\n", getpid(),
               result_str);
        close(fd1[0]);

        // Modifikacija poruke (dodavanje teksta)
        char child_str[] = " Hope you are well.";
        strcat(result_str, child_str);

        // Zapisivanje poruke i zatvaranje dijela za pisanje drugog cjevovoda
        write(fd2[1], result_str, strlen(result_str) + 1);
        close(fd2[1]);

        // Dijete završava, a roditelj će dobiti SIGCHLD signal
        exit(0);
    }

    return 0;
}
```
```bash
gcc P03_pipe.c -o P03_pipe && ./P03_pipe
```
  </TabItem>
  <TabItem value="python" label="Python">

```python title="P03_pipe.py"
import os

# Koristimo dva cjevovoda
# Prvi cjevovod za slanje poruke od roditelja do djeteta
# Drugi cjevovod za slanje poruke od djeteta do roditelja

read1, write1 = os.pipe()  # Dva kraja prvog cjevovoda
read2, write2 = os.pipe()  # Dva kraja drugog cjevovoda

forked_pid = os.fork()

if forked_pid > 0:
    # Zatvaranje dijela za čitanje prvog cjevovoda
    os.close(read1)
    # Zatvaranje dijela za pisanje drugog cjevovoda
    os.close(write2)

    # Zapisivanje poruke i zatvaranje dijela za pisanje prvog cjevovoda
    parent_str = "Hello, Child!"
    os.write(write1, parent_str.encode())
    os.close(write1)

    # Čekanje da dijete završi
    os.wait()

    # Čitanje poruke od djeteta i zatvaranje dijela za čitanje drugog
    # cjevovoda
    result_str = os.read(read2, 100).decode()
    print(f"[PARENT {os.getpid()}] Message recieved from child: {result_str}")
    os.close(read2)
else:
    # Zatvaranje dijela za pisanje prvog cjevovoda
    os.close(write1)
    # Zatvaranje dijela za čitanje drugog cjevovoda
    os.close(read2)

    # Čitanje poruke od roditelja i zatvaranje dijela za čitanje prvog
    # cjevovoda
    result_str = os.read(read1, 100).decode()
    print(f"[CHILD {os.getpid()}] Message recieved from parent: {result_str}")
    os.close(read1)

    # Modifikacija poruke (dodavanje teksta)
    child_str = " Hope you are well."
    result_str += child_str

    # Zapisivanje poruke i zatvaranje dijela za pisanje drugog cjevovoda
    os.write(write2, result_str.encode() + b"\0")
    os.close(write2)

    # Dijete završava, a roditelj će dobiti SIGCHLD signal
    os._exit(os.EX_OK)
```
```bash
python3 P03_pipe.py
```
  </TabItem>
</Tabs>
