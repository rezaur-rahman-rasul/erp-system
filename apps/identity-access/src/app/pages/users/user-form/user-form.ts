import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormHeader, LucideIcon } from '@hishab-nikash/shared-ui';
import { CreateUserRequest, Role, UpdateUserRequest } from '@hishab-nikash/shared-models';
import { IAMService } from '../../../services/iam.service';

interface CreateUserForm {
  username: string;
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
  tenantId: string;
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FormHeader, LucideIcon],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss'
})
export class UserFormComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly iamService = inject(IAMService);

  // Edit mode detection
  readonly editUserId = signal<string | null>(null);
  readonly isEditMode = signal(false);
  readonly isLoadingUser = signal(false);

  // Form model
  form: CreateUserForm = {
    username: '',
    email: '',
    displayName: '',
    password: '',
    confirmPassword: '',
    tenantId: '',
  };

  // Available roles from API
  readonly availableRoles = signal<Role[]>([]);
  readonly selectedRoleIds = signal<Set<string>>(new Set());
  readonly isLoadingRoles = signal(true);

  // UI state
  isSubmitting = false;
  showPassword = false;
  successMessage = '';
  errorMessage = '';

  constructor() {
    // Detect edit mode from route param :id
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.editUserId.set(userId);
      this.isEditMode.set(true);
      this.isLoadingUser.set(true);

      // Load user data to pre-fill form
      this.iamService.getUserById(userId).subscribe({
        next: (user) => {
          this.form.username = user.username ?? '';
          this.form.email = user.email;
          this.form.displayName = user.displayName;
          this.form.tenantId = user.tenantId;
          this.form.password = '';
          this.form.confirmPassword = '';
          // Pre-select assigned roles
          const ids = new Set(user.roles.map(r => r.id));
          this.selectedRoleIds.set(ids);
          this.isLoadingUser.set(false);
        },
        error: () => {
          this.errorMessage = 'Could not load user data.';
          this.isLoadingUser.set(false);
        },
      });
    }

    // Load available roles
    this.iamService.getRoles().subscribe({
      next: (roles) => {
        this.availableRoles.set(roles);
        this.isLoadingRoles.set(false);
      },
      error: () => this.isLoadingRoles.set(false),
    });
  }

  toggleRole(roleId: string): void {
    const current = new Set(this.selectedRoleIds());
    current.has(roleId) ? current.delete(roleId) : current.add(roleId);
    this.selectedRoleIds.set(current);
  }

  isRoleSelected(roleId: string): boolean {
    return this.selectedRoleIds().has(roleId);
  }

  get passwordsMatch(): boolean {
    return this.form.password === this.form.confirmPassword;
  }

  get hasRoles(): boolean {
    return this.selectedRoleIds().size > 0;
  }

  saveUser(ngForm: NgForm): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!ngForm.valid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    // Password only mandatory on create
    if (!this.isEditMode() && !this.passwordsMatch) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (!this.hasRoles) {
      this.errorMessage = 'Please assign at least one role.';
      return;
    }

    this.isSubmitting = true;
    const roleIds = Array.from(this.selectedRoleIds());

    if (this.isEditMode()) {
      const updatePayload: UpdateUserRequest = {
        username: this.form.username,
        email: this.form.email,
        displayName: this.form.displayName,
        tenantId: this.form.tenantId,
        roleIds,
      };

      this.iamService.updateUser(this.editUserId()!, updatePayload).subscribe({
        next: () => {
          this.successMessage = 'User updated successfully!';
          this.isSubmitting = false;
          setTimeout(() => this.router.navigate(['/iam/users']), 1500);
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Failed to update user.';
          this.isSubmitting = false;
        },
      });
    } else {
      const createPayload: CreateUserRequest = {
        username: this.form.username,
        email: this.form.email,
        displayName: this.form.displayName,
        password: this.form.password,
        tenantId: this.form.tenantId,
        roleIds,
      };

      this.iamService.createUser(createPayload).subscribe({
        next: () => {
          this.successMessage = 'User created successfully!';
          this.isSubmitting = false;
          setTimeout(() => this.router.navigate(['/iam/users']), 1500);
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Failed to create user.';
          this.isSubmitting = false;
        },
      });
    }
  }
}
