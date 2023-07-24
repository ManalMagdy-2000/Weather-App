import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:6060';

  constructor(private http: HttpClient) {}

  registerUser(user: any) {
    return this.http.post(`${this.baseUrl}/users`, user);
  }

  loginUser(credentials: any) {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }
}
