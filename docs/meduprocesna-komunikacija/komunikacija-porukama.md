---
sidebar_position: 11
---

# Komunikacija porukama (Message queues)

Komunikacija porukama koristi strukturu podataka u kojoj procesi mogu pohranjivati poruke koje će drugi procesi kasnije pročitati. Ovaj koncept nalikuje na FIFO, a koristi se na sličan način kao dijeljena memorija (generiranje jedinstvenog ključa uz `ftok`, dohvaćanje identifikatora uz `msgget`, slanje poruka uz `msgsnd`, primanje poruka uz `msgrcv` i uklanjanje *queue*-a uz `msgctl`).

```
MSGOP(2)                   Linux Programmer's Manual                  MSGOP(2)

NAME
       msgrcv, msgsnd - System V message queue operations

SYNOPSIS
       #include <sys/types.h>
       #include <sys/ipc.h>
       #include <sys/msg.h>

       int msgsnd(int msqid, const void *msgp, size_t msgsz, int msgflg);

       ssize_t msgrcv(int msqid, void *msgp, size_t msgsz, long msgtyp,
                      int msgflg);

DESCRIPTION
       The  msgsnd()  and  msgrcv() system calls are used to send messages to,
       and receive messages from,  a  System V  message  queue.   The  calling
       process  must  have  write  permission on the message queue in order to
       send a message, and read permission to receive a message.

       The msgp argument is a pointer to a  caller-defined  structure  of  the
       following general form:

           struct msgbuf {
               long mtype;       /* message type, must be > 0 */
               char mtext[1];    /* message data */
           };

       The  mtext  field is an array (or other structure) whose size is speci‐
       fied by msgsz, a nonnegative integer value.  Messages  of  zero  length
       (i.e.,  no  mtext  field)  are  permitted.  The mtype field must have a
       strictly positive integer value.  This value can be used by the receiv‐
       ing  process for message selection (see the description of msgrcv() be‐
       low).
```
`man msgsnd 2> /dev/null | head -n 35`

```c title="L09_msg_q.c"
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
gcc L09_msg_q.c -o L09_msg_q && ./L09_msg_q
```

Nadopunite sljedeći kod na način da jedan proces računa kvadratnu vrijednost za niz brojeva, a drugi ispisuje izračunatu vrijednost. Sve je potrebno učiniti koristeći *message queue*.

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
