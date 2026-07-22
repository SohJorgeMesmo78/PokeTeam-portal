import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  readonly toasts = signal<ToastMessage[]>([]);

  show(type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string, duration: number = 4000): void {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, message, title, duration };
    
    this.toasts.set([...this.toasts(), toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(message: string, title: string = 'Sucesso'): void {
    this.show('success', message, title);
  }

  error(message: string, title: string = 'Erro'): void {
    this.show('error', message, title);
  }

  warning(message: string, title: string = 'Atenção'): void {
    this.show('warning', message, title);
  }

  info(message: string, title: string = 'Informação'): void {
    this.show('info', message, title);
  }

  remove(id: string): void {
    this.toasts.set(this.toasts().filter(t => t.id !== id));
  }
}
