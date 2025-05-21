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

    private baseUrl = 'ws://localhost:8000/ws/party/';
    private room = 'myroom'; // ToDo can be dynamic

    constructor() {}

    connect(): void {
        const url = `${this.baseUrl}${this.room}/`;

        this.socket$ = webSocket({
        url: url,
        deserializer: (e) => JSON.parse(e.data),
        serializer: (value) => JSON.stringify(value),
        openObserver: {
            next: () => {
            console.log('[WebSocket] Connection established');
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
            this.reconnect(); // optional auto-reconnect
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

    reconnect(): void {
        setTimeout(() => {
        console.log('[WebSocket] Reconnecting...');
        this.connect();
        }, 3000);
    }
}

interface WebSocketMessage {
  type: 'state' | 'system' | 'chat' | 'guess_result';
  message?: string;
  card?: string;
  correct?: boolean;
  players?: any;
}