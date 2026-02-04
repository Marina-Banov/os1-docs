---
sidebar_position: 13
---

# Utičnice (Sockets)

Stanje utičnica na računalu možete provjeriti uz pomoć alata `netstat`:

```bash
netstat -an
```

U današnjim vježbama bavit ćemo se mrežnim utičnicama koje koriste TCP protokol i komunikaciju putem toka podataka *(stream sockets + Internet namespace + TCP protocol)*. Najčešći oblik upotrebe utičnica je u komunikaciji između poslužitelja i klijenta gdje poslužiteljska strana čeka na uspostavu veze od strane klijenta.

![server-client](https://files.realpython.com/media/sockets-tcp-flow.1da426797e37.jpg)

Stanje TCP utičnica na računalu možete provjeriti ovako:

```bash
netstat -tn
```

## Primjer 1: Hello, world

Poslužitelj i klijent razmjenjuju jednu poruku. Za svaku stranu (program) pišemo jedan kod. Koristimo `unistd` knjižnicu koja sadrži wrappere za sistemski poziv close `close`. Knjižnicu `arpa/inet.h` koristimo za funkcije vezane uz mrežnu komunikaciju (npr. `htons`, `inet_addr`, itd.) Utičnice i funkcije za rad sa utičnicama su definirane u `sys/socket.h`. Struktura `sockaddr_in` je defnirana u `netinet/in.h`. Ukoliko dođe do greške, funkcija `perror` omogućava detaljniji ispis greške.

```c title="L10_server.c"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <netinet/in.h>

#define HOST "127.0.0.1"  // Adresa na kojoj se pokreće server socket (lokalno računalo)
#define PORT 65432        // Port na kojem server socket osluškuje (za korisničke aplikacije, koristiti PORT > 1023)
#define BUFFER_SIZE 1024  // Veličina spremnika za prihvat poruka.

int main() {
    // Stvaranje novog serverskog Internet socketa, stream stil komunikacije (+ TCP protokol).
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        perror("Socket failed");
        exit(EXIT_FAILURE);
    }

    // Postavljanje HOST adrese i porta u strukturu.
    // Ovo je dalje potrebno za bind funkciju.
    struct sockaddr_in address;
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = inet_addr(HOST);
    address.sin_port = htons(PORT);

    // Postavljanje server socketa na definiranu adresu i port.
    int bind_ret = bind(server_fd, (struct sockaddr *)&address, sizeof(address));
    if (bind_ret < 0) {
        perror("bind failed");
        close(server_fd);
        exit(EXIT_FAILURE);
    }

    // Pripremi server socket za provjeravanje novih zahtjeva za vezu.
    int listen_ret = listen(server_fd, 1);
    if (listen_ret < 0) {
        perror("listen failed");
        close(server_fd);
        exit(EXIT_FAILURE);
    }

    printf("[SERVER] Waiting for a connection on port %d...\n", PORT);

    // Čekaj i prihvati nove zahtjeve za povezivanje.
    socklen_t addrlen = sizeof(address);
    int client_fd = accept(server_fd, (struct sockaddr *)&address, &addrlen); 
    if (client_fd < 0) {
        perror("accept failed");
        close(server_fd);
        exit(EXIT_FAILURE);
    }

    printf("[SERVER] Accepted connection from %s:%d\n",
           inet_ntoa(address.sin_addr), ntohs(address.sin_port));

    // Čitaj maksimalno 1023 bajtova.
    char buffer[BUFFER_SIZE] = {0};
    ssize_t bytes_received = recv(client_fd, buffer, BUFFER_SIZE - 1, 0);
    if (bytes_received < 0) {
        perror("recv failed");
        exit(EXIT_FAILURE);
    }
    
    buffer[bytes_received] = '\0';
    printf("[SERVER] Received message: %s\n", buffer);

    // Pošalji odgovor.
    strcpy(buffer, "Have a nice day.");
    int send_ret = send(client_fd, buffer, strlen(buffer), 0);
    if (send_ret < 0) {
        perror("send failed");
        close(client_fd);
        close(server_fd);
        exit(EXIT_FAILURE);
    }    

    // Zatvaranje socketa.
    close(server_fd);
    close(client_fd);

    return 0;
}
```
Otvorite terminal i pokrenite `gcc L10_server.c -o L10_server && ./L10_server &`.  
Ova naredba će stvoriti izvršnu datoteku i pokrenuti ju.
**Podsjetnik:** znak `&` na kraju naredbe koristi se za pokretanje programa u pozadini.

```c title="L10_client.c"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>       
#include <arpa/inet.h>    
#include <sys/socket.h>   
#include <netinet/in.h>

#define HOST "127.0.0.1"    // Adresa server socketa.
#define SERVER_PORT 65432   // Port na kojem server socket očekuje vezu.
#define BUFFER_SIZE 1024

int main() {
    // Kreiranje novog klijentskog Internet socketa, stream stil komunikacije (+ TCP protokol).
    int socket_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (socket_fd < 0) {
        perror("socket failed");
        exit(EXIT_FAILURE);
    }

    // Konfiguriranje klijentskog socketa na nasumičnom portu.
    // Ovaj korak nije obavezan za klijenta te će se automatski dogoditi
    // u pozadini ukoliko se ne napravi eksplicitno u programskom kodu.
    // Ovo je korisno ukoliko želimo da klijent pošalje poruku sa
    // specifičnog porta ili sa specifičnog mrežnog sučelja (ukoliko ima više
    // mrežnih kartica).
    struct sockaddr_in client_addr;
    client_addr.sin_family = AF_INET;
    client_addr.sin_addr.s_addr = inet_addr(HOST);
    client_addr.sin_port = 0;   // Operacijski sustav će odabrati slobodni port.
    if (bind(socket_fd, (struct sockaddr *)&client_addr, sizeof(client_addr)) < 0) {
        perror("bind failed");
        close(socket_fd);
        exit(EXIT_FAILURE);
    }

    printf("[CLIENT] Connecting to %s:%d\n", HOST, SERVER_PORT);

    // Postavljanje adrese servera.
    struct sockaddr_in server_addr;
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = inet_addr(HOST);
    server_addr.sin_port = htons(SERVER_PORT);

    // Spajanje na server.
    int connect_ret = connect(socket_fd, (struct sockaddr *)&server_addr, sizeof(server_addr));
    if (connect_ret < 0) {
        perror("connect failed");
        close(socket_fd);
        exit(EXIT_FAILURE);
    }

    // Dobi IP adresu i port socketa.
    socklen_t client_addr_len = sizeof(client_addr);
    if (getsockname(socket_fd, (struct sockaddr *)&client_addr, &client_addr_len) == -1) {
        perror("getsockname failed");
        close(socket_fd);
        exit(EXIT_FAILURE);
    }
    printf("[CLIENT] Connection successful. Messages will be sent from %s:%d\n",
           inet_ntoa(client_addr.sin_addr),
           ntohs(client_addr.sin_port));
    
    // Slanje poruke serveru.
    char buffer[BUFFER_SIZE];
    strcpy(buffer, "Hello world");
    send(socket_fd, buffer, strlen(buffer), 0);
    
    // Primi odgovor od servera.
    ssize_t bytes_received = recv(socket_fd, buffer, BUFFER_SIZE - 1, 0);
    if (bytes_received < 0) {
        perror("recv failed");
        close(socket_fd);
        exit(EXIT_FAILURE);
    }
    
    buffer[bytes_received] = '\0';
    printf("[CLIENT] Received message: %s\n", buffer);

    // Zatvaranje socketa.
    close(socket_fd);

    return 0;
}
```
U terminalu pokrenite `gcc L10_client.c -o L10_client && ./L10_client` i pratite ispis poruka.

Pokušajte pokrenuti iduće dvije varijante koda:
1. varijanta: definirajte port koji želite da klijent koristi prilikom poziva `bind` funkciji (morate koristiti htons funkciju prilikom definiranja porta).
2. varijanta: pokušajte izbaciti poziv bind funkciji.

## Zadatak 1: Vješala

Poslužiteljski dio aplikacije u pravilu sadrži većinu logike, prati trenutno stanje i komunicira s klijentima. U primjeru igre Vješala, poslužitelj nasumično odabire tajnu riječ i reagira na korisnikove pokušaje. Pritom prati koliko je pokušaja preostalo do kraja igre i šalje klijentu sve potrebne informacije. Kako biste mogli pokrenuti i testirati vaš kod, pokrenite iduću naredbu koja će skinuti tekstualnu datoteku koja sadrži nekoliko stotina engleskih imenica.

```bash
wget https://gist.githubusercontent.com/eotovic/8aa5bad3e2931e1bdcddd503922fe8b4/raw/c41a7e17c8085f50b5c33e4e27d4ec2694e4b717/os_nouns.txt
```

Nadopunite kod za poslužitelja i omogućite povezivanje s klijentom putem *socket*-a. Logika igre već je implementirana. Nakon toga otvorite terminal i pokrenite `gcc L10_game_server.c -o L10_game_server && ./L10_game_server &`.

```c title="L10_game_server.c"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <unistd.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <netinet/in.h>
#include <time.h>

#define MAX_TRIES 12
#define MAX_WORDS 800
#define MAX_WORD_LENGTH 20
#define BUFFER_SIZE 1024
#define HOST "127.0.0.1"  // Adresa na kojoj se pokreće server socket (lokalno računalo)
#define PORT 65432        // Port na kojem server socket osluškuje (za korisničke aplikacije, koristiti PORT > 1023)

int try;
int words_cnt = 0;
char words[MAX_WORDS][MAX_WORD_LENGTH];
char* target_word;                       // Npr. university
char current_state[MAX_WORD_LENGTH];     // Npr. un-ver--ty   (sadrži crtice za slova koja još nisu pogođena)  
int server_fd, client_fd;
char buffer[BUFFER_SIZE] = {0};

int have_won() {
    return strcmp(target_word, current_state) == 0;
}

void send_to_client(char *buffer) {
    int send_ret = send(client_fd, buffer, strlen(buffer), 0);
    if (send_ret < 0) {
        perror("send failed");
        close(client_fd);
        close(server_fd);
        exit(EXIT_FAILURE);
    }
}

int main() {
    // Postavljanje seeda za generator nasumičnih brojeva.
    srand(time(NULL));

    // Učitavanje popisa riječi.
    FILE *file = fopen("os_nouns.txt", "r");
    if (file == NULL) {
        perror("Error opening file os_nouns.txt");
        return -1;
    }

    for (int i = 0; i < MAX_WORDS; i++) {
        int ret = fscanf(file, "%s", words[i]);
        if (ret == EOF) {
           break;
        }
        words_cnt++;
    }
    fclose(file);
    
    // Nasumični odabir riječi.
    target_word = words[rand() % words_cnt];
    memset(current_state, 0, MAX_WORD_LENGTH);
    memset(current_state, '-', strlen(target_word));
    //printf("[SERVER] Target word: %s\n", target_word);    // Za debug

    // TODO: Kreiraj Internetski socket
    // server_fd = ...

    // TODO: Konfiguriraj server socket na definiranoj adresi i portu
    // ...

    // TODO: Osluškuj zahtjeve za novom vezom
    // ...

    // TODO: Prihvati i uspostavi vezu
    // client_fd = ...



    // Pošalji početno stanje klijentu.
    sprintf(buffer, "%s (%d/%d tries)\n", current_state, try, MAX_TRIES);
    send_to_client(buffer);

    // Glavna petlja (game loop).
    for (try = 1; ; try++) {
        // Pročitaj zaprimljeno slovo.
        ssize_t bytes_received = recv(client_fd, buffer, BUFFER_SIZE - 1, 0);
        if (bytes_received < 0) {
            perror("recv failed");
            exit(EXIT_FAILURE);
        } 
        buffer[bytes_received] = '\0';
        
        if (strlen(buffer) == 1) {
            // Otkri je li u ciljanoj riječi postoji dobiveno slovo.
            int target_word_len = strlen(target_word);
            for (int i = 0; i < target_word_len; i++) {
                if (tolower(buffer[0]) == target_word[i]) {
                    current_state[i] = target_word[i]; 
                }
            }
            //printf("[SERVER] Current state: %s\n", current_state);     // Za debug
        } else {
            printf("[SERVER] I have received %lu characters, but I was expecting only one.\n", strlen(buffer));
        }
        
        
        // Prekini igru ako je cijela riječ otkrivena.
        // Inače. pošalji novo stanje klijentu.
        if (have_won() || try == MAX_TRIES) {
            break;
        }
        sprintf(buffer, "%s (%d/%d tries)\n", current_state, try, MAX_TRIES);
        send_to_client(buffer);
    }
    
    // Posalji poruku za kraj igre.
    if (have_won()) {
        sprintf(buffer, "You win :) You correctly guessed %s\n", target_word);
        send_to_client(buffer);
    } else {
        sprintf(buffer, "You lose :( The secret word was %s\n", target_word);
        send_to_client(buffer);
    }


    // TODO: Zatvori vezu s klijentom
    // ...
    // TODO: Zatvori server socket
    // ...

    return 0;
}
```

Klijentski dio aplikacije predstavlja sučelje prema korisniku koje mu omogućuje sudjelovanje u igri. Nadopunite kod za klijenta i omogućite povezivanje s poslužiteljom putem *socket*-a. Nakon toga u terminalu pokrenite `gcc L10_game_client.c -o L10_game_client && ./L10_game_client` i odigrajte rundu Vješala. **Dozvoljen je unos jednog slova.**

```c title="L10_game_client.c"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>       
#include <arpa/inet.h>    
#include <sys/socket.h>   
#include <netinet/in.h>

#define HOST "127.0.0.1"    // Adresa server socketa.
#define SERVER_PORT 65432   // Port na kojem server socket očekuje vezu.
#define BUFFER_SIZE 1024

int main() {

    // TODO: Kreiraj Internetski socket
    // socket_fd = ...

    // TODO: Poveži se sa serverom
    // ...
    
    // Beskonačna petlja služi kao polling mehanizam
    // Ne znamo unaprijed koliko ćemo poruka razmijeniti sa serverom.
    // Komunikacija završava kada završi igra (ili smo pogodili tajnu riječ ili smo potrošili sve pokušaje)
    char buffer[BUFFER_SIZE];
    while (1) {
        // Primi odgovor od servera.
        ssize_t bytes_received = recv(socket_fd, buffer, BUFFER_SIZE - 1, 0);
        if (bytes_received < 0) {
            perror("recv failed");
            exit(EXIT_FAILURE);
        }
        buffer[bytes_received] = '\0';
        printf("%s\n", buffer);
        
        // Provjeri je li igra završila i ako je, prekini program.
        // Igra je gotova kada primljena poruka ne sadrži crtice.
        int gameover = 1;
        for (int i = 0; i < bytes_received; i++) {
             if (buffer[i] == '-') {
                gameover = 0;
             }
        }
        
        if (gameover) {
            break;
        }
        
        // Pitaj igrača za unos.
        printf("Enter you guess: ");
        scanf("%s", buffer);
        if (send(socket_fd, buffer, strlen(buffer), 0) < 0) {
            perror("send failed");
            close(socket_fd);
            exit(EXIT_FAILURE);
        }
    }    

    // TODO: Zatvori klijentski socket
    // ...

    return 0;
}
```

Ovakva podjela i razdvajanje logike igre od korisničkog sučelja, uz korištenje utičnica za komunikaciju između poslužitelja i klijenata omogućuje efikasnu interakciju i fleksibilan razvoj:
- Možda ćemo jednog dana htjeti izgraditi grafičko sučelje za igru umjesto tekstualnog sučelja. Tada ćemo mijenjati samo klijentski dio aplikacije, a poslužiteljsku logiku ne moramo mijenjati.
- Možemo mijenjati parametre igre (maksimalan broj pokušaja, raspon duljine nasumičnih riječi) na poslužitelju, bez utjecaja na klijenta.

**Napomena:** Ako budete htjeli više puta isprobati igru, morat ćete sačekati između pokušaja da operacijski sustav oslobodi port koji koristite za komunikaciju. Čak i nakon uspješnog zatvaranja socketa, taj port može ostati u `TIME_WAIT` statusu neko vrijeme. Budite strpljivi i **uvijek prvo pokrećite poslužitelja, a tek onda klijenta**.

## Primjer 2: Višestruke veze

Do sada smo radili sa slučajem u kojem se na jednog poslužitelja spaja točno jedan klijent. Korištenjem utičnica možemo omogućiti da više klijenata pristupa istom poslužitelju i tako postići interakciju među korisnicima. U ovom primjeru izgradit ćemo chat aplikaciju kako bismo demonstrirali rad s višestrukim vezama. Dodavanje te funkcionalnosti učinit će naš kod malo kompleksnijim.

S poslužiteljske strane, osim inicijalizacije veze, logike aplikacije i zatvaranja veze, moramo dodati još jednu zadaću: upravljanje višestrukim vezama. To ujedno postaje i **glavna zadaća** našeg servera, što znači da se logika aplikacije seli u odvojenu dretvu i to na način da se ona preslikava na svakog spojenog klijenta (jedan klijent = jedna dretva, funkcija `client_thread`). Klijente koji su se spojili na server pratimo u listi `clients`. Kada klijent želi prekinuti komunikaciju, **mičemo ga iz liste**. Također, dodajemo mogućnost da se poruka koju je poslao jedan klijent emitira svim ostalim spojenim klijentima (funkcija `broadcast`). Naš server omogućava da se više klijenata uključi u chat, ali se "gasi" u trenutku kada svi klijenti označe kraj komunikacije, odnosno kada je lista `clients` prazna.

*Napomena:* u idućim kodovima su neke od prethodno pokazanih provjera preskočene kako se kod ne bi dodatno zakomplicirao.

U terminalu pokrenite `gcc -pthread L10_multi_server.c -o L10_multi_server && ./L10_multi_server &`.

```c title="L10_multi_server.c"
#include <pthread.h>
#include <fcntl.h>    // Potrebno za prebaciti socket u non-blocking mode
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <netinet/in.h>
#include <time.h>

#define HOST "127.0.0.1"  // Adresa na kojoj se pokreće server socket (lokalno računalo)
#define PORT 65432        // Port na kojem server socket osluškuje (za korisničke aplikacije, koristiti PORT > 1023)
#define BUFFER_SIZE 1024  // Veličina spremnika za prihvat poruka.

int loop = 1;

// Struktura koja sadrži podatke o jednom klijentu.
typedef struct {
    int socket_fd;
    char display_name[50];
} client_t;

// Lista trenutnih klijenata.
int clients_cnt = 0;
client_t* clients;

// Na kraj liste klijenata dodaje jednog novog klijenta.
client_t* create_client() {
    clients_cnt++;
    if (clients == NULL) {
        clients = malloc(sizeof(client_t));
    } else {
        clients = realloc(clients, sizeof(client_t) * clients_cnt);
    }
    return &clients[clients_cnt - 1];
}

// Pronalazi proslijeđenog klijenta u listi i briše ga.
void remove_client(client_t client) {
    clients_cnt--;
    if (clients_cnt == 0) {
        free(clients);
    } else {
        int shift = 0;
        for (int i = 0; i < clients_cnt; i++) {
            if (clients[i].socket_fd == client.socket_fd) {
                shift = 1;
            } else if (shift) {
                clients[i - 1] = clients[i];
            }
        }
    }
}

// Ova funkcija šalje poruku svim spojenim korisnicima osim pošiljaocu poruke.
void broadcast(client_t client, char* message) {
    char buffer[1024];
    sprintf(buffer, "%s: %s", client.display_name, message);
    for (int i = 0; i < clients_cnt; i++) {
        if (clients[i].socket_fd != client.socket_fd) {
            send(clients[i].socket_fd, buffer, strlen(buffer), 0);
        }
    }
}

// Funkcija koja se izvršava za svakog klijenta u posebnoj dretvi.
void* client_thread(void* arg) {
    // Kopiramo podatke klijenta u lokalnu varijablu.
    client_t client = *(client_t*)arg;

    // Ovaj kod se izvršava za sve spojene klijente.
    // Beskonačna petlja jer server ne zna unaprijed koliko će poruka razmijeniti s određenim klijentom.
    char buffer[1024];
    while (1) {
      ssize_t bytes_received = recv(client.socket_fd, buffer, 1023, 0);

      // Kada klijent pošalje praznu poruku, to je znak da želi prekinuti komunikaciju.
      if (bytes_received == 0) {
          close(client.socket_fd);
          remove_client(client);
          break;
      } else if (bytes_received > 0) {
          buffer[bytes_received] = '\0';
          broadcast(client, buffer);
      }
    }
}

int main() {
    // Stvaranje novog serverskog Internet socketa, stream stil komunikacije (+ TCP protokol).
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        perror("Socket failed");
        exit(EXIT_FAILURE);
    }

    // Prebaci socket u non-blocking mode
    int flags = fcntl(server_fd, F_GETFL, 0);
    fcntl(server_fd, F_SETFL, flags | O_NONBLOCK);

    // Postavljanje HOST adrese i porta u strukturu.
    // Ovo je dalje potrebno za bind funkciju.
    struct sockaddr_in address;
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = inet_addr(HOST);
    address.sin_port = htons(PORT);

    // Postavljanje server socketa na definiranu adresu i port.
    if (bind(server_fd, (struct sockaddr *)&address, sizeof(address)) < 0) {
        perror("bind failed");
        close(server_fd);
        exit(EXIT_FAILURE);
    }

    // Pripremi server socket za provjeravanje novih zahtjeva za vezu.
    listen(server_fd, 5);

    printf("[SERVER] Waiting for connections on port %d...\n", PORT);

    // Petlja će čekati prvog klijenta te se zatim ponavljati dokle god je barem ijedan
    // klijent spojen. Server se gasi kada se svi klijenti odspoje.
    while (clients_cnt > 0 || loop) {
        socklen_t addrlen = sizeof(address);
        int socket_fd = accept(server_fd, (struct sockaddr *)&address, &addrlen);
        
        // Izvršava se ako se netko povezao na server.
        if (socket_fd >= 0) {
            loop = 0;
            
            // Stvori novog klijenta
            client_t* new_client = create_client();
            new_client->socket_fd = socket_fd;
            sprintf(new_client->display_name, "%s:%d", inet_ntoa(address.sin_addr), ntohs(address.sin_port));
            
            printf("[SERVER] Accepted connection from %s\n", new_client->display_name);
                
            // Pokreni dretvu za novog klijenta
            pthread_t tid;
            pthread_create(&tid, NULL, client_thread, new_client);
        }
        
        // Čekamo 1 sekundu prije idućeg pokušaja
        sleep(1);
    }


    // Zatvaranje socketa.
    for (int i = 0; i < clients_cnt; i++) {
        close(clients[i].socket_fd);
    }
    close(server_fd);
    free(clients);

    return 0;
}
```
Kod za klijenta je isto postao malo kompleksniji. U prethodnim slučajevima, komunikacija između klijenta i servera je bila slijedna jer je klijent očekivao poruku od servera tek kao **odgovor** na poruku koju bi mu sam poslao. U chat aplikaciji svi korisnici mogu slati poruke nedefiniranim redoslijedom. To znači da klijent mora istovremeno pratiti dva izvora podataka: standardni ulaz ako trenutni korisnik želi poslati neku poruku i vezu sa server socketom ako želi proslijediti poruke od ostalih klijenata. Te dvije zadaće mogle bi se odvojiti i u dvije dretve, ali ovdje ćemo koristiti malo stariji mehanizam, funkciju `select`.

U dva različita terminala pokrenite `gcc -pthread L10_multi_client.c -o L10_multi_client && ./L10_multi_client` i isprobajte chat funkcionalnost. Kada želite završiti s komunikacijom, pritisnite `Enter`.

```c title="L10_multi_client.c"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <sys/select.h>
#include <arpa/inet.h>
#include <fcntl.h>

#define BUFFER_SIZE 1024
#define HOST "127.0.0.1"
#define PORT 65432

int main() {
char buffer[BUFFER_SIZE];

    // Kreiranje novog klijentskog Internet socketa, stream stil komunikacije (+ TCP protokol).
    int socket_fd = socket(AF_INET, SOCK_STREAM, 0);

    // Postavljanje adrese servera.
    struct sockaddr_in server_addr;
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = inet_addr(HOST);
    server_addr.sin_port = htons(PORT);

    // Spajanje na server.
    int connect_ret = connect(socket_fd, (struct sockaddr *)&server_addr, sizeof(server_addr));
    if (connect_ret < 0) {
        perror("connect failed");
        close(socket_fd);
        exit(EXIT_FAILURE);
    }
    
    while (1) {
        fd_set readfds;
        FD_ZERO(&readfds);
        FD_SET(STDIN_FILENO, &readfds);  // Dodaj stdin u set za praćenje (na većini sustava je STDIN_FILENO == 0)
        FD_SET(socket_fd, &readfds);        // Dodaj socket u set za praćenje
        
        // Predstavlja posljednji file descriptor kojeg će select provjeriti + 1
        int maxfd = (STDIN_FILENO > socket_fd ? STDIN_FILENO : socket_fd) + 1;
    
        int activity = select(maxfd, &readfds, NULL, NULL, NULL);
        if (activity < 0) {
            perror("select error");
            break;
        }

        // Provjera je li korisnik natipkao nešto.
        if (FD_ISSET(STDIN_FILENO, &readfds)) {
            fgets(buffer, BUFFER_SIZE, stdin);
            size_t len = strlen(buffer);
            buffer[len - 1] = '\0';  // Ukloni znak za novi red

            // Ukoliko je ulaz prazan, završi petlju.
            if (strlen(buffer) == 0) {
                break;
            }

            // Slanje poruke serveru.
            send(socket_fd, buffer, strlen(buffer), 0);
            printf("[You] %s\n", buffer);
        }

        // Provjera jesu li primljene poruke sa servera.
        if (FD_ISSET(socket_fd, &readfds)) {
            int received_bytes = recv(socket_fd, buffer, BUFFER_SIZE - 1, 0);
            buffer[received_bytes] = '\0';
            printf("%s\n", buffer);
        }
    }

    close(socket_fd);
    return 0;
}
```
**Pitanje:** primjećujete li neki problem u serverskom kodu iz perspektive višedretvenosti?
## Zadatak 2: Višestruka Vješala

Probajte nadopuniti kod iz Zadatka 1 prateći Primjer 2 kako biste omogućili da više klijenata istovremeno igraju Vješala i zajedno pogađaju tajnu riječ.

```c title="L10_game_multi_server.c"
#include <pthread.h>
#include <fcntl.h>    // Potrebno za prebaciti socket u non-blocking mode
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <unistd.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <netinet/in.h>
#include <time.h>

#define MAX_TRIES 12
#define MAX_WORDS 800
#define MAX_WORD_LENGTH 20
#define BUFFER_SIZE 1024
#define HOST "127.0.0.1"  // Adresa na kojoj se pokreće server socket (lokalno računalo)
#define PORT 65432        // Port na kojem server socket osluškuje (za korisničke aplikacije, koristiti PORT > 1023)

int try;
int words_cnt = 0;
char words[MAX_WORDS][MAX_WORD_LENGTH];
char* target_word;                       // Npr. university
char current_state[MAX_WORD_LENGTH];     // Npr. un-ver--ty   (sadrži crtice za slova koja još nisu pogođena)  
int server_fd, client_fd;
char buffer[BUFFER_SIZE] = {0};
int gameover = 0;

// Struktura koja sadrži podatke o jednom klijentu.
typedef struct {
    int socket_fd;
} client_t;

// Lista trenutnih klijenata.
int clients_cnt = 0;
client_t* clients;

// Na kraj liste klijenata dodaje jednog novog klijenta.
client_t* create_client() {
    clients_cnt++;
    if (clients == NULL) {
        clients = malloc(sizeof(client_t));
    } else {
        clients = realloc(clients, sizeof(client_t) * clients_cnt);
    }
    return &clients[clients_cnt - 1];
}

// Pronalazi proslijeđenog klijenta u listi i briše ga.
void remove_client(client_t client) {
    clients_cnt--;
    if (clients_cnt == 0) {
        free(clients);
    } else {
        int shift = 0;
        for (int i = 0; i < clients_cnt; i++) {
            if (clients[i].socket_fd == client.socket_fd) {
                shift = 1;
            } else if (shift) {
                clients[i - 1] = clients[i];
            }
        }
    }
}

// Ova funkcija šalje poruku svim spojenim korisnicima osim pošiljaocu poruke.
void broadcast(char* message) {
    for (int i = 0; i < clients_cnt; i++) {
        // TODO: poslati klijentu i poruku message
        // send(...)
    }
}

// Vraća 1 ako su igrači pobijedili. Inače vraća 0.
int have_won() {
    return strcmp(target_word, current_state) == 0;
}

// Funkcija koja se izvršava za svakog klijenta u posebnoj dretvi.
void* client_thread(void* arg) {
    // Kopiramo podatke klijenta u lokalnu varijablu.
    client_t client = *(client_t*)arg;

    // Novi klijent se spojio. Poslati samo njemu trenutno stanje igre koje je spremljeno u polju buffer.
    char buffer[1024];
    sprintf(buffer, "%s (%d/%d tries)\n", current_state, try, MAX_TRIES);
    send(client.socket_fd, buffer, strlen(buffer), 0);
    

    // Ovaj kod se izvršava za sve spojene klijente.
    // Beskonačna petlja jer server ne zna unaprijed koliko će poruka razmijeniti s određenim klijentom.
    while (gameover == 0) {
      // Recv blokira dok od klijenta ne primi poruku.
      ssize_t bytes_received = recv(client.socket_fd, buffer, 1023, 0);

      // Game logic
      try++;
      buffer[bytes_received] = '\0';     
      if (strlen(buffer) == 1) {
          // Otkri je li u ciljanoj riječi postoji dobiveno slovo.
          int target_word_len = strlen(target_word);
          for (int i = 0; i < target_word_len; i++) {
              if (tolower(buffer[0]) == target_word[i]) {
                  current_state[i] = target_word[i]; 
              }
          }
          //printf("[SERVER] Current state: %s\n", current_state);     // Za debug
      } else {
          printf("[SERVER] I have received %lu characters, but I was expecting only one.\n", strlen(buffer));
      }
      
      
      // Obavijesti svih o trenutnom stanju igre.
      sprintf(buffer, "%s (%d/%d tries)\n", current_state, try, MAX_TRIES);
      broadcast(buffer);
      
      if (have_won() || try == MAX_TRIES) {
          gameover = 1;
          break;
      }
    }
    
    // Pošalji poruku za kraj igre.
    if (have_won()) {
        sprintf(buffer, "You win :) You correctly guessed %s\n", target_word);
    } else {
        sprintf(buffer, "You lose :( The secret word was %s\n", target_word);
    }
    broadcast(buffer);
}


int main() {
    // Postavljanje seeda za generator nasumičnih brojeva.
    srand(time(NULL));

    // Učitavanje popisa riječi.
    FILE *file = fopen("os_nouns.txt", "r");
    if (file == NULL) {
        perror("Error opening file os_nouns.txt");
        return -1;
    }

    for (int i = 0; i < MAX_WORDS; i++) {
        int ret = fscanf(file, "%s", words[i]);
        if (ret == EOF) {
           break;
        }
        words_cnt++;
    }
    fclose(file);
    
    // Nasumični odabir riječi.
    target_word = words[rand() % words_cnt];
    memset(current_state, 0, MAX_WORD_LENGTH);
    memset(current_state, '-', strlen(target_word));
    //printf("[SERVER] Target word: %s\n", target_word);    // Za debug

    // Stvaranje novog serverskog Internet socketa, stream stil komunikacije (+ TCP protokol).
    server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        perror("Socket failed");
        exit(EXIT_FAILURE);
    }
    
    // Prebaci socket u non-blocking mode
    int flags = fcntl(server_fd, F_GETFL, 0);
    fcntl(server_fd, F_SETFL, flags | O_NONBLOCK);

    // Postavljanje host adrese i porta u strukturu.
    struct sockaddr_in address;
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = inet_addr(HOST);
    address.sin_port = htons(PORT);

    // Postavljanje server socketa na definiranu adresu i port.
    if (bind(server_fd, (struct sockaddr *)&address, sizeof(address)) < 0) {
        perror("bind failed");
        close(server_fd);
        exit(EXIT_FAILURE);
    }

    // Pripremi server socket za provjeravanje novih zahtjeva za vezu.
    listen(server_fd, 5);

    printf("[SERVER] Waiting for connections on port %d...\n", PORT);

    // Petlja zadužena za prihvat novih veza.
    // Petlja se ponavlja dok igra ne završi.
    while (gameover == 0) {
        // TODO: Prihvati vezu od novog klijenta
        // socklen_t addrlen = 
        // socket_fd = 

        // Izvršava se ako se netko povezao na server.
        if (socket_fd >= 0) {
            // Stvori novog klijenta
            client_t* new_client = create_client();
            new_client->socket_fd = socket_fd;

            printf("[SERVER] New player joined the game. Players count: %d\n", clients_cnt);

            // TODO: Pokreni dretvu za novog klijenta
            // ...
        }

        // Čekamo 1 sekundu prije idućeg pokušaja
        sleep(1);
    }

    // TODO: Zatvori sve veze s klijentima (iteriraj po listi clients)
    // ...

    return 0;
}
```
```c title="L10_game_multi_client.c"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>       
#include <arpa/inet.h>    
#include <sys/socket.h>   
#include <netinet/in.h>

#define HOST "127.0.0.1"    // Adresa server socketa.
#define SERVER_PORT 65432   // Port na kojem server socket očekuje vezu.
#define BUFFER_SIZE 1024

int main() {
    // Kreiranje novog klijentskog Internet socketa, stream stil komunikacije (+ TCP protokol).
    int socket_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (socket_fd < 0) {
        perror("socket failed");
        exit(EXIT_FAILURE);
    }

    // Postavljanje adrese servera.
    struct sockaddr_in server_addr;
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = inet_addr(HOST);
    server_addr.sin_port = htons(SERVER_PORT);

    // Spajanje na server.
    if (connect(socket_fd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("connect failed");
        close(socket_fd);
        exit(EXIT_FAILURE);
    }
    
    char buffer[BUFFER_SIZE];
    while (1) {
        fd_set readfds;
        FD_ZERO(&readfds);
        FD_SET(STDIN_FILENO, &readfds);     // Dodaj stdin u set za praćenje (na većini sustava je STDIN_FILENO == 0)
        FD_SET(socket_fd, &readfds);        // Dodaj socket u set za praćenje

        // Predstavlja posljednji file descriptor kojeg će select provjeriti + 1
        int maxfd = (STDIN_FILENO > socket_fd ? STDIN_FILENO : socket_fd) + 1;

        int activity = select(maxfd, &readfds, NULL, NULL, NULL);
        if (activity < 0) {
            perror("select error");
            break;
        }

        // Provjera je li igrač unio nešto.
        if (FD_ISSET(STDIN_FILENO, &readfds)) {
            scanf("%s", buffer);
            // TODO: poslati tekst iz buffera serveru
        }

        // Provjera jesu li primljene poruke sa servera.
        if (FD_ISSET(socket_fd, &readfds)) {
            int bytes_received = recv(socket_fd, buffer, BUFFER_SIZE - 1, 0);
            buffer[bytes_received] = '\0';
            printf("%s\n", buffer);
            
            // Provjeri je li igra završila i ako je, prekini program.
            // Igra je gotova kada primljena poruka ne sadrži crtice.
            int gameover = 1;
            for (int i = 0; i < bytes_received; i++) {
                 if (buffer[i] == '-') {
                    gameover = 0;
                 }
            }
            
            if (gameover) {
                break;
            }
        }
    }    

    // TODO: Zatvaranje socketa.
    // ...

    return 0;
}
```
