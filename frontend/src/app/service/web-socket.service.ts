//web-socket.service.ts

import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
@Injectable({
 providedIn: 'root',
})
export class WebSocketService {
 private webSocket: Socket;
 constructor() {
  this.webSocket = new Socket({
   url: "https://exampleUrl.com",
   options: {},
  });
 }

 // this method is used to start connection/handhshake of socket with server
 connectSocket(message: String) {
  this.webSocket.emit('connect', message);
 }

 // this method is used to get response from server
 receiveStatus() {
  return this.webSocket.fromEvent('/get-response');
 }

 // this method is used to end web socket connection
 disconnectSocket() {
  this.webSocket.disconnect();
 }
}