import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@hishab-nikash/shared-auth';
import { LucideIcon } from '@hishab-nikash/shared-ui';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideIcon],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);

  constructor() {
    const authService = inject(AuthService);
    const router = inject(Router);
    if (authService.isAuthenticated()) {
      console.log('User already authenticated, redirecting to dashboard...');
      router.navigate(['/dashboard']);
    }
  }

  loginForm = this.fb.nonNullable.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    tenantId: ['ERP-DEFAULT', [Validators.required]],
    rememberMe: [false]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { identifier, password, tenantId } = this.loginForm.getRawValue();

    this.authService.login({ identifier, password, tenantId })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          console.log('Login success. Token valid.');
          // Redirecting to the real users list path as per developer feedback
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/iam/users';
          console.log('Navigating to users component at:', returnUrl);
          
          this.router.navigateByUrl(returnUrl).then(success => {
            if (!success) console.error('Redirect failed. Check if route /iam/users or dashboard is correct.');
          });
        },
        error: (err) => {
          console.error('Login Error Block:', err);
          this.errorMessage.set(err.error?.message || 'Login failed. Please check your credentials.');
        }
      });
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }
}
