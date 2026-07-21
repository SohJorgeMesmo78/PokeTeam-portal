import { Component, Input, Output, EventEmitter, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PokemonDetail, PokemonSpecies } from '../../models/pokemon.model';

@Component({
  selector: 'app-pokemon-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-detail-modal.html',
  styleUrl: './pokemon-detail-modal.scss'
})
export class PokemonDetailModalComponent {
  private router = inject(Router);

  @Input({ required: true }) pokemon!: PokemonDetail;
  @Input() species: PokemonSpecies | null = null;
  @Output() closeModal = new EventEmitter<void>();

  showShiny = signal<boolean>(false);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  close(): void {
    this.closeModal.emit();
  }

  toggleShiny(): void {
    this.showShiny.update(val => !val);
  }

  goToFullDetails(): void {
    this.close();
    this.router.navigate(['/pokemon', this.pokemon.id]);
  }

  get formattedId(): string {
    return `#${this.pokemon.id.toString().padStart(4, '0')}`;
  }

  get primaryType(): string {
    return this.pokemon.types[0]?.type.name || 'normal';
  }

  get currentArtworkUrl(): string {
    if (this.showShiny()) {
      return (
        this.pokemon.sprites?.front_shiny ||
        (this.pokemon as any).shinySpriteUrl ||
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${this.pokemon.id}.png`
      );
    }
    return this.currentDefaultArtwork;
  }

  private get currentDefaultArtwork(): string {
    return (
      this.pokemon.sprites?.front_default ||
      (this.pokemon as any).spriteUrl ||
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${this.pokemon.id}.png`
    );
  }

  get formattedHeight(): string {
    const meters = this.pokemon.height / 10;
    return `${meters} m`;
  }

  get formattedWeight(): string {
    const kg = this.pokemon.weight / 10;
    return `${kg} kg`;
  }

  get description(): string {
    if (!this.species || !this.species.flavor_text_entries.length) {
      return 'Nenhuma descrição disponível para este Pokémon no momento.';
    }
    const englishOrPt = this.species.flavor_text_entries.find(
      e => e.language.name === 'en' || e.language.name === 'es' || e.language.name === 'pt'
    );
    if (!englishOrPt) return this.species.flavor_text_entries[0].flavor_text.replace(/[\f\n\r]/g, ' ');
    return englishOrPt.flavor_text.replace(/[\f\n\r]/g, ' ');
  }

  getStatName(name: string): string {
    const map: Record<string, string> = {
      'hp': 'HP',
      'attack': 'Ataque',
      'defense': 'Defesa',
      'special-attack': 'Sp. Atk',
      'special-defense': 'Sp. Def',
      'speed': 'Velocidade'
    };
    return map[name] || name;
  }

  getStatPercentage(value: number): number {
    const maxStat = 255;
    return Math.min(Math.round((value / maxStat) * 100), 100);
  }

  getStatBarClass(value: number): string {
    if (value < 50) return 'stat-low';
    if (value < 90) return 'stat-medium';
    if (value < 120) return 'stat-high';
    return 'stat-super';
  }
}
