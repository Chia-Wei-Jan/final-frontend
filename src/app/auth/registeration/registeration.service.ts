import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class RegisterationService {
  private baseUrl: string = 'http://localhost:3000'; 

  constructor(private http: HttpClient) { }

  getUser(): Observable<any[]> {
    const storedUsers = localStorage.getItem('allUsers');
    if(storedUsers) {
      return of(JSON.parse(storedUsers));
    }
    else {
      return this.http.get<any[]>(this.baseUrl).pipe(
        tap(users => {
          localStorage.setItem('allUsers', JSON.stringify(users));
        })
      );
    }
  }


  loginUser(username: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { username, password }, { withCredentials: true });
  }

  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData, { withCredentials: true });
  }

  setCurrentUser(user: any): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getCurrentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  updateHeadline(headline: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/headline`, { headline }, { withCredentials: true });
  }


  addFollower(username: string, followerUsername: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/following/${followerUsername}`, null, { withCredentials: true });
  }

  unfollowUser(usernameToUnfollow: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/following/${usernameToUnfollow}`, { withCredentials: true });
  }
  
  getFollowedUsers(username: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/following`, { withCredentials: true });
  }

  logoutUser(): Observable<any> {
    return this.http.put(`${this.baseUrl}/logout`, {}, { withCredentials: true });
  }

  clearCurrentUser(): void {
    localStorage.clear();
    localStorage.removeItem('currentUser');
  }
}
