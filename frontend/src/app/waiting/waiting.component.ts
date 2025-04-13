import { Component } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core';
import { WebSocketService } from '../service/web-socket.service';

@Component({
  selector: 'waiting',
  templateUrl: './waiting.html',
  styleUrl: './waiting.css'
})
export class waitingComponent implements OnInit, OnDestroy{
  constructor(private websocketService: WebSocketService) { }
  ngOnInit(): void {
    this.initializeSocketConnection();
   }
  
   ngOnDestroy() {
    this.disconnectSocket();
   }
  
   // Initializes socket connection
   initializeSocketConnection() {
    this.websocketService.connectSocket('message');
   }
  
   // Receives response from socket connection 
   receiveSocketResponse() {
    this.websocketService.receiveStatus().subscribe((receivedMessage: string) => {
     console.log(receivedMessage);
    });
   }
  
   // Disconnects socket connection
   disconnectSocket() {
    this.websocketService.disconnectSocket();
   }
  
  async start(){


    window.location.href="/first"
  }
}