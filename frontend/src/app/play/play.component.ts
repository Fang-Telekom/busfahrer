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
  public phase: String = "lobby";
  public players = [];

  constructor(private wsService: WebSocketService) {}

  ngOnInit(): void {
    this.wsService.connect();

    this.sub = this.wsService.messages$.subscribe((msg: any) => {
      console.log('[Frontend] Message received:', msg);

      const type = msg.type;
      this.phase = msg.phase;
      this.players = msg.players;
      // handle game state, results, etc.
    });
  }
  getPlayerNames(): string[] {
    return Object.keys(this.players);
  }
  startGame() {
    this.wsService.sendMessage({ action: 'start' });
  }

  sendGuess(guess: string) {
    this.wsService.sendMessage({ action: 'guess', guess });
  }

  sendChat(message: string) {
    this.wsService.sendMessage({ action: 'chat', message });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.wsService.close();
  }
}
