import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  signal,
  computed,
  inject,
  ElementRef,
  ViewChild,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { PokeApiService, GameVersionItem } from '../../services/poke-api.service';
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
export class PokemonListComponent implements OnInit, AfterViewInit, OnDestroy {
  private pokeApiService = inject(PokeApiService);

  @ViewChild('scrollSentinel') scrollSentinel?: ElementRef<HTMLDivElement>;

  pokemonList = signal<PokemonDetail[]>([]);
  loading = signal<boolean>(true);
  loadingMore = signal<boolean>(false);

  searchQuery = signal<string>('');
  selectedTypes = signal<string[]>([]);
  selectedGens = signal<number[]>([]);
  selectedGame = signal<string>('');
  filtersCollapsed = signal<boolean>(false);

  // Card Grid density/sizing control ('compact' = ~6/row, 'normal' = ~4/row, 'large' = ~3/row)
  gridDensity = signal<'compact' | 'normal' | 'large'>('compact');

  availableTypes = signal<string[]>([]);
  availableGames = signal<GameVersionItem[]>([]);
  readonly availableGens = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  selectedPokemon = signal<PokemonDetail | null>(null);
  selectedSpecies = signal<PokemonSpecies | null>(null);
  loadingModal = signal<boolean>(false);

  offset = 0;
  readonly limit = 24;
  hasMore = signal<boolean>(true);
  totalCount = signal<number>(0);

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;
  private observer?: IntersectionObserver;
  private lastScrollY = 0;

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.searchQuery().trim()) count++;
    if (this.selectedGame()) count++;
    count += this.selectedTypes().length;
    count += this.selectedGens().length;
    return count;
  });

  selectedGameObj = computed(() => {
    const gameId = this.selectedGame();
    return this.availableGames().find((g) => g.id === gameId) || null;
  });

  ngOnInit(): void {
    this.loadInitialTypes();
    this.loadInitialGames();

    this.searchSub = this.searchSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((query) => {
        this.searchQuery.set(query);
        this.resetAndFetch();
      });

    this.resetAndFetch();
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
    this.observer?.disconnect();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (typeof window === 'undefined') return;
    const currentScrollY = window.scrollY;
    // When scrolling down past 100px, auto-collapse filters panel
    if (currentScrollY > 100 && currentScrollY > this.lastScrollY) {
      if (!this.filtersCollapsed()) {
        this.filtersCollapsed.set(true);
      }
    }
    this.lastScrollY = currentScrollY;
  }

  private setupIntersectionObserver(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && this.hasMore() && !this.loadingMore() && !this.loading()) {
          this.loadMore();
        }
      },
      { rootMargin: '300px' }
    );

    if (this.scrollSentinel?.nativeElement) {
      this.observer.observe(this.scrollSentinel.nativeElement);
    }
  }

  loadInitialTypes(): void {
    this.pokeApiService.getTypes().subscribe({
      next: (res) => {
        const types = res.results
          .map((t) => t.name)
          .filter((t) => t !== 'unknown' && t !== 'shadow');
        this.availableTypes.set(types);
      }
    });
  }

  loadInitialGames(): void {
    this.pokeApiService.getGames().subscribe({
      next: (games) => {
        this.availableGames.set(games);
      }
    });
  }

  resetAndFetch(): void {
    this.offset = 0;
    this.loading.set(true);
    this.hasMore.set(true);

    this.pokeApiService
      .getPokemonsWithFilters(
        0,
        this.limit,
        this.searchQuery(),
        this.selectedTypes(),
        this.selectedGens(),
        this.selectedGame()
      )
      .subscribe({
        next: (res) => {
          this.pokemonList.set(res.data);
          this.totalCount.set(res.total);
          this.hasMore.set(res.hasMore);
          this.loading.set(false);
          this.reobserveSentinel();
        },
        error: () => {
          this.loading.set(false);
        }
      });
  }

  loadMore(): void {
    if (this.loadingMore() || !this.hasMore() || this.loading()) return;

    this.loadingMore.set(true);
    this.offset += this.limit;

    this.pokeApiService
      .getPokemonsWithFilters(
        this.offset,
        this.limit,
        this.searchQuery(),
        this.selectedTypes(),
        this.selectedGens(),
        this.selectedGame()
      )
      .subscribe({
        next: (res) => {
          this.pokemonList.update((current) => [...current, ...res.data]);
          this.hasMore.set(res.hasMore);
          this.loadingMore.set(false);
          this.reobserveSentinel();
        },
        error: () => {
          this.loadingMore.set(false);
        }
      });
  }

  private reobserveSentinel(): void {
    setTimeout(() => {
      if (this.observer && this.scrollSentinel?.nativeElement) {
        this.observer.disconnect();
        this.observer.observe(this.scrollSentinel.nativeElement);
      }
    }, 100);
  }

  onSearchInputChange(value: string): void {
    this.searchSubject.next(value);
  }

  onSearchEnter(event: Event): void {
    event.preventDefault();
    const list = this.pokemonList();
    if (list.length === 1 && list[0]) {
      this.openPokemonDetail(list[0]);
    }
  }

  toggleTypeFilter(type: string): void {
    const current = [...this.selectedTypes()];
    const index = current.indexOf(type);

    if (index >= 0) {
      current.splice(index, 1);
    } else {
      if (current.length >= 2) {
        current.shift(); // Max 2 types allowed
      }
      current.push(type);
    }

    this.selectedTypes.set(current);
    this.resetAndFetch();
  }

  toggleGenFilter(gen: number): void {
    const current = [...this.selectedGens()];
    const index = current.indexOf(gen);

    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(gen);
    }

    this.selectedGens.set(current);
    this.resetAndFetch();
  }

  selectGameFilter(gameId: string): void {
    if (this.selectedGame() === gameId) {
      this.selectedGame.set('');
    } else {
      this.selectedGame.set(gameId);
    }
    this.resetAndFetch();
  }

  toggleFiltersCollapse(): void {
    this.filtersCollapsed.update((val) => !val);
  }

  setGridDensity(density: 'compact' | 'normal' | 'large'): void {
    this.gridDensity.set(density);
  }

  clearAllFilters(): void {
    this.searchQuery.set('');
    this.selectedTypes.set([]);
    this.selectedGens.set([]);
    this.selectedGame.set('');
    this.resetAndFetch();
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
