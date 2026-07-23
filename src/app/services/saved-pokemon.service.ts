import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private baseUrl = `${environment.apiUrl}/saved-pokemons`;

  getSavedPokemons(): Observable<SavedPokemonData[]> {
    return this.http.get<SavedPokemonData[]>(this.baseUrl);
  }

  getSavedPokemonById(id: number): Observable<SavedPokemonData> {
    return this.http.get<SavedPokemonData>(`${this.baseUrl}/${id}`);
  }

  savePokemon(data: Partial<SavedPokemonData>): Observable<SavedPokemonData> {
    return this.http.post<SavedPokemonData>(this.baseUrl, data);
  }

  updateSavedPokemon(id: number, data: Partial<SavedPokemonData>): Observable<SavedPokemonData> {
    return this.http.put<SavedPokemonData>(`${this.baseUrl}/${id}`, data);
  }

  deleteSavedPokemon(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
