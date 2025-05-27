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
  //suits = ['♠', '♥', '♦', '♣']
  //Spades, Heart, Diamond, Clubs
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
        if(this.phase == "qualifying")
          this.turn_player = msg.next_player;
      } else if(type == "pyramid"){
        this.pyramid = msg.pyramid; 
      } else if(type == "pyramidCard"){
        this.openPyramid[msg.pyramid_id] = true;
        console.log(this.openPyramid)
      } else if(type == 'player'){
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
    this.wsService.sendMessage({ action: 'start' });
  }
  sendGuess(guess: string) {
    this.wsService.sendMessage({ action: 'guess', guess });
  }
  allOpened(): boolean {
    return this.openPyramid.slice(0, 9).every(value => value === true);
  }
  sendGuessBus(guess: string) {
    this.wsService.sendMessage({ action: 'guessBus', guess });
  }
  advance(){
    this.wsService.sendMessage({ action: 'next_phase' });
  }
  openCard(id:number){
    this.wsService.sendMessage({ action: 'reveal_pyramid', id });
  }
  sendChat(message: string) {
    this.wsService.sendMessage({ action: 'chat', message });
  }
  done(){
    window.location.href="/"
  }
  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.wsService.close();
  }
}
