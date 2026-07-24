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
  selectedAvatar = signal<string>('assets/avatars/boy/a.png');
  avatarGenderTab = signal<'boy' | 'girl'>('boy');
  showAvatarModal = signal<boolean>(false);

  readonly boyAvatars = [
    'assets/avatars/boy/a.png',
    'assets/avatars/boy/red.png',
    'assets/avatars/boy/ash.png',
    'assets/avatars/boy/blue.png',
    'assets/avatars/boy/ethan.png',
    'assets/avatars/boy/brendan.png',
    'assets/avatars/boy/lucas.png',
    'assets/avatars/boy/hilbert.png',
    'assets/avatars/boy/nate.png',
    'assets/avatars/boy/calem.png',
    'assets/avatars/boy/elio.png',
    'assets/avatars/boy/victor.png',
    'assets/avatars/boy/florian.png',
    'assets/avatars/boy/rei.png',
    'assets/avatars/boy/silver.png',
    'assets/avatars/boy/rocket.png',
    'assets/avatars/boy/magma.png',
    'assets/avatars/boy/aqua.png',
  ];

  readonly girlAvatars = [
    'assets/avatars/girl/a.png',
    'assets/avatars/girl/leaf.png',
    'assets/avatars/girl/misty.png',
    'assets/avatars/girl/lyra.png',
    'assets/avatars/girl/may.png',
    'assets/avatars/girl/dawn.png',
    'assets/avatars/girl/hilda.png',
    'assets/avatars/girl/rosa.png',
    'assets/avatars/girl/serena.png',
    'assets/avatars/girl/selene.png',
    'assets/avatars/girl/gloria.png',
    'assets/avatars/girl/juliana.png',
    'assets/avatars/girl/rocket.png',
    'assets/avatars/girl/magma.png',
    'assets/avatars/girl/aqua.png',
  ];

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

  selectAvatar(avatarPath: string): void {
    this.selectedAvatar.set(avatarPath);
  }

  setGenderTab(gender: 'boy' | 'girl'): void {
    this.avatarGenderTab.set(gender);
    if (this.selectedAvatar().endsWith('/a.png')) {
      this.selectedAvatar.set(`assets/avatars/${gender}/a.png`);
    }
  }

  openAvatarModal(): void {
    this.showAvatarModal.set(true);
  }

  closeAvatarModal(): void {
    this.showAvatarModal.set(false);
  }

  selectAvatarAndClose(av: string): void {
    this.selectedAvatar.set(av);
    this.showAvatarModal.set(false);
  }

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
      this.password(),
      this.selectedAvatar()
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
