import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

import { environment } from '../../environments/environment';

export interface SavedPokemonData {
  id?: number;
  pokemonId: number;
  pokemonName: string;
  nickname?: string | null;
  spriteUrl: string;
  types: string[];
  nature?: string | null;
  abilityName?: string | null;
  move1?: string | null;
  move2?: string | null;
  move3?: string | null;
  move4?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SavedPokemonService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = `${environment.apiUrl}/saved-pokemons`;

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.token();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getSavedPokemons(): Observable<SavedPokemonData[]> {
    return this.http.get<SavedPokemonData[]>(this.baseUrl, { headers: this.getAuthHeaders() });
  }

  getSavedPokemonById(id: number): Observable<SavedPokemonData> {
    return this.http.get<SavedPokemonData>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  savePokemon(data: Partial<SavedPokemonData>): Observable<SavedPokemonData> {
    return this.http.post<SavedPokemonData>(this.baseUrl, data, { headers: this.getAuthHeaders() });
  }

  updateSavedPokemon(id: number, data: Partial<SavedPokemonData>): Observable<SavedPokemonData> {
    return this.http.put<SavedPokemonData>(`${this.baseUrl}/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteSavedPokemon(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
