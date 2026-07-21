import { Component, HostListener } from '@angular/core';
import { RouterModule, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConfigModalComponent } from './components/config-modal/config-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, RouterLink, RouterLinkActive, ConfigModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  showConfigModal = false;

  openConfigModal(): void {
    this.showConfigModal = true;
  }

  closeConfigModal(): void {
    this.showConfigModal = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showConfigModal) {
      this.closeConfigModal();
    }
  }
}
