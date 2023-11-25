import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class ProfileService {
  private baseUrl = 'http://localhost:3000';
  constructor(private http: HttpClient) { }

  getCurrentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  getUserHeadline(username: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/headline/${username}`, { withCredentials: true });
  }

  updateHeadline(headline: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/headline`, { headline },{ withCredentials: true });
  }

  
  getUserEmail(username: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/email/${username}`, { withCredentials: true });
  }

  updateUserEmail(email: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/email`, { email }, { withCredentials: true });
  }

  getUserZipcode(username: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/zipcode/${username}`, { withCredentials: true });
  }

  updateUserZipcode(zipcode: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/zipcode`, { zipcode }, { withCredentials: true });
  }

  getUserPhone(username: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/phone/${username}`, { withCredentials: true });
  }
  updateUserPhone(newPhone: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/phone`, { phone: newPhone }, { withCredentials: true });
  }
  
  updateUserPassword(newPassword: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/password`, { password: newPassword }, { withCredentials: true });
  }
}
