import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PokeApiService } from '../../services/poke-api.service';
import { PokemonDetail, PokemonSpecies } from '../../models/pokemon.model';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card';
import { PokemonDetailModalComponent } from '../pokemon-detail-modal/pokemon-detail-modal';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PokemonCardComponent,
    PokemonDetailModalComponent
  ],
  templateUrl: './pokemon-list.html',
  styleUrl: './pokemon-list.scss'
})
export class PokemonListComponent implements OnInit {
  private pokeApiService = inject(PokeApiService);

  pokemonList = signal<PokemonDetail[]>([]);
  loading = signal<boolean>(true);
  loadingMore = signal<boolean>(false);
  
  searchQuery = signal<string>('');
  selectedType = signal<string>('');
  availableTypes = signal<string[]>([]);

  selectedPokemon = signal<PokemonDetail | null>(null);
  selectedSpecies = signal<PokemonSpecies | null>(null);
  loadingModal = signal<boolean>(false);

  offset = 0;
  readonly limit = 24;
  hasMore = signal<boolean>(true);
  searchError = signal<string | null>(null);

  // Computed filtered list based on search query
  filteredPokemon = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const list = this.pokemonList();

    if (!query) return list;

    return list.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.id.toString() === query || 
      `#${p.id.toString().padStart(4, '0')}`.includes(query)
    );
  });

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading.set(true);
    this.pokeApiService.getTypes().subscribe({
      next: (res) => {
        const types = res.results
          .map(t => t.name)
          .filter(t => t !== 'unknown' && t !== 'shadow');
        this.availableTypes.set(types);
      }
    });

    this.fetchPokemonBatch(0, true);
  }

  fetchPokemonBatch(offset: number, isInitial: boolean = false): void {
    if (isInitial) {
      this.loading.set(true);
    } else {
      this.loadingMore.set(true);
    }

    this.pokeApiService.getPokemonList(offset, this.limit).subscribe({
      next: (res) => {
        if (!res.next) {
          this.hasMore.set(false);
        }
        const names = res.results.map(r => r.name);
        this.pokeApiService.getMultiplePokemonDetails(names).subscribe({
          next: (details) => {
            if (isInitial) {
              this.pokemonList.set(details);
              this.loading.set(false);
            } else {
              this.pokemonList.update(current => [...current, ...details]);
              this.loadingMore.set(false);
            }
          },
          error: () => {
            this.loading.set(false);
            this.loadingMore.set(false);
          }
        });
      },
      error: () => {
        this.loading.set(false);
        this.loadingMore.set(false);
      }
    });
  }

  loadMore(): void {
    if (this.loadingMore() || !this.hasMore() || this.selectedType()) return;
    this.offset += this.limit;
    this.fetchPokemonBatch(this.offset, false);
  }

  filterByType(type: string): void {
    if (this.selectedType() === type) {
      // Clear filter
      this.selectedType.set('');
      this.offset = 0;
      this.hasMore.set(true);
      this.fetchPokemonBatch(0, true);
      return;
    }

    this.selectedType.set(type);
    this.loading.set(true);
    this.searchError.set(null);

    this.pokeApiService.getPokemonByType(type).subscribe({
      next: (names) => {
        // Fetch details for the first 30 pokemon of this type
        const slicedNames = names.slice(0, 36);
        this.pokeApiService.getMultiplePokemonDetails(slicedNames).subscribe({
          next: (details) => {
            this.pokemonList.set(details);
            this.loading.set(false);
            this.hasMore.set(false);
          },
          error: () => this.loading.set(false)
        });
      },
      error: () => this.loading.set(false)
    });
  }

  clearTypeFilter(): void {
    this.selectedType.set('');
    this.offset = 0;
    this.hasMore.set(true);
    this.fetchPokemonBatch(0, true);
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.searchError.set(null);

    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return;

    // Check if matching pokemon is already loaded
    const foundLocal = this.pokemonList().some(
      p => p.name.toLowerCase() === trimmed || p.id.toString() === trimmed
    );

    // If not found in loaded list and user typed exact name/id, attempt direct API search
    if (!foundLocal && trimmed.length >= 2 && !this.selectedType()) {
      this.pokeApiService.getPokemonDetails(trimmed).subscribe({
        next: (detail) => {
          if (!this.pokemonList().some(p => p.id === detail.id)) {
            this.pokemonList.update(current => [detail, ...current]);
          }
        },
        error: () => {
          // Silent catch for live typing search
        }
      });
    }
  }

  openPokemonDetail(pokemon: PokemonDetail): void {
    this.selectedPokemon.set(pokemon);
    this.selectedSpecies.set(null);
    this.loadingModal.set(true);

    this.pokeApiService.getPokemonSpecies(pokemon.id).subscribe({
      next: (species) => {
        this.selectedSpecies.set(species);
        this.loadingModal.set(false);
      },
      error: () => {
        this.loadingModal.set(false);
      }
    });
  }

  closeModal(): void {
    this.selectedPokemon.set(null);
    this.selectedSpecies.set(null);
  }
}
