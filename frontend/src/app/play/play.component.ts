import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebSocketService } from '../service/web-socket.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-play',
  imports: [CommonModule],
  templateUrl: './play.component.html',
  styleUrl: './play.component.css'
})
export class PlayComponent implements OnInit, OnDestroy {
  private sub!: Subscription;
  public phase: string = "lobby";
  public players: {
    [key: string]: {
      username: string,
      cards: [],
      state: string,
      score: number
    }
  } = {};
  public cards: any[] = [];
  public player: string = "";
  public room = "";
  public master = "";
  public turn_player = "";
  public card: string = "";
  public correct: boolean = false;
  public score: number = 0;
  public pyramid: string[] = [];
  public openPyramid: boolean[] = Array(10).fill(false);

  public notification: "message" | null = null;
  public message: { title: string, message: string } = { title: "None", message: "error" };

  private timeoutHandle: any;

  constructor(private wsService: WebSocketService) {}

  ngOnInit(): void {
    const room = new URLSearchParams(window.location.search).get('room');
    const user = new URLSearchParams(window.location.search).get('username');
    if (room != null || room == "") {
      if (user != null || user == "")
        this.wsService.connect(room, user);
      else
        this.wsService.connect(room, "");
    } else {
      window.location.href = "/";
    }

    window.addEventListener('keydown', this.handleEscKey);

    this.wsService.connectionStatus$.subscribe((status) => {
      if (status === 'error') {
        this.notification = "message";
        this.message.title = "Party Ongoing";
        this.message.message = "Party Crasher be Gone";
        // window.location.href="/"
      }
    });

    this.sub = this.wsService.messages$.subscribe((msg: any) => {
      const type = msg.type;

      if (type == 'state') {
        this.phase = msg.phase;
        this.players = msg.players;
        this.cards = this.players[this.player]['cards'];
        this.score = this.players[this.player]['score'];
        this.master = msg.master;
        this.room = msg.room;
      } else if (type == "guess_result") {
        this.card = msg.card;
        this.correct = msg.correct;
        this.turn_player = msg.next_player;
        if (this.phase == "qualifying" && this.player == this.turn_player) {
          this.showNotification("Der Bus will weiterfahren!", "Fahre fort oder der Bus fährt fort.");
        } else if (this.phase == "bus" && this.player == this.turn_player) {
          this.showNotification("Benachrichtigung", this.correct ? "Du lagst richtig!" : "Du lagst falsch!");
        }
      } else if (type == "pyramid") {
        this.pyramid = msg.pyramid;
      } else if (type == "pyramidCard") {
        this.openPyramid[msg.pyramid_id] = true;
      } else if (type == "pyramid_reveal") {
        this.showNotification("Treffer!!!", `Der Wert deiner Karte ${msg.message} gleicht der aufgedeckten Karte! Verteile einen Schluck an einen Mitspieler!`);
      } else if (type == 'player') {
        this.player = msg.player;
      } else if (type == "bus_setup"){
        this.turn_player = msg.next_player;
        this.card = msg.card;
        this.notification = "message";
        this.message.title = "Willkommen im Bus";
        if(this.player == this.turn_player)
          this.message.message = `Du hast die Ehre, den Bus zu fahren!`;
        else
          this.message.message = `Der Spieler ${this.turn_player} ist der Auserwählte!`;
      }
    });
  }
  messageAction(){
    if(this.message.title=="Party Ongoing"){
      window.location.href="/"      
    }
    this.toggleModal(null)
  }
  private showNotification(title: string, message: string) {
    this.notification = "message";
    this.message.title = title;
    this.message.message = message;
    clearTimeout(this.timeoutHandle);
    this.timeoutHandle = setTimeout(() => {
      this.notification = null;
    }, 2400);
  }

  handleEscKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.notification) {
      this.notification = null;
    }
  };

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.wsService.close();
    window.removeEventListener('keydown', this.handleEscKey);
  }

  getPlayerNames(): string[] {
    return Object.keys(this.players);
  }

  getCardCount(): number {
    return this.cards.length;
  }

  startGame() {
    if (this.master == this.player) {
      this.wsService.sendMessage({ action: 'start' });
      this.turn_player = this.master;
    } else {
      this.showNotification("Startklar?", "Frag den Game Master, ob er bereit ist!");
    }
  }

  sendGuess(guess: string) {
    if (this.turn_player == this.player) {
      this.wsService.sendMessage({ action: 'guess', guess });
    } else {
      this.showNotification("Hab Geduld!", "Du bist nicht am Zug.");
    }
  }

  allOpened(): boolean {
    return this.openPyramid.slice(0, 10).every(value => value === true);
  }

  sendGuessBus(guess: string) {
    this.wsService.sendMessage({ action: 'guessBus', guess });
  }

  advance() {
    if (this.master == this.player) {
      this.wsService.sendMessage({ action: 'next_phase' });
    } else {
      this.showNotification("Stop!", "Bitte den Game Master die nächste Runde zu starten!");
    }
  }

  openCard(id: number) {
    if (this.master == this.player) {
      this.wsService.sendMessage({ action: 'reveal_pyramid', id });
    } else {
      this.showNotification("Stop!", "Bitte den Game Master die nächste Karte aufzudecken!");
    }
  }

  sendChat(message: string) {
    this.wsService.sendMessage({ action: 'chat', message });
  }

  done() {
    this.showNotification("Finito!", "Vielen Dank fürs Spielen! Wir wünschen weiterhin einen guten Durst!");
  }

  toggleModal(modal: 'message' | null) {
    this.notification = modal;
    if (modal !== null) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = setTimeout(() => {
        this.notification = null;
      }, 2400);
    }
  }
}
