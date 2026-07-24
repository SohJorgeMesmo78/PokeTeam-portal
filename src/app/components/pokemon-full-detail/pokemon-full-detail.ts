import { Component, OnInit, signal, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PokeApiService } from '../../services/poke-api.service';
import { ConfiguracaoService } from '../../services/configuracao.service';

@Component({
  selector: 'app-pokemon-full-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pokemon-full-detail.html',
  styleUrl: './pokemon-full-detail.scss'
})
export class PokemonFullDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private pokeApiService = inject(PokeApiService);
  public configService = inject(ConfiguracaoService);

  pokemon = signal<any | null>(null);
  loading = signal<boolean>(true);
  error = signal<boolean>(false);
  showShiny = signal<boolean>(false);
  activeTab = signal<'level' | 'tm' | 'egg' | 'tutor'>('level');
  selectedMove = signal<any | null>(null);
  selectedAbility = signal<any | null>(null);
  selectedGen = signal<number>(1);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const idOrName = params['idOrName'];
      if (idOrName) {
        this.fetchDetails(idOrName);
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.selectedMove()) {
      this.closeMoveDetail();
    } else if (this.selectedAbility()) {
      this.closeAbilityDetail();
    }
  }

  fetchDetails(idOrName: string): void {
    this.loading.set(true);
    this.error.set(false);

    this.pokeApiService.getPokemonDetails(idOrName).subscribe({
      next: (data) => {
        this.pokemon.set(data);
        if (data?.firstGeneration) {
          this.selectedGen.set(data.firstGeneration);
        } else {
          this.selectedGen.set(1);
        }
        this.loading.set(false);
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  get currentGenMoves(): { levelUp: any[]; tm: any[]; egg: any[]; tutor: any[] } {
    const p = this.pokemon();
    if (!p) return { levelUp: [], tm: [], egg: [], tutor: [] };

    const gen = Number(this.selectedGen());
    if (p.movesByGen && p.movesByGen[gen]) {
      return p.movesByGen[gen];
    }
    return p.moves || { levelUp: [], tm: [], egg: [], tutor: [] };
  }

  toggleShiny(): void {
    this.showShiny.update(val => !val);
  }

  setTab(tab: 'level' | 'tm' | 'egg' | 'tutor'): void {
    this.activeTab.set(tab);
  }

  openMoveDetail(move: any): void {
    this.selectedMove.set(move);
  }

  closeMoveDetail(): void {
    this.selectedMove.set(null);
  }

  openAbilityDetail(abilityObj: any): void {
    this.selectedAbility.set(abilityObj);
  }

  closeAbilityDetail(): void {
    this.selectedAbility.set(null);
  }

  getMoveDescription(move: any): string {
    if (!move) return '';
    if (this.configService.deveTraduzirDescricao()) {
      return move.descriptionPt || move.descriptionEn || move.description || 'Sem descrição disponível.';
    }
    return move.descriptionEn || move.description || 'No description available.';
  }

  getAbilityDescription(abilityObj: any): string {
    if (!abilityObj) return '';
    const ab = abilityObj.ability || abilityObj;
    if (this.configService.deveTraduzirDescricao()) {
      return ab.descriptionPt || ab.descriptionEn || ab.description || 'Sem descrição disponível.';
    }
    return ab.descriptionEn || ab.description || 'No description available.';
  }

  getEvolutionMethodText(node: any): string {
    if (!node) return '';
    if (this.configService.deveTraduzirDescricao()) {
      return node.methodPt || node.methodEn || '';
    }
    return node.methodEn || node.methodPt || '';
  }

  getItemSprite(node: any): string | null {
    const item = node?.methodDetails?.item || node?.methodDetails?.heldItem;
    return item?.spriteUrl || null;
  }

  getItemName(node: any): string {
    const item = node?.methodDetails?.item || node?.methodDetails?.heldItem;
    if (!item) return '';
    if (this.configService.deveTraduzirDescricao()) {
      return item.namePt || item.nameEn || item.name;
    }
    return item.nameEn || item.namePt || item.name;
  }

  getCategoryLabel(category: string): string {
    const cat = (category || 'status').toLowerCase();
    if (cat.includes('physical') || cat.includes('físico')) return 'Físico';
    if (cat.includes('special') || cat.includes('especial')) return 'Especial';
    return 'Status';
  }

  getCategoryIconClass(category: string): string {
    const cat = (category || 'status').toLowerCase();
    if (cat.includes('physical') || cat.includes('físico')) return 'ph-bold ph-lightning';
    if (cat.includes('special') || cat.includes('especial')) return 'ph-bold ph-sparkle';
    return 'ph-bold ph-shield-check';
  }

  getCategoryIcon(category: string): string {
    return this.getCategoryLabel(category);
  }

  get currentSprite(): string {
    const p = this.pokemon();
    if (!p) return '';
    if (this.showShiny()) {
      return p.shinySpriteUrl || p.sprites?.front_shiny || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${p.id}.png`;
    }
    return p.spriteUrl || p.sprites?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;
  }

  get primaryType(): string {
    const p = this.pokemon();
    return p?.types[0]?.type?.name || 'normal';
  }

  get formattedId(): string {
    const p = this.pokemon();
    if (!p) return '#0000';
    return `#${p.id.toString().padStart(4, '0')}`;
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
    return Math.min(Math.round((value / 255) * 100), 100);
  }

  getStatBarClass(value: number): string {
    if (value < 50) return 'stat-low';
    if (value < 90) return 'stat-medium';
    if (value < 120) return 'stat-high';
    return 'stat-super';
  }
}
