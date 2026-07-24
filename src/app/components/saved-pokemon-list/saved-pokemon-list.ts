import { Component, OnInit, signal, inject, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SavedPokemonService, SavedPokemonData } from '../../services/saved-pokemon.service';
import { TeamService, TeamData, TeamMemberData } from '../../services/team.service';
import { PokeApiService } from '../../services/poke-api.service';
import { ToastService } from '../../services/toast.service';
import { POKEMON_NATURES, PokemonNature } from '../../data/natures.data';
import { PokemonDetail } from '../../models/pokemon.model';

export interface ImportItem {
  member: TeamMemberData;
  nickname: string;
  isExactDuplicate: boolean;
  duplicateCount: number;
}

@Component({
  selector: 'app-saved-pokemon-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './saved-pokemon-list.html',
  styleUrl: './saved-pokemon-list.scss'
})
export class SavedPokemonListComponent implements OnInit {
  private savedPokemonService = inject(SavedPokemonService);
  private teamService = inject(TeamService);
  private pokeApiService = inject(PokeApiService);
  private toastService = inject(ToastService);

  @ViewChild('moveSearchInput') moveSearchInputRef?: ElementRef<HTMLInputElement>;

  savedPokemons = signal<SavedPokemonData[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Available Pokémon list for Picker Modal with Filters & Infinite Scroll
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

  // Modal 1: Select Pokémon from Pokédex
  showPokemonPickerModal = signal<boolean>(false);

  // Modal 2: Pokémon Customization Modal
  showCustomizeModal = signal<boolean>(false);
  editingSavedId = signal<number | null>(null);
  editingMember = signal<SavedPokemonData | null>(null);
  inspectingPokemonDetails = signal<PokemonDetail | null>(null);
  loadingMemberDetails = signal<boolean>(false);

  // Modal 3: Duplicate Nickname Prompt Modal
  showDuplicateNameModal = signal<boolean>(false);
  duplicateSuggestedName = signal<string>('');

  // Modal 4: Moves Picker Modal
  showMovePickerModal = signal<boolean>(false);
  activeMoveSlotIndex = signal<number | null>(null);
  movePickerTab = signal<string>('levelUp');
  movePickerSearch = signal<string>('');
  selectedPreviewMove = signal<any | null>(null);
  highlightedMoveIndex = signal<number>(-1);

  // Modal 5: Generic Info Detail Modal
  showInfoDetailModal = signal<boolean>(false);
  infoModalType = signal<'move' | 'ability'>('move');
  infoModalData = signal<any | null>(null);

  // Modal 6: Import Pokémon from Team Modal (3 Steps)
  showImportModal = signal<boolean>(false);
  importStep = signal<number>(1); // 1 = Select Team, 2 = Select Members, 3 = Confirm Nicknames
  userTeams = signal<TeamData[]>([]);
  loadingTeams = signal<boolean>(false);
  selectedTeamForImport = signal<TeamData | null>(null);
  selectedMemberIndexes = signal<number[]>([]);
  importItems = signal<ImportItem[]>([]);

  readonly naturesList: PokemonNature[] = POKEMON_NATURES;
  movesCache = signal<Record<string, any>>({});

  ngOnInit(): void {
    this.loadSavedPokemons();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showInfoDetailModal()) {
      this.closeInfoDetailModal();
    } else if (this.showMovePickerModal()) {
      this.closeMovePickerModal();
    } else if (this.showDuplicateNameModal()) {
      this.closeDuplicateNameModal();
    } else if (this.showCustomizeModal()) {
      this.closeCustomizeModal();
    } else if (this.showPokemonPickerModal()) {
      this.closePokemonPickerModal();
    } else if (this.showImportModal()) {
      this.closeImportModal();
    }
  }

  loadSavedPokemons(): void {
    this.loading.set(true);
    this.savedPokemonService.getSavedPokemons().subscribe({
      next: (data) => {
        this.savedPokemons.set(data);
        this.loading.set(false);
        this.prefetchMovesForSavedPokemons(data);
      },
      error: (err) => {
        const errorMsg = err?.error?.error || 'Erro ao carregar Pokémon salvos.';
        this.error.set(errorMsg);
        this.toastService.error(errorMsg);
        this.loading.set(false);
      }
    });
  }

  private prefetchMovesForSavedPokemons(list: SavedPokemonData[]): void {
    const moveNamesToFetch = new Set<string>();

    list.forEach(p => {
      [p.move1, p.move2, p.move3, p.move4].forEach(mName => {
        if (mName && !this.movesCache()[mName.toLowerCase().trim()]) {
          moveNamesToFetch.add(mName.toLowerCase().trim());
        }
      });
    });

    moveNamesToFetch.forEach(moveName => {
      this.pokeApiService.getMoveDetails(moveName).subscribe({
        next: (fullMove) => {
          this.registerMoveInCache(fullMove);
        }
      });
    });
  }

  // NICKNAME UNIQUENESS & AUTO-SUGGESTION LOGIC
  getUniqueNicknameSuggestion(baseName: string, ignoreId?: number | null): string {
    const clean = baseName.trim();
    if (!clean) return 'Pokémon';

    const existing = this.savedPokemons().filter(p => p.id !== ignoreId);
    const existsExact = existing.some(p => (p.nickname || p.pokemonName).toLowerCase() === clean.toLowerCase());

    if (!existsExact) {
      return clean;
    }

    let counter = 2;
    let candidate = `${clean} #${counter}`;
    while (existing.some(p => (p.nickname || p.pokemonName).toLowerCase() === candidate.toLowerCase())) {
      counter++;
      candidate = `${clean} #${counter}`;
    }
    return candidate;
  }

  openCreateModal(): void {
    this.editingSavedId.set(null);
    this.showPokemonPickerModal.set(true);
    this.fetchAvailablePokemons(false);
  }

  closePokemonPickerModal(): void {
    this.showPokemonPickerModal.set(false);
  }

  fetchAvailablePokemons(append: boolean = false): void {
    if (!append) {
      this.availableOffset.set(0);
    }

    this.loadingAvailable.set(true);
    const typeArr = this.selectedType() ? [this.selectedType()] : [];

    this.pokeApiService
      .getPokemonsWithFilters(
        this.availableOffset(),
        this.availableLimit,
        this.searchQuery(),
        typeArr,
        [],
        '',
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

  onSelectPokemonFromList(pokemon: PokemonDetail): void {
    this.closePokemonPickerModal();

    const suggestedNickname = this.getUniqueNicknameSuggestion(pokemon.name);

    const defaultMember: SavedPokemonData = {
      pokemonId: pokemon.id,
      pokemonName: pokemon.name,
      nickname: suggestedNickname,
      spriteUrl: pokemon.spriteUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
      types: pokemon.types.map(t => t.type.name),
      nature: 'Hardy',
      abilityName: pokemon.abilities[0]?.ability?.name || null,
      move1: null,
      move2: null,
      move3: null,
      move4: null
    };

    this.editingSavedId.set(null);
    this.editingMember.set(defaultMember);
    this.openCustomizeModalForMember(pokemon.id);
  }

  editSavedPokemon(saved: SavedPokemonData, event?: Event): void {
    if (event) event.stopPropagation();
    this.editingSavedId.set(saved.id || null);
    this.editingMember.set({ ...saved });
    this.openCustomizeModalForMember(saved.pokemonId);
  }

  deleteSavedPokemon(saved: SavedPokemonData, event?: Event): void {
    if (event) event.stopPropagation();
    if (!saved.id) return;
    if (confirm(`Tem certeza de que deseja excluir "${saved.nickname || saved.pokemonName}" dos seus Pokémon salvos?`)) {
      this.savedPokemonService.deleteSavedPokemon(saved.id).subscribe({
        next: () => {
          this.toastService.success('Pokémon excluído com sucesso!');
          this.loadSavedPokemons();
        },
        error: (err) => {
          this.toastService.error(err?.error?.error || 'Erro ao excluir Pokémon.');
        }
      });
    }
  }

  openCustomizeModalForMember(pokemonId: number): void {
    this.showCustomizeModal.set(true);
    this.loadingMemberDetails.set(true);

    this.pokeApiService.getPokemonDetails(pokemonId).subscribe({
      next: (details) => {
        this.inspectingPokemonDetails.set(details);

        // Pre-register all pokemon moves in movesCache
        if (details && details.moves) {
          const allMoves: any[] = [
            ...(details.moves.levelUp || []),
            ...(details.moves.tm || []),
            ...(details.moves.egg || []),
            ...(details.moves.tutor || [])
          ];
          allMoves.forEach(m => this.registerMoveInCache(m));
        }

        const member = this.editingMember();
        if (member && !member.abilityName && details.abilities && details.abilities.length > 0) {
          this.editingMember.set({
            ...member,
            abilityName: details.abilities[0].ability.name
          });
        }

        this.loadingMemberDetails.set(false);
      },
      error: () => {
        this.toastService.error('Erro ao carregar detalhes do Pokémon.');
        this.loadingMemberDetails.set(false);
      }
    });
  }

  closeCustomizeModal(): void {
    this.showCustomizeModal.set(false);
    this.editingSavedId.set(null);
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

    const currentTab = this.movePickerTab();
    const currentList = movesObj[currentTab] || [];
    const currentMatches = currentList.filter((m: any) =>
      m.name.toLowerCase().includes(search) || (m.type && m.type.toLowerCase().includes(search))
    );

    if (currentMatches.length === 0) {
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

  onSavedPokemonSearchEnter(event: Event): void {
    event.preventDefault();
    const list = this.savedPokemons();
    if (list.length === 1 && list[0]) {
      this.editSavedPokemon(list[0]);
    }
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

  getFilteredMovesForTab(): any[] {
    const movesObj = this.inspectingPokemonDetails()?.moves;
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
    if (details && details.moves) {
      const allMoves: any[] = [
        ...(details.moves.levelUp || []),
        ...(details.moves.tm || []),
        ...(details.moves.egg || []),
        ...(details.moves.tutor || [])
      ];
      const match = allMoves.find(m => m.name.toLowerCase() === key);
      if (match) {
        this.registerMoveInCache(match);
        return match;
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

  // SAVE CUSTOMIZED POKÉMON WITH NICKNAME UNICITY CHECK
  saveCustomizedPokemon(): void {
    const member = this.editingMember();
    if (!member) return;

    const nickname = (member.nickname || member.pokemonName).trim();
    const editingId = this.editingSavedId();

    const isDuplicate = this.savedPokemons().some(p =>
      p.id !== editingId && (p.nickname || p.pokemonName).toLowerCase() === nickname.toLowerCase()
    );

    if (isDuplicate) {
      const suggested = this.getUniqueNicknameSuggestion(member.pokemonName, editingId);
      this.duplicateSuggestedName.set(suggested);
      this.showDuplicateNameModal.set(true);
      return;
    }

    this.executeSavePokemon(member, editingId);
  }

  confirmDuplicateNameChange(): void {
    const member = this.editingMember();
    if (!member) return;

    const newName = this.duplicateSuggestedName().trim();
    if (!newName) {
      this.toastService.warning('Por favor, informe um nome válido.');
      return;
    }

    const updated = {
      ...member,
      nickname: newName
    };
    this.editingMember.set(updated);
    this.closeDuplicateNameModal();
    this.executeSavePokemon(updated, this.editingSavedId());
  }

  closeDuplicateNameModal(): void {
    this.showDuplicateNameModal.set(false);
  }

  private executeSavePokemon(member: SavedPokemonData, savedId?: number | null): void {
    if (savedId) {
      this.savedPokemonService.updateSavedPokemon(savedId, member).subscribe({
        next: () => {
          this.toastService.success('Pokémon atualizado com sucesso!');
          this.closeCustomizeModal();
          this.loadSavedPokemons();
        },
        error: (err) => {
          this.toastService.error(err?.error?.error || 'Erro ao atualizar Pokémon.');
        }
      });
    } else {
      this.savedPokemonService.savePokemon(member).subscribe({
        next: () => {
          this.toastService.success('Pokémon salvo com sucesso!');
          this.closeCustomizeModal();
          this.loadSavedPokemons();
        },
        error: (err) => {
          this.toastService.error(err?.error?.error || 'Erro ao salvar Pokémon.');
        }
      });
    }
  }

  // IMPORT POKÉMON FROM TEAM MODAL LOGIC
  openImportModal(): void {
    this.showImportModal.set(true);
    this.importStep.set(1);
    this.selectedTeamForImport.set(null);
    this.selectedMemberIndexes.set([]);
    this.importItems.set([]);

    this.loadingTeams.set(true);
    this.teamService.getTeams().subscribe({
      next: (teams) => {
        this.userTeams.set(teams);
        this.loadingTeams.set(false);
      },
      error: () => {
        this.toastService.error('Erro ao carregar times para importação.');
        this.loadingTeams.set(false);
      }
    });
  }

  closeImportModal(): void {
    this.showImportModal.set(false);
    this.importStep.set(1);
    this.selectedTeamForImport.set(null);
    this.selectedMemberIndexes.set([]);
    this.importItems.set([]);
  }

  selectTeamForImport(team: TeamData): void {
    this.selectedTeamForImport.set(team);
    this.selectedMemberIndexes.set([]);
    this.importStep.set(2);
  }

  toggleMemberSelection(slotIdx: number): void {
    const current = [...this.selectedMemberIndexes()];
    const idx = current.indexOf(slotIdx);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(slotIdx);
    }
    this.selectedMemberIndexes.set(current);
  }

  isMemberSelected(slotIdx: number): boolean {
    return this.selectedMemberIndexes().includes(slotIdx);
  }

  goToImportStep3(): void {
    const team = this.selectedTeamForImport();
    if (!team || !team.members) return;

    const selectedMembers = team.members.filter(m => this.selectedMemberIndexes().includes(m.slotPosition - 1));
    if (selectedMembers.length === 0) {
      this.toastService.warning('Selecione pelo menos 1 Pokémon do time para importar.');
      return;
    }

    const items: ImportItem[] = selectedMembers.map(m => {
      const defaultName = `${m.pokemonName} #${team.name}`;
      
      const existingIdentical = this.savedPokemons().filter(sp =>
        sp.pokemonId === m.pokemonId &&
        sp.nature === m.nature &&
        sp.abilityName === m.abilityName &&
        sp.move1 === m.move1 &&
        sp.move2 === m.move2 &&
        sp.move3 === m.move3 &&
        sp.move4 === m.move4
      );

      const isExact = existingIdentical.length > 0;
      const dupCount = existingIdentical.length;

      const suggestedNickname = this.getUniqueNicknameSuggestion(defaultName);

      return {
        member: m,
        nickname: suggestedNickname,
        isExactDuplicate: isExact,
        duplicateCount: dupCount
      };
    });

    this.importItems.set(items);
    this.importStep.set(3);
  }

  confirmImportAll(): void {
    const items = this.importItems();
    if (!items.length) return;

    let savedCount = 0;
    const total = items.length;

    items.forEach(item => {
      const payload: Partial<SavedPokemonData> = {
        pokemonId: item.member.pokemonId,
        pokemonName: item.member.pokemonName,
        nickname: item.nickname,
        spriteUrl: item.member.spriteUrl,
        types: item.member.types,
        nature: item.member.nature,
        abilityName: item.member.abilityName,
        move1: item.member.move1,
        move2: item.member.move2,
        move3: item.member.move3,
        move4: item.member.move4
      };

      this.savedPokemonService.savePokemon(payload).subscribe({
        next: () => {
          savedCount++;
          if (savedCount === total) {
            this.toastService.success(`${total} Pokémon importado(s) com sucesso!`);
            this.closeImportModal();
            this.loadSavedPokemons();
          }
        },
        error: () => {
          savedCount++;
          if (savedCount === total) {
            this.toastService.warning('Alguns Pokémon não puderam ser importados.');
            this.closeImportModal();
            this.loadSavedPokemons();
          }
        }
      });
    });
  }

  getNatureDescription(natureName?: string | null): string {
    if (!natureName) return '';
    const nat = this.naturesList.find(n => n.name === natureName);
    return nat ? nat.descriptionPt : natureName;
  }
}
