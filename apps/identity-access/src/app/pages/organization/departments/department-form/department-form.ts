import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  Branch,
  CreateDepartmentRequest,
  Department,
  LegalEntity,
  UpdateDepartmentRequest,
} from '@hishab-nikash/shared-models';
import { FormHeader, LucideIcon } from '@hishab-nikash/shared-ui';
import { forkJoin, of } from 'rxjs';
import { OrganizationService } from '../../../../services/organization.service';
import { optionalText } from '../../organization.utils';

interface DepartmentFormModel {
  legalEntityId: string;
  branchId: string;
  parentDepartmentId: string;
  code: string;
  name: string;
  headEmployeeId: string;
  status: string;
}

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FormHeader, LucideIcon],
  templateUrl: './department-form.html',
  styleUrl: './department-form.scss',
})
export class DepartmentFormComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly organizationService = inject(OrganizationService);

  readonly editDepartmentId = signal<string | null>(null);
  readonly isEditMode = signal(false);
  readonly isLoadingDepartment = signal(false);
  readonly isLoadingOptions = signal(true);
  readonly legalEntities = signal<LegalEntity[]>([]);
  readonly branches = signal<Branch[]>([]);
  readonly departments = signal<Department[]>([]);

  form: DepartmentFormModel = {
    legalEntityId: '',
    branchId: '',
    parentDepartmentId: '',
    code: '',
    name: '',
    headEmployeeId: '',
    status: 'ACTIVE',
  };

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor() {
    const departmentId = this.route.snapshot.paramMap.get('id');

    if (departmentId) {
      this.editDepartmentId.set(departmentId);
      this.isEditMode.set(true);
      this.isLoadingDepartment.set(true);
    }

    this.loadOptionsAndRecord(departmentId);
  }

  saveDepartment(ngForm: NgForm): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!ngForm.valid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode()) {
      const updatePayload: UpdateDepartmentRequest = {
        branchId: optionalText(this.form.branchId) ?? null,
        name: this.form.name.trim(),
        parentDepartmentId: optionalText(this.form.parentDepartmentId) ?? null,
        headEmployeeId: optionalText(this.form.headEmployeeId) ?? null,
        status: this.form.status,
      };

      this.organizationService
        .updateDepartment(this.editDepartmentId()!, updatePayload)
        .subscribe({
          next: () => {
            this.successMessage = 'Department updated successfully.';
            this.isSubmitting = false;
            setTimeout(() => this.router.navigate(['/org/departments']), 1200);
          },
          error: (error) => {
            this.errorMessage =
              error?.error?.message || 'Failed to update department.';
            this.isSubmitting = false;
          },
        });

      return;
    }

    const createPayload: CreateDepartmentRequest = {
      legalEntityId: this.form.legalEntityId,
      branchId: optionalText(this.form.branchId) ?? null,
      parentDepartmentId: optionalText(this.form.parentDepartmentId) ?? null,
      code: this.form.code.trim().toUpperCase(),
      name: this.form.name.trim(),
      headEmployeeId: optionalText(this.form.headEmployeeId) ?? null,
    };

    this.organizationService.createDepartment(createPayload).subscribe({
      next: () => {
        this.successMessage = 'Department created successfully.';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/org/departments']), 1200);
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Failed to create department.';
        this.isSubmitting = false;
      },
    });
  }

  selectedEntityName(): string {
    return (
      this.legalEntities().find((entity) => entity.id === this.form.legalEntityId)
        ?.legalName || 'Select a legal entity'
    );
  }

  selectedBranchName(): string {
    if (!this.form.branchId) {
      return 'Not linked';
    }

    return this.branches().find((branch) => branch.id === this.form.branchId)?.name || 'Branch not found';
  }

  availableParentDepartments(): Department[] {
    return this.departments().filter(
      (department) => department.id !== this.editDepartmentId()
    );
  }

  private loadOptionsAndRecord(departmentId: string | null): void {
    forkJoin({
      legalEntities: this.organizationService.getAllLegalEntities(),
      branches: this.organizationService.getAllBranches(),
      departments: this.organizationService.getAllDepartments(),
      department: departmentId
        ? this.organizationService.getDepartmentById(departmentId)
        : of<Department | null>(null),
    }).subscribe({
      next: ({ legalEntities, branches, departments, department }) => {
        this.legalEntities.set(legalEntities);
        this.branches.set(branches);
        this.departments.set(departments);

        if (department) {
          this.form = {
            legalEntityId: department.legalEntityId,
            branchId: department.branchId ?? '',
            parentDepartmentId: department.parentDepartmentId ?? '',
            code: department.code,
            name: department.name,
            headEmployeeId: department.headEmployeeId ?? '',
            status: department.status,
          };
          this.isLoadingDepartment.set(false);
        }

        this.isLoadingOptions.set(false);
      },
      error: () => {
        this.errorMessage = 'Could not load department data.';
        this.isLoadingOptions.set(false);
        this.isLoadingDepartment.set(false);
      },
    });
  }
}
