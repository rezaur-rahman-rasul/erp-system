import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormHeader, LucideIcon } from '@hishab-nikash/shared-ui';
import {
  CreateRoleRequest,
  PermissionDefinition,
  Role,
  UpdateRoleRequest,
} from '@hishab-nikash/shared-models';
import { IAMService } from '../../../services/iam.service';

interface RoleFormValue {
  code: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FormHeader, LucideIcon],
  templateUrl: './role-form.html',
  styleUrl: './role-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleFormComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly iamService = inject(IAMService);

  readonly editRoleId = signal<string | null>(null);
  readonly isEditMode = signal(false);
  readonly isLoadingRole = signal(false);
  readonly permissions = signal<string[]>([]);
  readonly permissionCatalog = signal<PermissionDefinition[]>([]);
  readonly isLoadingCatalog = signal(true);

  readonly catalogSuggestions = computed(() =>
    this.permissionCatalog()
      .filter((permission) => !this.permissions().includes(permission.code))
      .slice(0, 10)
  );

  readonly serviceCount = computed(
    () => new Set(this.permissionCatalog().map((permission) => permission.service)).size
  );

  form: RoleFormValue = {
    code: '',
    name: '',
    description: '',
  };

  permissionInput = '';
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor() {
    this.loadPermissionCatalog();

    const roleId = this.route.snapshot.paramMap.get('id');

    if (!roleId) {
      return;
    }

    this.editRoleId.set(roleId);
    this.isEditMode.set(true);
    this.isLoadingRole.set(true);
    this.loadRole(roleId);
  }

  get hasPermissions(): boolean {
    return this.permissions().length > 0;
  }

  get descriptionLength(): number {
    return this.form.description.trim().length;
  }

  saveRole(ngForm: NgForm): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!ngForm.valid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    if (!this.hasPermissions) {
      this.errorMessage = 'Please add at least one permission.';
      return;
    }

    this.isSubmitting = true;
    const payload = this.buildPayload();

    if (this.isEditMode()) {
      const roleId = this.editRoleId();

      if (!roleId) {
        this.errorMessage = 'Missing role id for update.';
        this.isSubmitting = false;
        return;
      }

      this.iamService.updateRole(roleId, payload).subscribe({
        next: () => {
          this.successMessage = 'Role updated successfully.';
          this.isSubmitting = false;
          setTimeout(() => this.router.navigate(['/iam/roles']), 1200);
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Failed to update role.';
          this.isSubmitting = false;
        },
      });

      return;
    }

    this.iamService.createRole(payload).subscribe({
      next: () => {
        this.successMessage = 'Role created successfully.';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/iam/roles']), 1200);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to create role.';
        this.isSubmitting = false;
      },
    });
  }

  addPermission(): void {
    const tokens = this.extractPermissionTokens(this.permissionInput);
    this.permissionInput = '';

    if (tokens.length === 0) {
      return;
    }

    const nextPermissions = new Set(this.permissions());
    tokens.forEach((permission) => nextPermissions.add(permission));
    this.permissions.set(Array.from(nextPermissions));
  }

  addCatalogPermission(permissionCode: string): void {
    if (this.permissions().includes(permissionCode)) {
      return;
    }

    this.permissions.set([...this.permissions(), permissionCode]);
  }

  removePermission(permission: string): void {
    this.permissions.set(
      this.permissions().filter((currentPermission) => currentPermission !== permission)
    );
  }

  handlePermissionInput(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addPermission();
    }
  }

  onPermissionPaste(event: ClipboardEvent): void {
    const pastedText = event.clipboardData?.getData('text') ?? '';

    if (!pastedText.includes(',') && !pastedText.includes('\n')) {
      return;
    }

    event.preventDefault();
    const nextPermissions = new Set(this.permissions());
    this.extractPermissionTokens(pastedText).forEach((permission) =>
      nextPermissions.add(permission)
    );
    this.permissions.set(Array.from(nextPermissions));
    this.permissionInput = '';
  }

  private loadRole(roleId: string): void {
    this.iamService.getRoleById(roleId).subscribe({
      next: (role) => {
        const normalizedRole = this.normalizeRole(role);
        this.form.code = normalizedRole.code;
        this.form.name = normalizedRole.name;
        this.form.description = normalizedRole.description;
        this.permissions.set(normalizedRole.permissions);
        this.isLoadingRole.set(false);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Could not load role data.';
        this.isLoadingRole.set(false);
      },
    });
  }

  private loadPermissionCatalog(): void {
    this.iamService.getPermissionDefinitions().subscribe({
      next: (catalog) => {
        this.permissionCatalog.set(catalog);
        this.isLoadingCatalog.set(false);
      },
      error: () => {
        this.isLoadingCatalog.set(false);
      },
    });
  }

  private buildPayload(): CreateRoleRequest | UpdateRoleRequest {
    return {
      code: this.form.code.trim(),
      name: this.form.name.trim(),
      description: this.form.description.trim(),
      permissions: this.permissions(),
    };
  }

  private extractPermissionTokens(rawValue: string): string[] {
    return rawValue
      .split(/[\n,]+/)
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
  }

  private normalizeRole(role: Role): Role {
    return {
      ...role,
      code: role.code ?? '',
      description: role.description ?? '',
      permissions: Array.isArray(role.permissions) ? role.permissions : [],
    };
  }
}
