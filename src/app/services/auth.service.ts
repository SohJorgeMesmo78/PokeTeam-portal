import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';

import { environment } from '../../environments/environment';

export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  favoritePokemonId?: number | null;
  favoritePokemonName?: string | null;
  favoritePokemonSprite?: string | null;
  favoritePokemonHeight?: number | null;
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface UpdateProfilePayload {
  username?: string;
  avatarUrl?: string;
  favoritePokemonId?: number | null;
  favoritePokemonName?: string | null;
  favoritePokemonSprite?: string | null;
  favoritePokemonHeight?: number | null;
}

const TOKEN_KEY = 'poketeam_auth_token';
const USER_KEY = 'poketeam_auth_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  private _currentUser = signal<User | null>(this.loadUserFromStorage());
  private _token = signal<string | null>(this.loadTokenFromStorage());

  readonly currentUser = this._currentUser.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isLoggedIn = computed(() => !!this._currentUser() && !!this._token());

  constructor() {
    this.verifyToken();
  }

  register(username: string, email: string, password: string, avatarUrl?: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { username, email, password, avatarUrl }).pipe(
      tap((res) => this.setSession(res.user, res.token))
    );
  }

  login(loginValue: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { login: loginValue, password }).pipe(
      tap((res) => this.setSession(res.user, res.token))
    );
  }

  updateProfile(data: UpdateProfilePayload): Observable<{ message: string; user: User }> {
    const token = this._token();
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    return this.http.put<{ message: string; user: User }>(`${this.apiUrl}/profile`, data, { headers }).pipe(
      tap((res) => {
        if (res && res.user) {
          this._currentUser.set(res.user);
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          }
        }
      }),
      catchError((err) => {
        if (err && (err.status === 404 || err.status === 405)) {
          return this.http.post<{ message: string; user: User }>(`${this.apiUrl}/profile`, data, { headers }).pipe(
            tap((res) => {
              if (res && res.user) {
                this._currentUser.set(res.user);
                if (typeof window !== 'undefined' && window.localStorage) {
                  localStorage.setItem(USER_KEY, JSON.stringify(res.user));
                }
              }
            })
          );
        }
        throw err;
      })
    );
  }

  checkUsername(username: string): Observable<{ available: boolean }> {
    const currentUserId = this._currentUser()?.id;
    const params: any = { username };
    if (currentUserId) params.currentUserId = currentUserId;
    return this.http.get<{ available: boolean }>(`${this.apiUrl}/check-username`, { params });
  }

  logout(): void {
    this._currentUser.set(null);
    this._token.set(null);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this.router.navigate(['/login']);
  }

  private setSession(user: User, token: string): void {
    this._currentUser.set(user);
    this._token.set(token);

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  private verifyToken(): void {
    const token = this.loadTokenFromStorage();
    if (!token) return;

    this.http.get<{ user: User }>(`${this.apiUrl}/me`).pipe(
      catchError((err) => {
        if (err && (err.status === 401 || err.status === 403)) {
          this.logout();
        }
        return of(null);
      })
    ).subscribe((res) => {
      if (res && res.user) {
        this._currentUser.set(res.user);
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        }
      }
    });
  }

  private loadTokenFromStorage(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  private loadUserFromStorage(): User | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    }
    return null;
  }
}
