import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://pfaautowaidbackend.onrender.com/api/users'; // Your backend URL

  private http = inject(HttpClient); // Dependency injection for standalone components

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  getUserDetails(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${email}`);
  }
}
