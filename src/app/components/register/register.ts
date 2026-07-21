import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = signal<string>('');
  email = signal<string>('');
  password = signal<string>('');
  confirmPassword = signal<string>('');

  showPassword = signal<boolean>(false);
  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Strong Password Checklist Rules
  hasMinLength = computed(() => this.password().length >= 8);
  hasUppercase = computed(() => /[A-Z]/.test(this.password()));
  hasLowercase = computed(() => /[a-z]/.test(this.password()));
  hasNumber = computed(() => /[0-9]/.test(this.password()));
  hasSpecial = computed(() => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.password()));
  passwordsMatch = computed(() => this.password() === this.confirmPassword() && this.password().length > 0);

  isFormValid = computed(() => {
    return (
      this.username().trim().length >= 3 &&
      this.email().trim().includes('@') &&
      this.hasMinLength() &&
      this.hasUppercase() &&
      this.hasLowercase() &&
      this.hasNumber() &&
      this.hasSpecial() &&
      this.passwordsMatch()
    );
  });

  toggleShowPassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMessage.set('Por favor, preencha todos os campos corretamente e respeite as regras de senha forte.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.register(
      this.username().trim(),
      this.email().trim(),
      this.password()
    ).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/pokedex']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.error || 'Erro ao criar conta. Tente novamente.');
      }
    });
  }
}
