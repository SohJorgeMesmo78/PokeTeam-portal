import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonDetail } from '../../models/pokemon.model';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-card.html',
  styleUrl: './pokemon-card.scss'
})
export class PokemonCardComponent {
  @Input({ required: true }) pokemon!: PokemonDetail;
  @Output() cardClick = new EventEmitter<PokemonDetail>();

  get formattedId(): string {
    return `#${this.pokemon.id.toString().padStart(4, '0')}`;
  }

  get primaryType(): string {
    return this.pokemon.types[0]?.type.name || 'normal';
  }

  get artworkUrl(): string {
    return (
      this.pokemon.sprites.other?.['official-artwork']?.front_default ||
      this.pokemon.sprites.other?.home?.front_default ||
      this.pokemon.sprites.front_default ||
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'
    );
  }

  onSelect(): void {
    this.cardClick.emit(this.pokemon);
  }
}
