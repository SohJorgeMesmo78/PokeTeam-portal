import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss'
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  remove(id: string): void {
    this.toastService.remove(id);
  }
}
