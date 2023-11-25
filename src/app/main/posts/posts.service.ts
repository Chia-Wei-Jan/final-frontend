import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { mergeMap, toArray } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private baseUrl: string = 'http://localhost:3000';

  constructor(private http: HttpClient) { 
  }

  private saveToLocalStorage(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private getFromLocalStorage(key: string): any {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : null;
  }

  // GET articles of the logged-in user
  getArticles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/articles`, { withCredentials: true });
  }

  // GET a specific article by id
  getArticleById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/articles/${id}`, { withCredentials: true });
  }

  // POST a new article and return updated list
  addArticle(articleData: { title: string, text: string, image?: string | null }): Observable<any> {
    return this.http.post(`${this.baseUrl}/article`, articleData, { withCredentials: true });
  }

  // PUT to update an existing article
  updateArticle(id: string, articleData: { text: string, commentId?: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/articles/${id}`, articleData, { withCredentials: true });
  }
}
