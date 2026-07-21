import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface TeamMemberData {
  id?: number;
  slotPosition: number;
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
}

export interface TeamData {
  id?: number;
  name: string;
  gameVersion?: string | null;
  createdAt?: string;
  updatedAt?: string;
  members: TeamMemberData[];
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = 'http://localhost:3000/api/teams';

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.token();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getTeams(): Observable<TeamData[]> {
    return this.http.get<TeamData[]>(this.baseUrl, { headers: this.getAuthHeaders() });
  }

  getTeamById(id: number): Observable<TeamData> {
    return this.http.get<TeamData>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  createTeam(teamData: Partial<TeamData>): Observable<TeamData> {
    return this.http.post<TeamData>(this.baseUrl, teamData, { headers: this.getAuthHeaders() });
  }

  updateTeam(id: number, teamData: Partial<TeamData>): Observable<TeamData> {
    return this.http.put<TeamData>(`${this.baseUrl}/${id}`, teamData, { headers: this.getAuthHeaders() });
  }

  deleteTeam(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
