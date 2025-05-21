import { Component } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core';
import { WebSocketService } from '../service/web-socket.service';
import { json } from 'node:stream/consumers';

@Component({
  selector: 'waiting',
  templateUrl: './waiting.html',
  styleUrl: './waiting.css'
})
export class waitingComponent{
  
  async start(){


    window.location.href="/first"
  }
}