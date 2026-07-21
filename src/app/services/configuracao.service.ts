import { Injectable, signal, computed, effect } from '@angular/core';

export interface PreferenciasTraducao {
  traduzirTudo: boolean;
  traduzirDescricao: boolean;
}

const STORAGE_KEY_TUDO = 'poketeam_pref_traduzir_tudo';
const STORAGE_KEY_DESCRICAO = 'poketeam_pref_traduzir_descricao';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracaoService {
  // Signals para gerenciar estado reativo de tradução
  private _traduzirTudo = signal<boolean>(this.carregarDoStorage(STORAGE_KEY_TUDO, false));
  private _traduzirDescricao = signal<boolean>(this.carregarDoStorage(STORAGE_KEY_DESCRICAO, true));

  // Exposição pública somente leitura dos signals
  readonly traduzirTudo = this._traduzirTudo.asReadonly();
  readonly traduzirDescricao = this._traduzirDescricao.asReadonly();

  // Signal computado para facilitar verificação se deve traduzir descrições (qualquer um ativo)
  readonly deveTraduzirDescricao = computed(() => this._traduzirTudo() || this._traduzirDescricao());

  constructor() {
    // Efeito para sincronizar automaticamente com localStorage
    effect(() => {
      this.salvarNoStorage(STORAGE_KEY_TUDO, this._traduzirTudo());
    });

    effect(() => {
      this.salvarNoStorage(STORAGE_KEY_DESCRICAO, this._traduzirDescricao());
    });
  }

  /**
   * Atualiza e persiste as preferências de tradução do usuário
   */
  salvarPreferencias(pref: PreferenciasTraducao): void {
    this._traduzirTudo.set(pref.traduzirTudo);
    this._traduzirDescricao.set(pref.traduzirDescricao);
  }

  /**
   * Helpers para carregar dados com segurança do SSR / Browser LocalStorage
   */
  private carregarDoStorage(key: string, defaultValue: boolean): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue;
    }
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : defaultValue;
  }

  private salvarNoStorage(key: string, value: boolean): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
}
