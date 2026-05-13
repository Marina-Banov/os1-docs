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

## Primjer 6: Signali

Zadani primjer pokazuje rad sa signalima u programima. `SIGALRM` se pokreće nakon dvije sekunde i proces reagira prema definiranom *signal handler*-u (ispisuje poruku):

<Tabs>
  <TabItem value="c" label="C">

```c title="P06_signal.c"
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <unistd.h>

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
gcc P06_signal.c -o P06_signal && ./P06_signal
```
  </TabItem>
  <TabItem value="python" label="Python">

```python title="P06_signal.py"
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
python3 P06_signal.py
```
  </TabItem>
</Tabs>
