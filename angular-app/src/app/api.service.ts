import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:6060';
  private weatherUpdatesSocket!: WebSocketSubject<any>; 
  constructor(private http: HttpClient) {}

  registerUser(user: any) {
    return this.http.post(`${this.baseUrl}/users`, user);
  }

  loginUser(credentials: any) {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }

  subscribeUser(username: string, location: string) {
    return this.http.post(`${this.baseUrl}/subscribe`, { username, location });
  }

  unsubscribeUser(username: string) {
    return this.http.post(`${this.baseUrl}/unsubscribe`, { username });
  }

  getWeatherUpdates(): Observable<any> {
    if (!this.weatherUpdatesSocket || this.weatherUpdatesSocket.closed) {
      this.weatherUpdatesSocket = new WebSocketSubject<any>({
        url: 'ws://localhost:6060/notifications',
        openObserver: {
          next: () => console.log('WebSocket connection opened.'),
        },
        closeObserver: {
          next: () => console.log('WebSocket connection closed.'),
        },
      });
    }
    return this.weatherUpdatesSocket.asObservable();
  }
}
