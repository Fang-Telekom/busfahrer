//web-socket.service.ts

import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, Subject } from 'rxjs';
@Injectable({
 providedIn: 'root',
})

export class WebSocketService {
    private socket$!: WebSocketSubject<WebSocketMessage>;
    private messagesSubject$ = new Subject<any>();
    public messages$ = this.messagesSubject$.asObservable();

    private connectionStatusSubject$ = new Subject<'connected' | 'error'>();
    public connectionStatus$ = this.connectionStatusSubject$.asObservable();

    //private baseUrl = 'ws://localhost/ws/party/';
    private baseUrl = 'ws://localhost:8000/ws/party/';
    
    private room = 'myroom'; // ToDo can be dynamic

    constructor() {}

    connect(room: string, user:string): void {
        const url = `${this.baseUrl}${room}/${user}/`;

        this.socket$ = webSocket({
        url: url,
        deserializer: (e) => JSON.parse(e.data),
        serializer: (value) => JSON.stringify(value),
        openObserver: {
            next: () => {
                console.log('[WebSocket] Connection established');
                this.connectionStatusSubject$.next('connected');
            },
        },
        closeObserver: {
            next: () => {
            console.log('[WebSocket] Connection closed');
            },
        },
        });

        this.socket$.subscribe({
        next: (msg) => this.messagesSubject$.next(msg),
        error: (err) => {
            console.error('[WebSocket] Error:', err);
            this.connectionStatusSubject$.next('error');
        },
        complete: () => {
            console.log('[WebSocket] Completed');
        },
        });
    }

    sendMessage(message: any): void {
        if (this.socket$) {
        this.socket$.next(message);
        }
    }

    close(): void {
        this.socket$.complete();
    }

}

interface WebSocketMessage {
  type: 'state' | 'system' | 'chat' | 'guess_result';
  message?: string;
  card?: string;
  correct?: boolean;
  players?: any;
}