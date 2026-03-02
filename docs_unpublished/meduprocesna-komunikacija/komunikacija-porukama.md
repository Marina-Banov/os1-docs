# Komunikacija porukama (Message queues)

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

Komunikacija porukama koristi strukturu podataka u kojoj procesi mogu pohranjivati poruke koje će drugi procesi kasnije pročitati. Ovaj koncept nalikuje na FIFO, a koristi se na sličan način kao dijeljena memorija (generiranje jedinstvenog ključa uz `ftok`, dohvaćanje identifikatora uz `msgget`, slanje poruka uz `msgsnd`, primanje poruka uz `msgrcv` i uklanjanje *queue*-a uz `msgctl`).

Istražite dokumentaciju funkcije za slanje poruke `man msgsnd`.

<Tabs>
  <TabItem value="c" label="C">

```c "L09_msg_q_example.c"
#include <stdio.h>
#include <stdlib.h>
#include <sys/ipc.h>
#include <sys/msg.h>

struct message {
    long mtype;
    char text[16];
};

int main() {
    key_t key = ftok("/tmp", 65);
    int msgid = msgget(key, 0666 | IPC_CREAT);

    // Slanje poruka
    int nums[] = {1, 3, 5};
    for(int i = 0; i < 3; i++) {
        struct message msg;
        msg.mtype = 1;
        snprintf(msg.text, sizeof(msg.text), "%d", nums[i]);
        msgsnd(msgid, &msg, sizeof(msg.text), 0);
    }

    // Čitanje poruka dok message queue nije prazan
    struct message msg;
    while(1) {
        if(msgrcv(msgid, &msg, sizeof(msg.text), 0, IPC_NOWAIT) == -1) {
            break;  // Message queue je prazan
        }
        printf("%d\n", atoi(msg.text));
    }

    return 0;
}
```
```bash
gcc L09_msg_q_example.c -o L09_msg_q_example && ./L09_msg_q_example
```
  </TabItem>
  <TabItem value="python" label="Python">

U Python-u se za dodavanje vrijednosti u *message queue* koristi `send` metoda:

```python title="L09_msg_q_example.py"
import sysv_ipc

key = sysv_ipc.ftok("/tmp", 65, silence_warning=True)
queue = sysv_ipc.MessageQueue(key, sysv_ipc.IPC_CREAT)
queue.send(str(1))
queue.send(str(3))
queue.send(str(5))
```

Za čitanje vrijednosti iz *message queue*-a koristi se `receive` metoda:

```python
while queue.current_messages > 0:
    message, _ = queue.receive()
    print(int(message))
```

  </TabItem>
</Tabs>


Nadopunite sljedeći kod na način da jedan proces računa kvadratnu vrijednost za niz brojeva, a drugi ispisuje izračunatu vrijednost. Sve je potrebno učiniti koristeći *message queue*.

<Tabs>
  <TabItem value="c" label="C">

```c title="L09_msg_q_writer.c"
#include <stdio.h>
#include <stdlib.h>
#include <sys/ipc.h>
#include <sys/msg.h>

struct message {
    long mtype;
    char text[16];
};

int main() {
    key_t key = ftok("/tmp", 65);
    int msgid = msgget(key, 0666 | IPC_CREAT);

    // Dodavanje kvadrata u queue za vrijednosti [1, 2, 3, 4, 5]
    // ...

    return 0;
}
```
```bash
gcc L09_msg_q_writer.c -o L09_msg_q_writer && ./L09_msg_q_writer
```
```c title="L09_msg_q_reader.c"
#include <stdio.h>
#include <stdlib.h>
#include <sys/ipc.h>
#include <sys/msg.h>

struct message {
    long mtype;
    char text[16];
};

int main() {
    key_t key = ftok("/tmp", 65);
    int msgid = msgget(key, 0666 | IPC_CREAT);

    // Ispis kvadrata iz queue
    // ...

    // Uklanja queue nakon čitanja
    msgctl(msgid, IPC_RMID, NULL);

    return 0;
}
```
```bash
gcc L09_msg_q_reader.c -o L09_msg_q_reader && ./L09_msg_q_reader
```
  </TabItem>
  <TabItem value="python" label="Python">

```python title="L09_msg_q_reader_writer.py"
import multiprocessing
import sysv_ipc
import os

def writer():
    key = sysv_ipc.ftok("/tmp", 65, silence_warning=True)
    queue = sysv_ipc.MessageQueue(key, sysv_ipc.IPC_CREAT)
    # Dodavanje kvadrata u queue za vrijednosti [1, 2, 3, 4, 5]
    # ...

def reader():
    key = sysv_ipc.ftok("/tmp", 65, silence_warning=True)
    queue = sysv_ipc.MessageQueue(key, sysv_ipc.IPC_CREAT)
    # Ispis kvadrata iz queue
    # ...
    queue.remove()

writer_process = multiprocessing.Process(target=writer, args=())
writer_process.start()  # Pokretanje procesa koji kvadrira vrijednosti
writer_process.join()  # Čekaj da proces završi

reader_process = multiprocessing.Process(target=reader, args=())
reader_process.start()  # Pokretanje procesa koji ispisuje kvadrate
reader_process.join()
```
```bash
python3 L09_msg_q_reader_writer.py
```
  </TabItem>
</Tabs>
