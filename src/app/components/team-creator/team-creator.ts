import { Component, OnInit, signal, inject, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TeamService, TeamData, TeamMemberData } from '../../services/team.service';
import { PokeApiService, GameVersionItem } from '../../services/poke-api.service';
import { SavedPokemonService, SavedPokemonData } from '../../services/saved-pokemon.service';
import { ToastService } from '../../services/toast.service';
import { POKEMON_NATURES, PokemonNature } from '../../data/natures.data';
import { PokemonDetail } from '../../models/pokemon.model';

@Component({
  selector: 'app-team-creator',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './team-creator.html',
  styleUrl: './team-creator.scss'
})
export class TeamCreatorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private teamService = inject(TeamService);
  private pokeApiService = inject(PokeApiService);
  private savedPokemonService = inject(SavedPokemonService);
  private toastService = inject(ToastService);

  @ViewChild('moveSearchInput') moveSearchInputRef?: ElementRef<HTMLInputElement>;

  currentStep = signal<number>(1); // 1 = Select Game, 2 = Build Team & Slots
  editingTeamId = signal<number | null>(null);

  availableGames = signal<GameVersionItem[]>([]);
  userTeams = signal<TeamData[]>([]);
  userSavedPokemons = signal<SavedPokemonData[]>([]);

  selectedGame = signal<string>('geral');
  teamNameInput = signal<string>('');
  teamMembers = signal<(TeamMemberData | null)[]>([null, null, null, null, null, null]);

  // Available Pokémon list for Step 2 with Filters & Infinite Scroll
  availablePokemons = signal<PokemonDetail[]>([]);
  loadingAvailable = signal<boolean>(false);
  searchQuery = signal<string>('');
  selectedType = signal<string>('');
  fullyEvolvedOnly = signal<boolean>(false);
  availableOffset = signal<number>(0);
  availableLimit = 24;
  hasMoreAvailable = signal<boolean>(true);

  // Available Pokémon Types
  readonly pokemonTypesList: string[] = [
    'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison',
    'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'steel', 'fairy'
  ];

  // Modal 1: Slot Selection Modal (when clicking a Pokémon from available list)
  showSlotSelectModal = signal<boolean>(false);
  pendingPokemon = signal<PokemonDetail | null>(null);

  // Modal 1.5: Saved Pokémon Presets Suggestion Modal
  showSavedPresetModal = signal<boolean>(false);
  matchingSavedPresets = signal<SavedPokemonData[]>([]);
  pendingSlotIndex = signal<number | null>(null);

  // Modal 2: Pokémon Customization Modal (Nickname, Nature, Ability, 4 Moves, Base Stats)
  showCustomizeModal = signal<boolean>(false);
  editingSlotIndex = signal<number | null>(null);
  editingMember = signal<TeamMemberData | null>(null);
  inspectingPokemonDetails = signal<PokemonDetail | null>(null);
  loadingMemberDetails = signal<boolean>(false);

  // Modal 3: Moves Picker Modal
  showMovePickerModal = signal<boolean>(false);
  activeMoveSlotIndex = signal<number | null>(null);
  movePickerTab = signal<string>('levelUp'); // 'levelUp' | 'tm' | 'egg' | 'tutor'
  movePickerSearch = signal<string>('');
  selectedPreviewMove = signal<any | null>(null);
  highlightedMoveIndex = signal<number>(-1);

  // Modal 4: Generic Info Detail Modal
  showInfoDetailModal = signal<boolean>(false);
  infoModalType = signal<'move' | 'ability'>('move');
  infoModalData = signal<any | null>(null);

  readonly naturesList: PokemonNature[] = POKEMON_NATURES;
  movesCache = signal<Record<string, any>>({});

  ngOnInit(): void {
    this.loadInitialData();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showInfoDetailModal()) {
      this.closeInfoDetailModal();
    } else if (this.showMovePickerModal()) {
      this.closeMovePickerModal();
    } else if (this.showSavedPresetModal()) {
      this.closeSavedPresetModal();
    } else if (this.showCustomizeModal()) {
      this.closeCustomizeModal();
    } else if (this.showSlotSelectModal()) {
      this.closeSlotSelectModal();
    }
  }

  loadInitialData(): void {
    this.pokeApiService.getGames().subscribe({
      next: (games: GameVersionItem[]) => this.availableGames.set(games),
      error: () => {}
    });

    this.teamService.getTeams().subscribe({
      next: (teams) => this.userTeams.set(teams),
      error: () => {}
    });

    this.savedPokemonService.getSavedPokemons().subscribe({
      next: (saved) => this.userSavedPokemons.set(saved),
      error: () => {}
    });

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        const teamId = Number(idParam);
        this.editingTeamId.set(teamId);
        this.loadExistingTeam(teamId);
      } else {
        this.currentStep.set(1);
        this.selectedGame.set('geral');
      }
    });
  }

  loadExistingTeam(teamId: number): void {
    this.teamService.getTeamById(teamId).subscribe({
      next: (team) => {
        this.selectedGame.set(team.gameVersion || 'geral');
        this.teamNameInput.set(team.name);
        
        const slots: (TeamMemberData | null)[] = [null, null, null, null, null, null];
        if (team.members) {
          team.members.forEach(m => {
            const idx = m.slotPosition - 1;
            if (idx >= 0 && idx < 6) {
              slots[idx] = m;
              this.prefetchMemberMoves(m);
            }
          });
        }
        this.teamMembers.set(slots);
        this.currentStep.set(2);
        this.fetchAvailablePokemons(false);
      },
      error: (err) => {
        this.toastService.error(err?.error?.error || 'Erro ao carregar o time para edição.');
        this.router.navigate(['/team-builder']);
      }
    });
  }

  private prefetchMemberMoves(member: TeamMemberData): void {
    [member.move1, member.move2, member.move3, member.move4].forEach(mName => {
      if (mName && !this.movesCache()[mName.toLowerCase().trim()]) {
        this.pokeApiService.getMoveDetails(mName).subscribe({
          next: (fullMove) => this.registerMoveInCache(fullMove)
        });
      }
    });
  }

  // Step 1 Game Selection
  selectGame(gameId: string): void {
    this.selectGameVersion(gameId);
    if (this.currentStep() === 1) {
      this.goToStep2();
    }
  }

  selectGameVersion(gameId: string): void {
    if (this.currentStep() === 2 && this.selectedGame() !== gameId) {
      const hasAnyMember = this.teamMembers().some(m => m !== null);
      if (hasAnyMember) {
        if (!confirm('Ao alterar o jogo, você poderá perder Pokémon não disponíveis na Pokédex do novo jogo. Deseja continuar?')) {
          return;
        }
      }
    }

    this.selectedGame.set(gameId);
    if (!this.editingTeamId()) {
      this.suggestDefaultTeamName(gameId);
    }
  }

  goToStep2(): void {
    if (!this.teamNameInput()) {
      this.suggestDefaultTeamName(this.selectedGame());
    }
    this.currentStep.set(2);
    this.fetchAvailablePokemons(false);
  }

  goToStep1(): void {
    this.goToStep1WithWarning();
  }

  goToStep1WithWarning(): void {
    const hasAnyMember = this.teamMembers().some(m => m !== null);
    if (hasAnyMember) {
      if (!confirm('Atenção: Ao voltar para a escolha do jogo, caso altere a versão, suas decisões atuais poderão ser redefinidas. Deseja voltar mesmo assim?')) {
        return;
      }
    }
    this.currentStep.set(1);
  }

  suggestDefaultTeamName(gameId: string): void {
    const existingForGame = this.userTeams().filter(t => (t.gameVersion || 'geral') === gameId);
    const count = existingForGame.length + 1;

    if (gameId === 'geral') {
      this.teamNameInput.set(`Time #${count}`);
    } else {
      const gameObj = this.availableGames().find(g => g.id === gameId);
      const gameLabel = gameObj ? gameObj.name : gameId;
      this.teamNameInput.set(`${gameLabel} #${count}`);
    }
  }

  getGameName(gameId: string | null | undefined): string {
    if (!gameId || gameId === 'geral') return 'Geral (Todos os Pokémon)';
    const g = this.availableGames().find(item => item.id === gameId);
    return g ? g.name : gameId;
  }

  getNatureDescription(natureName?: string | null): string {
    if (!natureName) return '';
    const nat = this.naturesList.find(n => n.name === natureName);
    return nat ? nat.descriptionPt : natureName;
  }

  // Step 2 Available Pokémon list with infinite scroll
  fetchAvailablePokemons(append: boolean = false): void {
    if (!append) {
      this.availableOffset.set(0);
    }

    this.loadingAvailable.set(true);

    const gameFilter = this.selectedGame() === 'geral' ? '' : this.selectedGame();
    const typeArr = this.selectedType() ? [this.selectedType()] : [];

    this.pokeApiService
      .getPokemonsWithFilters(
        this.availableOffset(),
        this.availableLimit,
        this.searchQuery(),
        typeArr,
        [],
        gameFilter,
        this.fullyEvolvedOnly()
      )
      .subscribe({
        next: (res) => {
          if (append) {
            this.availablePokemons.set([...this.availablePokemons(), ...res.data]);
          } else {
            this.availablePokemons.set(res.data);
          }
          this.hasMoreAvailable.set(res.hasMore);
          this.loadingAvailable.set(false);
        },
        error: () => {
          this.loadingAvailable.set(false);
        }
      });
  }

  onAvailableScroll(event: Event): void {
    const element = event.target as HTMLElement;
    if (!element) return;

    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 120) {
      if (!this.loadingAvailable() && this.hasMoreAvailable()) {
        this.availableOffset.set(this.availableOffset() + this.availableLimit);
        this.fetchAvailablePokemons(true);
      }
    }
  }

  onSearchChange(val: string): void {
    this.searchQuery.set(val);
    this.fetchAvailablePokemons(false);
  }

  onTypeFilterChange(type: string): void {
    this.selectedType.set(type === this.selectedType() ? '' : type);
    this.fetchAvailablePokemons(false);
  }

  toggleFullyEvolvedFilter(): void {
    this.fullyEvolvedOnly.set(!this.fullyEvolvedOnly());
    this.fetchAvailablePokemons(false);
  }

  // When user clicks a Pokémon from the available list:
  onSelectPokemonFromList(pokemon: PokemonDetail): void {
    this.pendingPokemon.set(pokemon);
    this.showSlotSelectModal.set(true);
  }

  closeSlotSelectModal(): void {
    this.showSlotSelectModal.set(false);
    this.pendingPokemon.set(null);
  }

  // Assign chosen pending Pokémon to chosen slot (0..5) with Shifting & Replacement rules
  confirmSlotAssignment(targetSlotIdx: number): void {
    const pokemon = this.pendingPokemon();
    if (!pokemon) return;

    const currentSlots = [...this.teamMembers()];
    const isTargetOccupied = currentSlots[targetSlotIdx] !== null;
    const hasAnyEmptySlot = currentSlots.some(m => m === null);

    // Case 1: All 6 slots are full -> Prompt confirmation
    if (isTargetOccupied && !hasAnyEmptySlot) {
      if (!confirm('Deseja mesmo substituir este Pokémon?')) {
        return;
      }
      currentSlots[targetSlotIdx] = this.createDefaultMemberData(pokemon, targetSlotIdx + 1);
    }
    // Case 2: Target slot is occupied, but there is an empty slot -> Shift right!
    else if (isTargetOccupied && hasAnyEmptySlot) {
      let emptyIdx = currentSlots.findIndex((m, idx) => idx > targetSlotIdx && m === null);
      if (emptyIdx === -1) {
        emptyIdx = currentSlots.findIndex(m => m === null);
      }

      if (emptyIdx > targetSlotIdx) {
        for (let i = emptyIdx; i > targetSlotIdx; i--) {
          currentSlots[i] = currentSlots[i - 1];
          if (currentSlots[i]) {
            currentSlots[i]!.slotPosition = i + 1;
          }
        }
      } else {
        for (let i = emptyIdx; i < targetSlotIdx; i++) {
          currentSlots[i] = currentSlots[i + 1];
          if (currentSlots[i]) {
            currentSlots[i]!.slotPosition = i + 1;
          }
        }
      }
      currentSlots[targetSlotIdx] = this.createDefaultMemberData(pokemon, targetSlotIdx + 1);
    } 
    // Case 3: Target slot is empty -> Simply place it!
    else {
      currentSlots[targetSlotIdx] = this.createDefaultMemberData(pokemon, targetSlotIdx + 1);
    }

    this.teamMembers.set(currentSlots);
    this.closeSlotSelectModal();

    // Check if user has saved presets for this Pokémon species!
    const matchingSaved = this.userSavedPokemons().filter(sp => sp.pokemonId === pokemon.id);

    if (matchingSaved.length > 0) {
      this.pendingSlotIndex.set(targetSlotIdx);
      this.matchingSavedPresets.set(matchingSaved);
      this.showSavedPresetModal.set(true);
    } else {
      // Open Customization Modal directly for the newly placed member
      this.openCustomizeModal(targetSlotIdx);
    }
  }

  applySavedPresetToSlot(preset: SavedPokemonData): void {
    const slotIdx = this.pendingSlotIndex();
    if (slotIdx === null) return;

    const current = [...this.teamMembers()];
    const existing = current[slotIdx];
    if (existing) {
      current[slotIdx] = {
        ...existing,
        nickname: preset.nickname || preset.pokemonName,
        nature: preset.nature || 'Hardy',
        abilityName: preset.abilityName || null,
        move1: preset.move1 || null,
        move2: preset.move2 || null,
        move3: preset.move3 || null,
        move4: preset.move4 || null
      };
      this.teamMembers.set(current);
      this.prefetchMemberMoves(current[slotIdx]!);
    }

    this.closeSavedPresetModal();
    this.toastService.success(`Configuração "${preset.nickname || preset.pokemonName}" adicionada ao time!`);
  }

  applyDefaultToSlot(): void {
    const slotIdx = this.pendingSlotIndex();
    this.closeSavedPresetModal();
    if (slotIdx !== null) {
      this.openCustomizeModal(slotIdx);
    }
  }

  closeSavedPresetModal(): void {
    this.showSavedPresetModal.set(false);
    this.pendingSlotIndex.set(null);
    this.matchingSavedPresets.set([]);
  }

  createDefaultMemberData(pokemon: PokemonDetail, slotPos: number): TeamMemberData {
    return {
      slotPosition: slotPos,
      pokemonId: pokemon.id,
      pokemonName: pokemon.name,
      nickname: pokemon.name,
      spriteUrl: this.getPokemonSpriteUrl(pokemon),
      types: pokemon.types.map(t => t.type.name),
      nature: 'Hardy',
      abilityName: pokemon.abilities[0]?.ability?.name || null,
      move1: null,
      move2: null,
      move3: null,
      move4: null
    };
  }

  removeMemberFromSlot(slotIdx: number, event: Event): void {
    event.stopPropagation();
    const current = [...this.teamMembers()];
    current[slotIdx] = null;
    this.teamMembers.set(current);
  }

  openCustomizeModal(slotIdx: number, event?: Event): void {
    if (event) event.stopPropagation();

    const member = this.teamMembers()[slotIdx];
    if (!member) return;

    this.editingSlotIndex.set(slotIdx);
    this.editingMember.set({ ...member });
    this.showCustomizeModal.set(true);
    this.loadingMemberDetails.set(true);

    this.pokeApiService.getPokemonDetails(member.pokemonId).subscribe({
      next: (details) => {
        this.inspectingPokemonDetails.set(details);
        
        if (details && details.moves) {
          const allMoves: any[] = [
            ...(details.moves.levelUp || []),
            ...(details.moves.tm || []),
            ...(details.moves.egg || []),
            ...(details.moves.tutor || [])
          ];
          allMoves.forEach(m => this.registerMoveInCache(m));
        }

        const ed = this.editingMember();
        if (ed && !ed.abilityName && details.abilities && details.abilities.length > 0) {
          this.editingMember.set({
            ...ed,
            abilityName: details.abilities[0].ability.name
          });
        }

        this.loadingMemberDetails.set(false);
      },
      error: () => {
        this.loadingMemberDetails.set(false);
      }
    });
  }

  closeCustomizeModal(): void {
    this.showCustomizeModal.set(false);
    this.editingSlotIndex.set(null);
    this.editingMember.set(null);
    this.inspectingPokemonDetails.set(null);
  }

  selectAbility(abilityName: string): void {
    const member = this.editingMember();
    if (!member) return;
    this.editingMember.set({ ...member, abilityName });
  }

  getNatureStatModifier(statNameKey: string, natureName?: string | null): 'boosted' | 'penalized' | 'neutral' {
    if (!natureName) return 'neutral';
    const nat = this.naturesList.find(n => n.name === natureName);
    if (!nat) return 'neutral';

    const statMap: Record<string, string> = {
      'hp': 'HP',
      'attack': 'Ataque',
      'defense': 'Defesa',
      'special-attack': 'Sp. Atk',
      'special-defense': 'Sp. Def',
      'speed': 'Velocidade'
    };

    const label = statMap[statNameKey];
    if (!label) return 'neutral';

    if (nat.increasedStat === label) return 'boosted';
    if (nat.decreasedStat === label) return 'penalized';
    return 'neutral';
  }

  getStatLabelPt(statKey: string): string {
    const map: Record<string, string> = {
      'hp': 'HP',
      'attack': 'Ataque',
      'defense': 'Defesa',
      'special-attack': 'Sp. Atk',
      'special-defense': 'Sp. Def',
      'speed': 'Velocidade'
    };
    return map[statKey] || statKey;
  }

  openMovePicker(moveSlotIndex: number): void {
    this.activeMoveSlotIndex.set(moveSlotIndex);
    this.movePickerTab.set('levelUp');
    this.movePickerSearch.set('');
    this.highlightedMoveIndex.set(-1);
    
    const member = this.editingMember();
    const moveKey = `move${moveSlotIndex + 1}` as 'move1' | 'move2' | 'move3' | 'move4';
    const currentMoveName = member ? member[moveKey] : null;

    if (currentMoveName && this.inspectingPokemonDetails()?.moves) {
      const allMoves: any[] = [
        ...(this.inspectingPokemonDetails()?.moves.levelUp || []),
        ...(this.inspectingPokemonDetails()?.moves.tm || []),
        ...(this.inspectingPokemonDetails()?.moves.egg || []),
        ...(this.inspectingPokemonDetails()?.moves.tutor || [])
      ];
      const match = allMoves.find(m => m.name === currentMoveName);
      this.selectedPreviewMove.set(match || null);
    } else {
      this.selectedPreviewMove.set(null);
    }

    this.showMovePickerModal.set(true);

    setTimeout(() => {
      this.moveSearchInputRef?.nativeElement?.focus();
    }, 120);
  }

  closeMovePickerModal(): void {
    this.showMovePickerModal.set(false);
    this.activeMoveSlotIndex.set(null);
    this.selectedPreviewMove.set(null);
    this.highlightedMoveIndex.set(-1);
  }

  setMovePickerTab(tab: string): void {
    this.movePickerTab.set(tab);
    this.highlightedMoveIndex.set(-1);
  }

  onMoveSearchChange(val: string): void {
    this.movePickerSearch.set(val);
    this.highlightedMoveIndex.set(-1);

    const search = val.trim().toLowerCase();
    if (!search) {
      this.movePickerTab.set('levelUp');
      return;
    }

    const movesObj = this.inspectingPokemonDetails()?.moves;
    if (!movesObj) return;

    // Check if current tab has matches
    const currentTab = this.movePickerTab();
    const currentList = movesObj[currentTab] || [];
    const currentMatches = currentList.filter((m: any) =>
      m.name.toLowerCase().includes(search) || (m.type && m.type.toLowerCase().includes(search))
    );

    if (currentMatches.length === 0) {
      // Search tabs in priority order: levelUp -> tm -> egg -> tutor
      const tabs: ('levelUp' | 'tm' | 'egg' | 'tutor')[] = ['levelUp', 'tm', 'egg', 'tutor'];
      for (const t of tabs) {
        const list = movesObj[t] || [];
        const matches = list.filter((m: any) =>
          m.name.toLowerCase().includes(search) || (m.type && m.type.toLowerCase().includes(search))
        );
        if (matches.length > 0) {
          this.movePickerTab.set(t);
          break;
        }
      }
    }
  }

  scrollToAvailableSection(): void {
    const element = document.querySelector('.available-section-card');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onPokemonSearchEnter(event: Event): void {
    event.preventDefault();
    const available = this.availablePokemons();
    if (available.length === 1 && available[0]) {
      this.onSelectPokemonFromList(available[0]);
    }
  }

  selectPreviewMove(moveItem: any, index?: number): void {
    if (index !== undefined) {
      this.highlightedMoveIndex.set(index);
    }
    if (this.selectedPreviewMove()?.name === moveItem.name) {
      this.confirmSelectedMove();
      return;
    }
    this.selectedPreviewMove.set(moveItem);
  }

  onMovePickerKeydown(event: KeyboardEvent): void {
    const moves = this.getFilteredMovesForTab();

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (moves.length === 0) return;
      let idx = this.highlightedMoveIndex() + 1;
      if (idx >= moves.length) idx = moves.length - 1;
      this.highlightedMoveIndex.set(idx);
      const move = moves[idx];
      if (move) {
        this.selectedPreviewMove.set(move);
        this.scrollToMoveRow(idx);
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (moves.length === 0) return;
      let idx = this.highlightedMoveIndex() - 1;
      if (idx < 0) idx = 0;
      this.highlightedMoveIndex.set(idx);
      const move = moves[idx];
      if (move) {
        this.selectedPreviewMove.set(move);
        this.scrollToMoveRow(idx);
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const selected = this.selectedPreviewMove();
      if (selected) {
        this.confirmSelectedMove();
      } else if (moves.length === 1 && moves[0]) {
        this.selectedPreviewMove.set(moves[0]);
        this.confirmSelectedMove();
      }
    }
  }

  scrollToMoveRow(index: number): void {
    setTimeout(() => {
      const rows = document.querySelectorAll('.moves-list-col .move-row-item');
      if (rows[index]) {
        rows[index].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }, 10);
  }

  confirmSelectedMove(): void {
    const moveItem = this.selectedPreviewMove();
    const slotIdx = this.activeMoveSlotIndex();
    const member = this.editingMember();

    if (!moveItem || slotIdx === null || !member) return;

    const moveKey = `move${slotIdx + 1}` as 'move1' | 'move2' | 'move3' | 'move4';
    this.editingMember.set({
      ...member,
      [moveKey]: moveItem.name
    });
    this.closeMovePickerModal();
  }

  clearMoveSlot(slotIdx: number, event: Event): void {
    event.stopPropagation();
    const member = this.editingMember();
    if (!member) return;

    const moveKey = `move${slotIdx + 1}` as 'move1' | 'move2' | 'move3' | 'move4';
    this.editingMember.set({
      ...member,
      [moveKey]: null
    });
  }

  private getGenFromGame(gameId: string): number {
    if (!gameId || gameId === 'geral') return 9;

    const clean = gameId.toLowerCase().trim();
    if (['red', 'blue', 'yellow', 'red-blue'].includes(clean)) return 1;
    if (['gold', 'silver', 'crystal', 'gold-silver'].includes(clean)) return 2;
    if (['ruby', 'sapphire', 'emerald', 'firered', 'leafgreen', 'ruby-sapphire', 'firered-leafgreen'].includes(clean)) return 3;
    if (['diamond', 'pearl', 'platinum', 'heartgold', 'soulsilver', 'diamond-pearl', 'heartgold-soulsilver'].includes(clean)) return 4;
    if (['black', 'white', 'black2', 'white2', 'black-white'].includes(clean)) return 5;
    if (['x', 'y', 'omegaruby', 'alphasapphire', 'x-y'].includes(clean)) return 6;
    if (['sun', 'moon', 'ultrasun', 'ultramoon', 'sun-moon'].includes(clean)) return 7;
    if (['sword', 'shield', 'brilliantdiamond', 'shiningpearl', 'sword-shield'].includes(clean)) return 8;
    if (['scarlet', 'violet', 'scarlet-violet'].includes(clean)) return 9;

    return 9;
  }

  getFilteredMovesForTab(): any[] {
    const details = this.inspectingPokemonDetails();
    if (!details) return [];

    const gen = this.getGenFromGame(this.selectedGame());
    const movesObj = (details.movesByGen && details.movesByGen[gen])
      ? details.movesByGen[gen]
      : details.moves;

    if (!movesObj) return [];

    const tab = this.movePickerTab();
    let list: any[] = [];

    if (tab === 'levelUp') list = movesObj.levelUp || [];
    else if (tab === 'tm') list = movesObj.tm || [];
    else if (tab === 'egg') list = movesObj.egg || [];
    else if (tab === 'tutor') list = movesObj.tutor || [];

    const search = this.movePickerSearch().toLowerCase().trim();
    if (search) {
      list = list.filter(m => m.name.toLowerCase().includes(search) || (m.type && m.type.toLowerCase().includes(search)));
    }

    return list;
  }

  registerMoveInCache(moveObj: any): void {
    if (!moveObj || !moveObj.name) return;
    const current = { ...this.movesCache() };
    current[moveObj.name.toLowerCase()] = moveObj;
    this.movesCache.set(current);
  }

  getMoveInfo(moveName?: string | null): any {
    if (!moveName) return null;
    const key = moveName.toLowerCase().trim();
    if (this.movesCache()[key]) {
      return this.movesCache()[key];
    }
    const details = this.inspectingPokemonDetails();
    if (details) {
      const gen = this.getGenFromGame(this.selectedGame());
      const movesObj = (details.movesByGen && details.movesByGen[gen])
        ? details.movesByGen[gen]
        : details.moves;

      if (movesObj) {
        const allMoves: any[] = [
          ...(movesObj.levelUp || []),
          ...(movesObj.tm || []),
          ...(movesObj.egg || []),
          ...(movesObj.tutor || [])
        ];
        const match = allMoves.find(m => m.name.toLowerCase() === key);
        if (match) {
          this.registerMoveInCache(match);
          return match;
        }
      }
    }
    return { name: moveName, type: 'normal', category: 'status', power: null, pp: null, accuracy: null };
  }

  openMoveInfoModal(moveName?: string | null, event?: Event): void {
    if (event) event.stopPropagation();
    if (!moveName) return;

    this.infoModalType.set('move');
    const existing = this.getMoveInfo(moveName);

    if (existing && existing.type && existing.category && existing.descriptionPt) {
      this.infoModalData.set(existing);
      this.showInfoDetailModal.set(true);
    } else {
      this.pokeApiService.getMoveDetails(moveName).subscribe({
        next: (fullMove) => {
          this.registerMoveInCache(fullMove);
          this.infoModalData.set(fullMove);
          this.showInfoDetailModal.set(true);
        },
        error: () => {
          this.infoModalData.set({ name: moveName, descriptionPt: 'Informações do golpe' });
          this.showInfoDetailModal.set(true);
        }
      });
    }
  }

  openAbilityInfoModal(abilityName?: string | null, event?: Event): void {
    if (event) event.stopPropagation();
    if (!abilityName) return;

    this.infoModalType.set('ability');
    const details = this.inspectingPokemonDetails();
    let abilityObj: any = null;

    if (details && details.abilities) {
      const match = details.abilities.find(a => a.ability.name.toLowerCase() === abilityName.toLowerCase());
      if (match) {
        abilityObj = {
          name: match.ability.name,
          is_hidden: match.is_hidden,
          descriptionPt: match.ability.descriptionPt || match.ability.descriptionEn || match.ability.description || 'Sem descrição'
        };
      }
    }

    this.infoModalData.set(abilityObj || { name: abilityName, descriptionPt: 'Informações da habilidade' });
    this.showInfoDetailModal.set(true);
  }

  closeInfoDetailModal(): void {
    this.showInfoDetailModal.set(false);
    this.infoModalData.set(null);
  }

  saveCustomizedMember(): void {
    const slotIdx = this.editingSlotIndex();
    const member = this.editingMember();

    if (slotIdx === null || !member) return;

    const current = [...this.teamMembers()];
    current[slotIdx] = member;
    this.teamMembers.set(current);

    this.closeCustomizeModal();
  }

  saveTeam(): void {
    const name = this.teamNameInput().trim();
    if (!name) {
      this.toastService.warning('Por favor, informe um nome para o seu time.');
      return;
    }

    const filledMembers = this.teamMembers().filter((m): m is TeamMemberData => m !== null);
    if (filledMembers.length === 0) {
      this.toastService.warning('Adicione pelo menos 1 Pokémon ao seu time antes de salvar.');
      return;
    }

    const payloadMembers = filledMembers.map((m, idx) => ({
      ...m,
      slotPosition: idx + 1
    }));

    const payload: Partial<TeamData> = {
      name,
      gameVersion: this.selectedGame() === 'geral' ? null : this.selectedGame(),
      members: payloadMembers
    };

    const editId = this.editingTeamId();
    if (editId) {
      this.teamService.updateTeam(editId, payload).subscribe({
        next: () => {
          this.toastService.success('Time atualizado com sucesso!');
          this.router.navigate(['/team-builder']);
        },
        error: (err) => {
          this.toastService.error(err?.error?.error || 'Erro ao atualizar o time.');
        }
      });
    } else {
      this.teamService.createTeam(payload).subscribe({
        next: () => {
          this.toastService.success('Time criado com sucesso!');
          this.router.navigate(['/team-builder']);
        },
        error: (err) => {
          this.toastService.error(err?.error?.error || 'Erro ao salvar o time.');
        }
      });
    }
  }

  getPokemonSpriteUrl(pokemon: PokemonDetail): string {
    return pokemon.spriteUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
  }
}
