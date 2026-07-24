import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { PokeApiService } from '../../services/poke-api.service';
import { PokemonDetail } from '../../models/pokemon.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  public authService = inject(AuthService);
  private pokeApiService = inject(PokeApiService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  currentUser = computed(() => this.authService.currentUser());

  usernameInput = signal<string>('');
  selectedAvatar = signal<string>('assets/avatars/boy/a.png');
  avatarGenderTab = signal<'boy' | 'girl'>('boy');
  showAvatarModal = signal<boolean>(false);

  // Pokémon Favorito State & Infinite Scroll Search
  selectedFavPokemonId = signal<number | null>(null);
  selectedFavPokemonName = signal<string | null>(null);
  selectedFavPokemonSprite = signal<string | null>(null);
  selectedFavPokemonHeight = signal<number | null>(null);
  
  showPokemonModal = signal<boolean>(false);
  pokemonSearchQuery = signal<string>('');
  searchResults = signal<PokemonDetail[]>([]);
  loadingPokemons = signal<boolean>(false);
  loadingMorePokemons = signal<boolean>(false);
  hasMorePokemons = signal<boolean>(true);

  private pokemonOffset = 0;
  private readonly pokemonLimit = 24;
  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  saving = signal<boolean>(false);
  checkingUsername = signal<boolean>(false);
  isUsernameAvailable = signal<boolean | null>(null);
  usernameError = signal<string | null>(null);

  readonly boyAvatars = [
    'assets/avatars/boy/a.png',
    'assets/avatars/boy/red.png',
    'assets/avatars/boy/ash.png',
    'assets/avatars/boy/blue.png',
    'assets/avatars/boy/ethan.png',
    'assets/avatars/boy/brendan.png',
    'assets/avatars/boy/lucas.png',
    'assets/avatars/boy/hilbert.png',
    'assets/avatars/boy/nate.png',
    'assets/avatars/boy/calem.png',
    'assets/avatars/boy/elio.png',
    'assets/avatars/boy/victor.png',
    'assets/avatars/boy/florian.png',
    'assets/avatars/boy/rei.png',
    'assets/avatars/boy/silver.png',
    'assets/avatars/boy/rocket.png',
    'assets/avatars/boy/magma.png',
    'assets/avatars/boy/aqua.png',
  ];

  readonly girlAvatars = [
    'assets/avatars/girl/a.png',
    'assets/avatars/girl/leaf.png',
    'assets/avatars/girl/misty.png',
    'assets/avatars/girl/lyra.png',
    'assets/avatars/girl/may.png',
    'assets/avatars/girl/dawn.png',
    'assets/avatars/girl/hilda.png',
    'assets/avatars/girl/rosa.png',
    'assets/avatars/girl/serena.png',
    'assets/avatars/girl/selene.png',
    'assets/avatars/girl/gloria.png',
    'assets/avatars/girl/juliana.png',
    'assets/avatars/girl/rocket.png',
    'assets/avatars/girl/magma.png',
    'assets/avatars/girl/aqua.png',
  ];

  isUsernameChanged = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    return this.usernameInput().trim().toLowerCase() !== user.username.toLowerCase();
  });

  isAvatarChanged = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    return (user.avatarUrl || 'assets/avatars/boy/a.png') !== this.selectedAvatar();
  });

  isFavoritePokemonChanged = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    return (user.favoritePokemonId || null) !== this.selectedFavPokemonId();
  });

  isSaveDisabled = computed(() => {
    if (this.saving()) return true;
    if (this.checkingUsername()) return true;

    const avatarHasChanged = this.isAvatarChanged();
    const usernameHasChanged = this.isUsernameChanged();
    const favHasChanged = this.isFavoritePokemonChanged();

    if (!avatarHasChanged && !usernameHasChanged && !favHasChanged) return true;

    if (usernameHasChanged) {
      if (this.usernameInput().trim().length < 3) return true;
      if (this.isUsernameAvailable() === false) return true;
    }

    return false;
  });

  ngOnInit(): void {
    const user = this.currentUser();
    if (user) {
      this.usernameInput.set(user.username);
      this.selectedAvatar.set(user.avatarUrl || 'assets/avatars/boy/a.png');
      this.selectedFavPokemonId.set(user.favoritePokemonId || null);
      this.selectedFavPokemonName.set(user.favoritePokemonName || null);
      this.selectedFavPokemonHeight.set(user.favoritePokemonHeight || null);

      if (user.favoritePokemonId) {
        this.selectedFavPokemonSprite.set(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${user.favoritePokemonId}.png`);
      } else {
        this.selectedFavPokemonSprite.set(null);
      }

      if (user.avatarUrl && user.avatarUrl.includes('/girl/')) {
        this.avatarGenderTab.set('girl');
      } else {
        this.avatarGenderTab.set('boy');
      }
    }

    // Configura a pesquisa debounced (350ms) exatamente como na Pokédex
    this.searchSub = this.searchSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((query) => {
        this.pokemonSearchQuery.set(query);
        this.resetAndSearchPokemons();
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  onUsernameInput(val: string): void {
    this.usernameInput.set(val);
    const clean = val.trim().toLowerCase();
    const user = this.currentUser();

    if (!user || clean === user.username.toLowerCase()) {
      this.isUsernameAvailable.set(null);
      this.usernameError.set(null);
      return;
    }

    if (clean.length < 3) {
      this.isUsernameAvailable.set(false);
      this.usernameError.set('O nome de usuário deve ter pelo menos 3 caracteres.');
      return;
    }

    this.checkingUsername.set(true);
    this.usernameError.set(null);

    this.authService.checkUsername(clean).subscribe({
      next: (res) => {
        this.checkingUsername.set(false);
        this.isUsernameAvailable.set(res.available);
        if (!res.available) {
          this.usernameError.set('Este nome de usuário já está em uso por outro treinador.');
        }
      },
      error: () => {
        this.checkingUsername.set(false);
      }
    });
  }

  openAvatarModal(): void {
    this.showAvatarModal.set(true);
  }

  closeAvatarModal(): void {
    this.showAvatarModal.set(false);
  }

  setGenderTab(gender: 'boy' | 'girl'): void {
    this.avatarGenderTab.set(gender);
  }

  selectAvatarAndClose(av: string): void {
    this.selectedAvatar.set(av);
    this.showAvatarModal.set(false);
  }

  // POKÉMON FAVORITO MODAL & INFINITE SCROLL SEARCH
  openPokemonModal(): void {
    this.showPokemonModal.set(true);
    this.resetAndSearchPokemons();
  }

  closePokemonModal(): void {
    this.showPokemonModal.set(false);
  }

  onPokemonSearchInput(query: string): void {
    this.searchSubject.next(query);
  }

  resetAndSearchPokemons(): void {
    this.pokemonOffset = 0;
    this.loadingPokemons.set(true);
    this.hasMorePokemons.set(true);

    this.pokeApiService
      .getPokemonsWithFilters(0, this.pokemonLimit, this.pokemonSearchQuery())
      .subscribe({
        next: (res) => {
          this.searchResults.set(res.data);
          this.hasMorePokemons.set(res.hasMore);
          this.loadingPokemons.set(false);
        },
        error: () => {
          this.loadingPokemons.set(false);
        }
      });
  }

  loadMorePokemons(): void {
    if (this.loadingMorePokemons() || !this.hasMorePokemons() || this.loadingPokemons()) return;

    this.loadingMorePokemons.set(true);
    this.pokemonOffset += this.pokemonLimit;

    this.pokeApiService
      .getPokemonsWithFilters(this.pokemonOffset, this.pokemonLimit, this.pokemonSearchQuery())
      .subscribe({
        next: (res) => {
          this.searchResults.update((current) => [...current, ...res.data]);
          this.hasMorePokemons.set(res.hasMore);
          this.loadingMorePokemons.set(false);
        },
        error: () => {
          this.loadingMorePokemons.set(false);
        }
      });
  }

  onModalGridScroll(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target) return;

    const threshold = 150;
    const isNearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - threshold;

    if (isNearBottom && this.hasMorePokemons() && !this.loadingMorePokemons() && !this.loadingPokemons()) {
      this.loadMorePokemons();
    }
  }

  selectFavoritePokemon(pk: PokemonDetail): void {
    const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pk.id}.png`;
    this.selectedFavPokemonId.set(pk.id);
    this.selectedFavPokemonName.set(pk.name);
    this.selectedFavPokemonSprite.set(sprite);
    this.selectedFavPokemonHeight.set(pk.height);
    this.showPokemonModal.set(false);
  }

  clearFavoritePokemon(event: Event): void {
    event.stopPropagation();
    this.selectedFavPokemonId.set(null);
    this.selectedFavPokemonName.set(null);
    this.selectedFavPokemonSprite.set(null);
    this.selectedFavPokemonHeight.set(null);
  }

  saveProfile(): void {
    if (this.isSaveDisabled()) return;

    this.saving.set(true);
    const updateData: {
      username?: string;
      avatarUrl?: string;
      favoritePokemonId?: number | null;
      favoritePokemonName?: string | null;
      favoritePokemonSprite?: string | null;
      favoritePokemonHeight?: number | null;
    } = {};

    if (this.isUsernameChanged()) {
      updateData.username = this.usernameInput().trim();
    }

    if (this.isAvatarChanged()) {
      updateData.avatarUrl = this.selectedAvatar();
    }

    if (this.isFavoritePokemonChanged()) {
      const favId = this.selectedFavPokemonId();
      updateData.favoritePokemonId = favId;
      updateData.favoritePokemonName = this.selectedFavPokemonName();
      updateData.favoritePokemonSprite = favId ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${favId}.png` : null;
      updateData.favoritePokemonHeight = this.selectedFavPokemonHeight();
    }

    this.authService.updateProfile(updateData).subscribe({
      next: () => {
        this.saving.set(false);
        this.toastService.success('Perfil atualizado com sucesso!');
        this.isUsernameAvailable.set(null);
      },
      error: (err) => {
        this.saving.set(false);
        this.toastService.error(err.error?.error || 'Erro ao atualizar perfil.');
      }
    });
  }

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/avatars/boy/a.png';
    }
  }
}
