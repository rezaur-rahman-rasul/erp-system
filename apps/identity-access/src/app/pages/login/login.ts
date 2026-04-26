import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '@hishab-nikash/shared-auth';
import { LucideIcon } from '@hishab-nikash/shared-ui';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideIcon],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  readonly currentYear = new Date().getFullYear();
  readonly workspaceHighlights = [
    {
      title: 'Secure sign-in',
      detail: 'Use your account to sign in and manage your session securely.',
      caption: 'Account access',
    },
    {
      title: 'Users and roles',
      detail: 'Manage people, roles, and account access in one place.',
      caption: 'People setup',
    },
    {
      title: 'Permissions and access',
      detail: 'Review permission options and access areas before making changes.',
      caption: 'Access review',
    },
  ];

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly loginForm = this.fb.nonNullable.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    tenantId: ['ERP-DEFAULT', [Validators.required]],
    rememberMe: [false],
  });

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { identifier, password, tenantId } = this.loginForm.getRawValue();

    this.authService
      .login({ identifier, password, tenantId })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          const returnUrl =
            this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';

          this.router.navigateByUrl(returnUrl);
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.message ||
              'Login failed. Please check your credentials.'
          );
        },
      });
  }

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }
}
