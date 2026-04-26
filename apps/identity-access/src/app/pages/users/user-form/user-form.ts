import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormHeader, LucideIcon } from '@hishab-nikash/shared-ui';
import {
  CreateUserRequest,
  OrganizationAccess,
  Role,
  UpdateUserRequest,
} from '@hishab-nikash/shared-models';
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
  styleUrl: './user-form.scss',
})
export class UserFormComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly iamService = inject(IAMService);

  readonly editUserId = signal<string | null>(null);
  readonly isEditMode = signal(false);
  readonly isLoadingUser = signal(false);
  readonly availableRoles = signal<Role[]>([]);
  readonly selectedRoleIds = signal<Set<string>>(new Set());
  readonly isLoadingRoles = signal(true);
  readonly organizationAccesses = signal<OrganizationAccess[]>([]);
  readonly isLoadingAccess = signal(false);

  form: CreateUserForm = {
    username: '',
    email: '',
    displayName: '',
    password: '',
    confirmPassword: '',
    tenantId: '',
  };

  isSubmitting = false;
  showPassword = false;
  successMessage = '';
  errorMessage = '';

  constructor() {
    const userId = this.route.snapshot.paramMap.get('id');

    if (userId) {
      this.editUserId.set(userId);
      this.isEditMode.set(true);
      this.isLoadingUser.set(true);
      this.loadUser(userId);
      this.loadOrganizationAccess(userId);
    }

    this.loadRoles();
  }

  get passwordsMatch(): boolean {
    return this.form.password === this.form.confirmPassword;
  }

  get hasRoles(): boolean {
    return this.selectedRoleIds().size > 0;
  }

  toggleRole(roleId: string): void {
    const nextSelection = new Set(this.selectedRoleIds());

    if (nextSelection.has(roleId)) {
      nextSelection.delete(roleId);
    } else {
      nextSelection.add(roleId);
    }

    this.selectedRoleIds.set(nextSelection);
  }

  isRoleSelected(roleId: string): boolean {
    return this.selectedRoleIds().has(roleId);
  }

  organizationAccessLabel(access: OrganizationAccess): string {
    return access.primaryAccess ? 'Primary access' : 'Additional access';
  }

  saveUser(ngForm: NgForm): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!ngForm.valid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

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
          this.successMessage = 'User updated successfully.';
          this.isSubmitting = false;
          setTimeout(() => this.router.navigate(['/iam/users']), 1200);
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Failed to update user.';
          this.isSubmitting = false;
        },
      });

      return;
    }

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
        this.successMessage = 'User created successfully.';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/iam/users']), 1200);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to create user.';
        this.isSubmitting = false;
      },
    });
  }

  private loadUser(userId: string): void {
    this.iamService.getUserById(userId).subscribe({
      next: (user) => {
        this.form.username = user.username ?? '';
        this.form.email = user.email;
        this.form.displayName = user.displayName;
        this.form.tenantId = user.tenantId;
        this.form.password = '';
        this.form.confirmPassword = '';
        this.selectedRoleIds.set(new Set(user.roles.map((role) => role.id)));
        this.isLoadingUser.set(false);
      },
      error: () => {
        this.errorMessage = 'Could not load user data.';
        this.isLoadingUser.set(false);
      },
    });
  }

  private loadRoles(): void {
    this.iamService.getRoles().subscribe({
      next: (roles) => {
        this.availableRoles.set(roles);
        this.isLoadingRoles.set(false);
      },
      error: () => {
        this.isLoadingRoles.set(false);
      },
    });
  }

  private loadOrganizationAccess(userId: string): void {
    this.isLoadingAccess.set(true);

    this.iamService.getOrganizationAccess(userId).subscribe({
      next: (accesses) => {
        this.organizationAccesses.set(accesses);
        this.isLoadingAccess.set(false);
      },
      error: () => {
        this.isLoadingAccess.set(false);
      },
    });
  }
}
