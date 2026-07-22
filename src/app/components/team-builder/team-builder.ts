import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TeamService, TeamData } from '../../services/team.service';
import { PokeApiService, GameVersionItem } from '../../services/poke-api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-team-builder',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './team-builder.html',
  styleUrl: './team-builder.scss'
})
export class TeamBuilderComponent implements OnInit {
  private router = inject(Router);
  private teamService = inject(TeamService);
  private pokeApiService = inject(PokeApiService);
  public authService = inject(AuthService);

  teams = signal<TeamData[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  availableGames = signal<GameVersionItem[]>([]);

  ngOnInit(): void {
    this.loadUserTeams();
    this.loadGames();
  }

  loadUserTeams(): void {
    this.loading.set(true);
    this.error.set(null);
    this.teamService.getTeams().subscribe({
      next: (res) => {
        this.teams.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.error || 'Erro ao carregar os seus times.');
        this.loading.set(false);
      }
    });
  }

  loadGames(): void {
    this.pokeApiService.getGames().subscribe({
      next: (games) => {
        this.availableGames.set(games);
      }
    });
  }

  createNewTeam(): void {
    this.router.navigate(['/team-builder/new']);
  }

  editTeam(team: TeamData): void {
    if (team.id) {
      this.router.navigate(['/team-builder/edit', team.id]);
    }
  }

  deleteTeam(team: TeamData, event?: Event): void {
    if (event) event.stopPropagation();
    if (!team.id) return;
    if (confirm(`Tem certeza de que deseja excluir o time "${team.name}"?`)) {
      this.teamService.deleteTeam(team.id).subscribe({
        next: () => {
          this.loadUserTeams();
        },
        error: (err) => {
          alert(err?.error?.error || 'Erro ao excluir o time.');
        }
      });
    }
  }

  getGameName(gameId: string | null | undefined): string {
    if (!gameId || gameId === 'geral') return 'Geral (Todos os Pokémon)';
    const g = this.availableGames().find(item => item.id === gameId);
    return g ? g.name : gameId;
  }
}
