import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  VERSION_COMPARISONS,
  VersionComparisonGroup,
  ExclusivePokemonItem
} from '../../data/game-versions-comparisons.data';

@Component({
  selector: 'app-game-versions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './game-versions.html',
  styleUrl: './game-versions.scss'
})
export class GameVersionsComponent {
  private router = inject(Router);

  comparisons = signal<VersionComparisonGroup[]>(VERSION_COMPARISONS);
  selectedId = signal<string>('red-blue-yellow');

  activeComparison = computed(() => {
    return this.comparisons().find((c) => c.id === this.selectedId()) || this.comparisons()[0];
  });

  selectComparison(id: string): void {
    this.selectedId.set(id);
  }

  openPokemonDetail(pokemonId: number): void {
    this.router.navigate(['/pokemon', pokemonId]);
  }

  onCoverError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
      const parent = img.parentElement;
      if (parent) {
        const fallback = parent.querySelector('.cover-fallback-icon') as HTMLElement;
        if (fallback) fallback.style.display = 'inline-flex';
      }
    }
  }

  // Calculate max length across all games in group (2 or 3 games) and align row by row
  getAlignedRows(group: VersionComparisonGroup): (ExclusivePokemonItem | null)[][] {
    const games = group.games || [];
    if (games.length === 0) return [];

    const maxLen = Math.max(...games.map((g) => g.exclusives.length));
    const rows: (ExclusivePokemonItem | null)[][] = [];

    for (let i = 0; i < maxLen; i++) {
      const row: (ExclusivePokemonItem | null)[] = [];
      for (const game of games) {
        row.push(game.exclusives[i] || null);
      }
      rows.push(row);
    }
    return rows;
  }
}
