import { Component, HostListener, inject } from '@angular/core';
import { RouterModule, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConfigModalComponent } from './components/config-modal/config-modal.component';
import { ToastContainerComponent } from './components/toast-container/toast-container';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, RouterLink, RouterLinkActive, ConfigModalComponent, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  public authService = inject(AuthService);
  showConfigModal = false;

  openConfigModal(): void {
    this.showConfigModal = true;
  }

  closeConfigModal(): void {
    this.showConfigModal = false;
  }

  logout(): void {
    this.authService.logout();
  }

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/avatars/boy/a.png';
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showConfigModal) {
      this.closeConfigModal();
    }
  }
}
