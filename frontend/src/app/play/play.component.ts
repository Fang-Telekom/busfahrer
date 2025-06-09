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
  // suits = ['♠', '♥', '♦', '♣']
  // Spades, Heart, Diamond, Clubs
  private sub!: Subscription;
  public phase: String = "lobby";
  public players: {[key: string]:{
    "username": string,
    "cards": []
    "state": string,
    "score": number
  } } = {};
  public cards:any[] = [];
  public player: string = "";
  public room = "";
  public master = "";
  public turn_player = "";
  public card: string = "";
  public correct: boolean = false;
  public score: number= 0;
  public pyramid:[] = [];
  public openPyramid:boolean[] = Array(10).fill(false);

  public notification : "message" | null = null;
  public message : {title: string, message: string} = {title: "None", message: "error"}
  constructor(private wsService: WebSocketService) {}

  ngOnInit(): void {
    const room = new URLSearchParams(window.location.search).get('room');
    const user = new URLSearchParams(window.location.search).get('username');
    if (room != null || room == ""){
      if (user != null || user == "")
        this.wsService.connect(room, user);
      else
        this.wsService.connect(room, "");
    }
      
    else
      window.location.href="/"

    this.wsService.connectionStatus$.subscribe((status) => {
      if (status === 'error') {
       // window.location.href="/"
      }
    });

    this.sub = this.wsService.messages$.subscribe((msg: any) => {
      console.log('[Frontend] Message received:', msg);

      const type = msg.type;
      
      if(type == 'state'){
        this.phase = msg.phase;
        this.players = msg.players;
        this.cards = this.players[this.player]['cards'];
        this.score = this.players[this.player]['score'];
        this.master = msg.master;
        this.room = msg.room;
      } else if (type == "guess_result"){
        this.card = msg.card;
        this.correct = msg.correct;
        
        this.turn_player = msg.next_player;
        if(this.phase == "qualifying" && this.player == this.turn_player){
          this.notification = "message"
          this.message.title = "Benachrichtigung"
          this.message.message = "Sie sind nun am Zug"
          
        } else if(this.phase == "bus" && this.player == this.turn_player){
          this.notification = "message"
          this.message.title = "Benachrichtigung"
          if(this.correct)
            this.message.message = "Sie lagen Richtig"
          else
            this.message.message = "Sie lagen Falsch"
          
        }
          
      } else if(type == "pyramid"){
        this.pyramid = msg.pyramid; 
      } else if(type == "pyramidCard"){
        this.openPyramid[msg.pyramid_id] = true;
        console.log(this.openPyramid)
      } else if(type == "pyramid_reveal"){
        this.notification = "message"
        this.message.title = "Kartenoffenbarung"
        this.message.message = "Wert ihrer Karte " + msg.message + " gleicht der Offenbarung!"
      }else if(type == 'player'){
        this.player = msg.player;
      }
      console.log(this.card)
      // handle game state, results, etc.
    });

  }
  getPlayerNames(): string[] {
    return Object.keys(this.players);
  }
  getCardCount(): number {
    return this.cards.length;
  }
  startGame() {

     if(this.master == this.player){
      this.wsService.sendMessage({ action: 'start' });
      this.turn_player = this.master
     }
    else{
      this.notification = "message"
      this.message.title = "Verbot"
      this.message.message = "Erbitten Sie den Spielmeister die Spiele zu beginnen!"
    }
    
  }
  sendGuess(guess: string) {
    if(this.turn_player == this.player)
      this.wsService.sendMessage({ action: 'guess', guess });
    else{
      this.notification = "message"
      this.message.title = "Verbot"
      this.message.message = "Sie sind nicht am Zug"
    }
  }
  allOpened(): boolean {
    return this.openPyramid.slice(0, 9).every(value => value === true);
  }
  sendGuessBus(guess: string) {
    this.wsService.sendMessage({ action: 'guessBus', guess });
  }
  advance(){
    if(this.master == this.player){
      this.wsService.sendMessage({ action: 'next_phase' });
     }
    else{
      this.notification = "message"
      this.message.title = "Verbot"
      this.message.message = "Erbitten Sie den Spielmeister die Spiele in die nächste Phase zu leiten!"
    }
    
  }
  openCard(id:number){
     if(this.master == this.player)
      this.wsService.sendMessage({ action: 'reveal_pyramid', id });
    else{
      this.notification = "message"
      this.message.title = "Verbot"
      this.message.message = "Erbitten Sie den Spielmeister die Karte zu offenbaren"
    }
  }
  sendChat(message: string) {
    this.wsService.sendMessage({ action: 'chat', message });
  }
  done(){  
    this.notification = "message"
    this.message.title = "Dankaussagung"
    this.message.message = "Vielen Dank fürs Spielen! Eine Spende für die Entwickler wäre schätzenswert!"
  }
  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.wsService.close();
  }

  toggleModal(modal: 'message' | null){
    this.notification = modal;
  }
}
