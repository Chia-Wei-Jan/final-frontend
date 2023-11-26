import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';


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

  getArticlesByUsername(username: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/articles/${username}`, { withCredentials: true });
  }

  // POST a new article and return updated list
  addArticle(articleData: { title: string, text: string, image?: string | null }): Observable<any> {
    return this.http.post(`${this.baseUrl}/article`, articleData, { withCredentials: true });
  }

  // PUT to update an existing article
  updateArticle(articleId: string, updatedData: { text: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/articles/${articleId}`, updatedData, { withCredentials: true });
  }

  addComment(postId: string, commentData: { text: string; commentId: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/articles/${postId}`, commentData, { withCredentials: true });
  } 

  updateComment(articleId: string, commentData: { text: string, commentId: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/articles/${articleId}`, commentData, { withCredentials: true });
  }
}
