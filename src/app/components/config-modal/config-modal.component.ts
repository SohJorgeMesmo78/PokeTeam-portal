import { Component, OnInit, Output, EventEmitter, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfiguracaoService } from '../../services/configuracao.service';

@Component({
  selector: 'app-config-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './config-modal.component.html',
  styleUrl: './config-modal.component.scss'
})
export class ConfigModalComponent implements OnInit {
  private configService = inject(ConfiguracaoService);

  @Output() closeModal = new EventEmitter<void>();

  // Form Signals internos para alteração antes de salvar
  traduzirTudo = signal<boolean>(false);
  traduzirDescricao = signal<boolean>(true);

  ngOnInit(): void {
    this.traduzirTudo.set(this.configService.traduzirTudo());
    this.traduzirDescricao.set(this.configService.traduzirDescricao());
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.fechar();
  }

  toggleTraduzirTudo(val: boolean): void {
    this.traduzirTudo.set(val);
    if (val) {
      this.traduzirDescricao.set(true);
    }
  }

  toggleTraduzirDescricao(val: boolean): void {
    this.traduzirDescricao.set(val);
    if (!val) {
      this.traduzirTudo.set(false);
    }
  }

  salvar(): void {
    this.configService.salvarPreferencias({
      traduzirTudo: this.traduzirTudo(),
      traduzirDescricao: this.traduzirDescricao()
    });
    this.fechar();
  }

  fechar(): void {
    this.closeModal.emit();
  }
}
