# Signali (Signals)

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

Sa signalima smo već radili u vježbi o pregledu i terminiranju procesa. Najjednostavniji način slanja signala među procesima je `kill` naredba.

Nadopunite značenje navedenih signala ([podsjetnik](https://faculty.cs.niu.edu/~hutchins/csci480/signals.htm)):
- `SIGCHLD:` 
- `SIGKILL:` 
- `SIGTERM:` 
- `SIGINT:` 
- `SIGPIPE:` 
- `SIGSTOP:` 
- `SIGCONT:` 
- `SIGSEGV:` 
- `SIGALRM:` 

Zadani primjer pokazuje rad sa signalima u programima. `SIGALRM` se pokreće nakon dvije sekunde i proces reagira prema definiranom *signal handler*-u (ispisuje poruku):

<Tabs>
  <TabItem value="c" label="C">

```c title="L09_signal.c"
#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include <unistd.h>
#include <time.h>

void receive_alarm(int sig) {
    time_t now = time(NULL);
    printf("[ALARM (%d)] %s", sig, ctime(&now));
}

int main() {
    signal(SIGALRM, receive_alarm);
    alarm(2);

    time_t before = time(NULL);
    printf("[BEFORE] %s", ctime(&before));
    sleep(5);
    time_t after = time(NULL);
    printf("[AFTER] %s", ctime(&after));

    return 0;
}
```
```bash
gcc L09_signal.c -o L09_signal && ./L09_signal
```
  </TabItem>
  <TabItem value="python" label="Python">

```python title="L09_signal.py"
import signal
import time

def receive_alarm(signal_id, _):
    print(f"[ALARM ({signal_id})] {time.ctime()}")

signal.signal(signal.SIGALRM, receive_alarm)
signal.alarm(2)

print(f"[BEFORE] {time.ctime()}")
time.sleep(5)
print(f"[AFTER] {time.ctime()}")
```
```bash
python3 L09_signal.py
```
  </TabItem>
</Tabs>

## Zadatak za zadaću

<Tabs>
  <TabItem value="c" label="C">

Probajte slati signale iz jednog procesa u drugi te ispisati poruku kad ste ih primili ([HINT 1](https://www.geeksforgeeks.org/signals-c-language/), [HINT 2](https://en.cppreference.com/w/c/program/signal), [HINT 3](https://man7.org/linux/man-pages/man2/pause.2.html)).

:::info Napomene
- Signali `SIGKILL` i `SIGSTOP` ne mogu odgovoriti na prilagođene *signal handler*-e, zanemarite ih.
- Proces bi trebao čekati i primati različite signale i terminirati tek kada zaprimi signal `SIGTERM`. Za to možete koristiti funkcije `pause()` i `exit()`.
- Ispišite PID kako biste lakše testirali svoj program.
- Signale šaljite putem naredbi u terminalu.
:::

```c title="L09_signal_handler.c"
#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include <unistd.h>

int main() {

    return 0;
}
```
```bash
gcc L09_signal_handler.c -o L09_signal_handler && ./L09_signal_handler
```
  </TabItem>
  <TabItem value="python" label="Python">

Probajte slati signale iz jednog procesa u drugi te ispisati poruku kad ste ih primili ([HINT 1](https://stackabuse.com/handling-unix-signals-in-python/), [HINT 2](https://stackoverflow.com/questions/2148888/python-trap-all-signals)).

:::info Napomene
- Signali `SIGKILL` i `SIGSTOP` ne mogu odgovoriti na prilagođene *signal handler*-e, zanemarite ih.
- Proces bi trebao čekati i primati različite signale i terminirati tek kada zaprimi signal `SIGTERM`. Za to možete koristiti funkcije `signal.pause()` i `sys.exit()`.
- Ispišite PID kako biste lakše testirali svoj program.
- Signale šaljite putem naredbi u terminalu.
:::

```python title="L09_signal_handler.py"
import os
import signal
import sys

```
```bash
python3 L09_signal_handler.py
```
  </TabItem>
</Tabs>
