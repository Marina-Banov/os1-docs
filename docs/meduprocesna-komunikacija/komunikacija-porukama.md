# Komunikacija porukama (Message queues)

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

Komunikacija porukama koristi strukturu podataka u kojoj procesi mogu pohranjivati poruke koje će drugi procesi kasnije pročitati. Ovaj koncept nalikuje na FIFO, a koristi se na sličan način kao dijeljena memorija (generiranje jedinstvenog ključa uz `ftok`, dohvaćanje identifikatora uz `msgget`, slanje poruka uz `msgsnd`, primanje poruka uz `msgrcv` i uklanjanje *queuea* uz `msgctl`).

Istražite dokumentaciju funkcije za slanje poruke, obratite pažnju na tip poruke i razmislite zašto je obavezan:

```bash
man msgsnd
```

## Primjer 5: Komunikacija porukama

<Tabs>
  <TabItem value="c" label="C">

```c title="P05_msg-q-example.c"
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
    for (int i = 0; i < 3; i++) {
        struct message msg;
        msg.mtype = 1;
        snprintf(msg.text, sizeof(msg.text), "%d", nums[i]);
        msgsnd(msgid, &msg, sizeof(msg.text), 0);
    }

    // Čitanje poruka dok message queue nije prazan
    struct message msg;
    while (1) {
        if (msgrcv(msgid, &msg, sizeof(msg.text), 0, IPC_NOWAIT) == -1) {
            break;  // Message queue je prazan
        }
        printf("%d\n", atoi(msg.text));
    }

    // Ukloniti queue nakon čitanja
    msgctl(msgid, IPC_RMID, NULL);

    return 0;
}
```
```bash
gcc P05_msg-q-example.c -o P05_msg-q-example && ./P05_msg-q-example
```
  </TabItem>
  <TabItem value="python" label="Python">

U Pythonu se za dodavanje vrijednosti u *message queue* koristi `send` metoda.
Za čitanje vrijednosti iz *message queue*-a koristi se `receive` metoda:


```python title="P05_msg-q-example.py"
import sysv_ipc

key = sysv_ipc.ftok("/tmp", 65, silence_warning=True)
queue = sysv_ipc.MessageQueue(key, sysv_ipc.IPC_CREAT)

# Slanje poruka
queue.send(b"1")
queue.send(b"3")
queue.send(b"5")

# Čitanje poruka dok message queue nije prazan
try:
    while True:
        message, _ = queue.receive(block=False)
        print(int(message))
except sysv_ipc.BusyError:
    pass  # Message queue je prazan

# Ukloniti queue nakon čitanja
queue.remove()
```
```bash
python3 P05_msg-q-example.py
```
  </TabItem>
</Tabs>

## Zadatak 5

Nadopunite sljedeći kod tako da jedan proces računa kvadratnu vrijednost za niz brojeva, a drugi ispisuje izračunatu vrijednost. Sve je potrebno učiniti koristeći *message queue*.

<Tabs>
  <TabItem value="c" label="C">

```c title="Z05_msg-q-writer.c"
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

    for (int i = 1; i <= 5; i++) {
        // TODO: Pripremiti poruku, njen tip i sadržaj (kvadrat trenutačne
        // vrijednosti `i`)
        // ...
        // TODO: Ubaciti poruku u queue (poslati poruku)
        // ...
    }

    return 0;
}
```
```bash
gcc Z05_msg-q-writer.c -o Z05_msg-q-writer && ./Z05_msg-q-writer
```
```c title="Z05_msg-q-reader.c"
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

    // TODO: Ispisati kvadrat iz queuea
    // ...

    // Ukloniti queue nakon čitanja
    msgctl(msgid, IPC_RMID, NULL);

    return 0;
}
```
```bash
gcc Z05_msg-q-reader.c -o Z05_msg-q-reader && ./Z05_msg-q-reader
```
  </TabItem>
  <TabItem value="python" label="Python">

```python title="P05_msg-q-reader-writer.py"
import multiprocessing
import os
import sysv_ipc


def writer():
    key = sysv_ipc.ftok("/tmp", 65, silence_warning=True)
    queue = sysv_ipc.MessageQueue(key, sysv_ipc.IPC_CREAT)
    # TODO: Dodati kvadrate u queue za vrijednosti [1, 2, 3, 4, 5]
    for ...:
        # ...
    print(f"[WRITER {os.getpid()}] Finished")


def reader():
    key = sysv_ipc.ftok("/tmp", 65, silence_warning=True)
    queue = sysv_ipc.MessageQueue(key, sysv_ipc.IPC_CREAT)
    # TODO: Ispisati kvadrate iz queue-a
    while ...:
        # ...
        print(f"[READER {os.getpid()}] Received: {...}")
    queue.remove()


writer_process = multiprocessing.Process(target=writer, args=())
writer_process.start()  # Pokretanje procesa koji kvadrira vrijednosti
writer_process.join()  # Čekaj da proces završi

reader_process = multiprocessing.Process(target=reader, args=())
reader_process.start()  # Pokretanje procesa koji ispisuje kvadrate
reader_process.join()  # Čekaj da proces završi
```
```bash
python3 P05_msg-q-reader-writer.py
```
  </TabItem>
</Tabs>
