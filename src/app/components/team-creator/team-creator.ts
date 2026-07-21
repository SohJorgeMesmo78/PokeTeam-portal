import { Component, OnInit, signal, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TeamService, TeamData, TeamMemberData } from '../../services/team.service';
import { PokeApiService, GameVersionItem } from '../../services/poke-api.service';
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

  currentStep = signal<number>(1); // 1 = Select Game, 2 = Build Team & Slots
  editingTeamId = signal<number | null>(null);

  availableGames = signal<GameVersionItem[]>([]);
  userTeams = signal<TeamData[]>([]);

  selectedGame = signal<string>('geral');
  teamNameInput = signal<string>('');
  teamMembers = signal<(TeamMemberData | null)[]>([null, null, null, null, null, null]);

  // Available Pokémon list for Step 2 with Filters & Pagination
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

  // Modal 2: Pokémon Customization Modal (Nickname, Nature, Ability, 4 Moves)
  showCustomizeModal = signal<boolean>(false);
  editingSlotIndex = signal<number | null>(null);
  editingMember = signal<TeamMemberData | null>(null);
  inspectingPokemonDetails = signal<PokemonDetail | null>(null);
  loadingMemberDetails = signal<boolean>(false);

  // Modal 3: Moves Picker Modal (Interactive move picker with tabs & preview card)
  showMovePickerModal = signal<boolean>(false);
  activeMoveSlotIndex = signal<number | null>(null); // 0, 1, 2, 3 for move1..move4
  movePickerTab = signal<string>('levelUp'); // 'levelUp', 'tm', 'egg', 'tutor'
  movePickerSearch = signal<string>('');
  selectedPreviewMove = signal<any | null>(null);

  readonly naturesList: PokemonNature[] = POKEMON_NATURES;

  ngOnInit(): void {
    this.loadGames();
    this.loadUserTeams();

    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.editingTeamId.set(parseInt(id, 10));
        this.loadTeamForEdit(parseInt(id, 10));
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showMovePickerModal()) {
      this.closeMovePickerModal();
    } else if (this.showCustomizeModal()) {
      this.closeCustomizeModal();
    } else if (this.showSlotSelectModal()) {
      this.closeSlotSelectModal();
    }
  }

  loadGames(): void {
    this.pokeApiService.getGames().subscribe({
      next: (games) => {
        this.availableGames.set(games);
      }
    });
  }

  loadUserTeams(): void {
    this.teamService.getTeams().subscribe({
      next: (teams) => {
        this.userTeams.set(teams);
      }
    });
  }

  loadTeamForEdit(teamId: number): void {
    this.teamService.getTeamById(teamId).subscribe({
      next: (team) => {
        this.selectedGame.set(team.gameVersion || 'geral');
        this.teamNameInput.set(team.name);

        const slots: (TeamMemberData | null)[] = [null, null, null, null, null, null];
        (team.members || []).forEach(m => {
          if (m.slotPosition >= 1 && m.slotPosition <= 6) {
            slots[m.slotPosition - 1] = m;
          }
        });
        this.teamMembers.set(slots);
        this.currentStep.set(2);
        this.fetchAvailablePokemons(false);
      }
    });
  }

  // Select Game in Step 1
  selectGame(gameId: string): void {
    this.selectedGame.set(gameId);

    // Auto-generate default team name: "[Nome do Jogo] #[Count + 1]"
    const gameName = this.getGameName(gameId);
    const existingCount = this.userTeams().filter(t => (t.gameVersion || 'geral') === gameId).length;
    
    if (gameId === 'geral') {
      this.teamNameInput.set(`Time #${existingCount + 1}`);
    } else {
      const cleanGameName = gameName.replace('Pokémon ', '');
      this.teamNameInput.set(`${cleanGameName} #${existingCount + 1}`);
    }

    this.currentStep.set(2);
    this.fetchAvailablePokemons(false);
  }

  // Go back to Step 1 from Step 2 with confirmation if choices exist
  goToStep1(): void {
    const hasChosenMembers = this.teamMembers().some(m => m !== null);
    if (hasChosenMembers) {
      if (!confirm('Alterar o jogo irá redefinir suas escolhas atuais de Pokémon. Deseja mesmo continuar?')) {
        return;
      }
    }
    this.teamMembers.set([null, null, null, null, null, null]);
    this.currentStep.set(1);
  }

  // Fetch Available Pokémon with Pagination & Filters
  fetchAvailablePokemons(append: boolean = false): void {
    if (!append) {
      this.availableOffset.set(0);
    }

    this.loadingAvailable.set(true);
    const game = this.selectedGame() === 'geral' ? '' : this.selectedGame();
    const typeArr = this.selectedType() ? [this.selectedType()] : [];

    this.pokeApiService
      .getPokemonsWithFilters(
        this.availableOffset(),
        this.availableLimit,
        this.searchQuery(),
        typeArr,
        [],
        game,
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

  loadMoreAvailable(): void {
    if (this.loadingAvailable() || !this.hasMoreAvailable()) return;
    this.availableOffset.set(this.availableOffset() + this.availableLimit);
    this.fetchAvailablePokemons(true);
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

    // Open Customization Modal for the newly placed member
    this.openCustomizeModal(targetSlotIdx);
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

  getPokemonSpriteUrl(pokemon: any): string {
    return pokemon?.spriteUrl || pokemon?.sprites?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon?.id}.png`;
  }

  // Remove member from slot
  removeMemberFromSlot(slotIdx: number, event?: Event): void {
    if (event) event.stopPropagation();
    const current = [...this.teamMembers()];
    current[slotIdx] = null;
    this.teamMembers.set(current);
  }

  // Open Customization Modal for a slot (0..5)
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
        
        // Auto-select first ability if non-selected
        if (member && !member.abilityName && details.abilities && details.abilities.length > 0) {
          this.editingMember.set({
            ...member,
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

  // MOVES PICKER MODAL METHODS
  openMovePicker(moveSlotIndex: number): void {
    this.activeMoveSlotIndex.set(moveSlotIndex);
    this.movePickerTab.set('levelUp');
    this.movePickerSearch.set('');
    
    // Find current move object if selected
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
  }

  closeMovePickerModal(): void {
    this.showMovePickerModal.set(false);
    this.activeMoveSlotIndex.set(null);
    this.selectedPreviewMove.set(null);
  }

  selectPreviewMove(moveItem: any): void {
    this.selectedPreviewMove.set(moveItem);
  }

  confirmSelectedMove(): void {
    const moveItem = this.selectedPreviewMove();
    const slotIdx = this.activeMoveSlotIndex();
    const member = this.editingMember();

    if (!moveItem || slotIdx === null || !member) return;

    const moveKey = `move${slotIdx + 1}` as 'move1' | 'move2' | 'move3' | 'move4';
    const updatedMember = {
      ...member,
      [moveKey]: moveItem.name
    };

    this.editingMember.set(updatedMember);
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

  saveCustomizedMember(): void {
    const member = this.editingMember();
    const slotIdx = this.editingSlotIndex();
    if (!member || slotIdx === null) return;

    const current = [...this.teamMembers()];
    current[slotIdx] = member;
    this.teamMembers.set(current);

    this.closeCustomizeModal();
  }

  // Save complete team to backend
  saveTeam(): void {
    const name = this.teamNameInput().trim();
    if (!name) {
      alert('Por favor, informe um nome para o seu time.');
      return;
    }

    const filledMembers = this.teamMembers().filter((m): m is TeamMemberData => m !== null);
    if (filledMembers.length === 0) {
      alert('Adicione pelo menos 1 Pokémon ao seu time antes de salvar.');
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
          this.router.navigate(['/team-builder']);
        },
        error: (err) => {
          alert(err?.error?.error || 'Erro ao atualizar o time.');
        }
      });
    } else {
      this.teamService.createTeam(payload).subscribe({
        next: () => {
          this.router.navigate(['/team-builder']);
        },
        error: (err) => {
          alert(err?.error?.error || 'Erro ao salvar o time.');
        }
      });
    }
  }

  getGameName(gameId?: string | null): string {
    if (!gameId || gameId === 'geral') return 'Geral (Todos os Pokémon)';
    const g = this.availableGames().find(item => item.id === gameId);
    return g ? g.name : gameId;
  }

  getNatureDescription(natureName?: string | null): string {
    if (!natureName) return '';
    const nat = this.naturesList.find(n => n.name === natureName);
    return nat ? nat.descriptionPt : natureName;
  }
}
