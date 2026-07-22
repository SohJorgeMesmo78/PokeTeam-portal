import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, of, catchError } from 'rxjs';
import {
  PokemonDetail,
  PokemonListResponse,
  PokemonSpecies,
  TypeListResponse
} from '../models/pokemon.model';

export interface ApiPokemonListResponse {
  data: PokemonDetail[];
  total: number;
  offset: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface GameVersionItem {
  id: string;
  name: string;
  gen: number;
  minId: number;
  maxId: number;
}

@Injectable({
  providedIn: 'root'
})
export class PokeApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api';

  /**
   * Fetch Pokémon list with filters (search, multi-type, multi-gen, game version, pagination).
   */
  getPokemonsWithFilters(
    offset: number = 0,
    limit: number = 24,
    search: string = '',
    types: string[] = [],
    gens: number[] = [],
    game: string = '',
    fullyEvolved: boolean = false
  ): Observable<ApiPokemonListResponse> {
    let params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    if (types.length > 0) {
      params = params.set('types', types.join(','));
    }

    if (gens.length > 0) {
      params = params.set('gens', gens.join(','));
    }

    if (game.trim()) {
      params = params.set('game', game.trim());
    }

    if (fullyEvolved) {
      params = params.set('fullyEvolved', 'true');
    }

    return this.http.get<ApiPokemonListResponse>(`${this.baseUrl}/pokemons`, { params });
  }

  /**
   * Legacy wrapper for paginated list.
   */
  getPokemonList(offset: number = 0, limit: number = 24): Observable<PokemonListResponse> {
    return this.getPokemonsWithFilters(offset, limit).pipe(
      map(res => ({
        count: res.total,
        next: res.hasMore ? `${this.baseUrl}/pokemons?offset=${offset + limit}&limit=${limit}` : null,
        previous: offset > 0 ? `${this.baseUrl}/pokemons?offset=${Math.max(0, offset - limit)}&limit=${limit}` : null,
        results: res.data.map(p => ({
          name: p.name,
          url: `${this.baseUrl}/pokemons/${p.id}`
        }))
      }))
    );
  }

  /**
   * Fetch detailed info for a single Pokémon by ID or name from local PokeTeam API.
   */
  getPokemonDetails(nameOrId: string | number): Observable<PokemonDetail> {
    const query = typeof nameOrId === 'string' ? nameOrId.trim().toLowerCase() : nameOrId;
    return this.http.get<PokemonDetail>(`${this.baseUrl}/pokemons/${query}`);
  }

  /**
   * Fetch species details or generate localized info from PokeTeam DB.
   */
  getPokemonSpecies(nameOrId: string | number): Observable<PokemonSpecies | null> {
    const query = typeof nameOrId === 'string' ? nameOrId.trim().toLowerCase() : nameOrId;
    return this.http.get<PokemonDetail>(`${this.baseUrl}/pokemons/${query}`).pipe(
      map(p => ({
        id: p.id,
        name: p.name,
        flavor_text_entries: [
          {
            flavor_text: `${p.name.charAt(0).toUpperCase() + p.name.slice(1)} é um Pokémon armazenado no banco de dados PokeTeamDb local. Possui altura de ${p.height / 10}m e peso de ${p.weight / 10}kg.`,
            language: { name: 'pt', url: '' },
            version: { name: 'poke-team', url: '' }
          }
        ],
        genera: [{ genus: 'Pokémon', language: { name: 'pt' } }],
        is_legendary: false,
        is_mythical: false
      })),
      catchError(() => of(null))
    );
  }

  /**
   * Fetch multiple Pokémon details concurrently by list of names or IDs.
   */
  getMultiplePokemonDetails(namesOrIds: (string | number)[]): Observable<PokemonDetail[]> {
    if (!namesOrIds.length) return of([]);
    const requests = namesOrIds.map(id => this.getPokemonDetails(id).pipe(
      catchError(() => of(null))
    ));
    return forkJoin(requests).pipe(
      map(results => results.filter((p): p is PokemonDetail => p !== null))
    );
  }

  /**
   * Fetch list of all elemental types from local PokeTeam API.
   */
  getTypes(): Observable<TypeListResponse> {
    return this.http.get<string[]>(`${this.baseUrl}/types`).pipe(
      map(types => ({
        count: types.length,
        results: types.map(name => ({ name, url: `${this.baseUrl}/types/${name}` }))
      }))
    );
  }

  /**
   * Fetch list of all game versions.
   */
  getGames(): Observable<GameVersionItem[]> {
    return this.http.get<GameVersionItem[]>(`${this.baseUrl}/games`);
  }

  /**
   * Fetch list of Pokémon belonging to a specific elemental type from local PokeTeam API.
   */
  getPokemonByType(typeName: string): Observable<string[]> {
    return this.http.get<ApiPokemonListResponse>(`${this.baseUrl}/pokemons?type=${typeName.toLowerCase()}&limit=100`).pipe(
      map(res => res.data.map(p => p.name))
    );
  }

  /**
   * Extract numeric ID from a URL.
   */
  extractIdFromUrl(url: string): number {
    const matches = url.match(/\/(\d+)\/?$/);
    return matches ? parseInt(matches[1], 10) : 0;
  }

  /**
   * Get official artwork image URL by ID.
   */
  getOfficialArtworkUrl(id: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }

  /**
   * Fetch detailed info for a single move by name.
   */
  getMoveDetails(moveName: string): Observable<any> {
    const clean = moveName.trim().toLowerCase().replace(/\s+/g, '-');
    return this.http.get<any>(`https://pokeapi.co/api/v2/move/${clean}`).pipe(
      map(mData => {
        const typeName = mData.type?.name || 'normal';
        const category = mData.damage_class?.name || 'status';
        const power = mData.power || null;
        const pp = mData.pp || null;
        const accuracy = mData.accuracy || null;

        const flavorEntry = mData.flavor_text_entries?.find((e: any) => e.language.name === 'en');
        const flavorText = flavorEntry ? flavorEntry.flavor_text.replace(/[\f\n\r]/g, ' ') : '';
        const effectEntry = mData.effect_entries?.find((e: any) => e.language.name === 'en');
        let effectText = effectEntry ? (effectEntry.effect || effectEntry.short_effect || '') : '';

        return {
          id: mData.id,
          name: mData.name,
          type: typeName,
          category,
          power,
          pp,
          accuracy,
          descriptionPt: flavorText || effectText || 'Descrição detalhada do golpe.',
          descriptionEn: flavorText || effectText || 'No description available.'
        };
      }),
      catchError(() => of({ name: moveName, descriptionPt: 'Detalhes do golpe' }))
    );
  }
}
