import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  Branch,
  BusinessUnit,
  CreateBranchRequest,
  LegalEntity,
  UpdateBranchRequest,
} from '@hishab-nikash/shared-models';
import { FormHeader, LucideIcon } from '@hishab-nikash/shared-ui';
import { forkJoin, of } from 'rxjs';
import { OrganizationService } from '../../../../services/organization.service';
import { optionalText, timezoneOptions } from '../../organization.utils';

interface BranchFormModel {
  legalEntityId: string;
  businessUnitId: string;
  code: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
  phone: string;
  email: string;
  timezone: string;
  status: string;
}

@Component({
  selector: 'app-branch-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FormHeader, LucideIcon],
  templateUrl: './branch-form.html',
  styleUrl: './branch-form.scss',
})
export class BranchFormComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly organizationService = inject(OrganizationService);

  readonly editBranchId = signal<string | null>(null);
  readonly isEditMode = signal(false);
  readonly isLoadingBranch = signal(false);
  readonly isLoadingOptions = signal(true);
  readonly legalEntities = signal<LegalEntity[]>([]);
  readonly businessUnits = signal<BusinessUnit[]>([]);
  readonly timezoneOptions = timezoneOptions;

  form: BranchFormModel = {
    legalEntityId: '',
    businessUnitId: '',
    code: '',
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    countryCode: '',
    phone: '',
    email: '',
    timezone: timezoneOptions[0],
    status: 'ACTIVE',
  };

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor() {
    const branchId = this.route.snapshot.paramMap.get('id');

    if (branchId) {
      this.editBranchId.set(branchId);
      this.isEditMode.set(true);
      this.isLoadingBranch.set(true);
    }

    this.loadOptionsAndRecord(branchId);
  }

  saveBranch(ngForm: NgForm): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!ngForm.valid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode()) {
      const updatePayload: UpdateBranchRequest = {
        businessUnitId: optionalText(this.form.businessUnitId) ?? null,
        name: this.form.name.trim(),
        addressLine1: optionalText(this.form.addressLine1),
        addressLine2: optionalText(this.form.addressLine2),
        city: optionalText(this.form.city),
        state: optionalText(this.form.state),
        postalCode: optionalText(this.form.postalCode),
        countryCode: optionalText(this.form.countryCode),
        phone: optionalText(this.form.phone),
        email: optionalText(this.form.email),
        timezone: optionalText(this.form.timezone),
        status: this.form.status,
      };

      this.organizationService.updateBranch(this.editBranchId()!, updatePayload).subscribe({
        next: () => {
          this.successMessage = 'Branch updated successfully.';
          this.isSubmitting = false;
          setTimeout(() => this.router.navigate(['/org/branches']), 1200);
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Failed to update branch.';
          this.isSubmitting = false;
        },
      });

      return;
    }

    const createPayload: CreateBranchRequest = {
      legalEntityId: this.form.legalEntityId,
      businessUnitId: optionalText(this.form.businessUnitId) ?? null,
      code: this.form.code.trim().toUpperCase(),
      name: this.form.name.trim(),
      addressLine1: optionalText(this.form.addressLine1),
      addressLine2: optionalText(this.form.addressLine2),
      city: optionalText(this.form.city),
      state: optionalText(this.form.state),
      postalCode: optionalText(this.form.postalCode),
      countryCode: optionalText(this.form.countryCode),
      phone: optionalText(this.form.phone),
      email: optionalText(this.form.email),
      timezone: optionalText(this.form.timezone),
    };

    this.organizationService.createBranch(createPayload).subscribe({
      next: () => {
        this.successMessage = 'Branch created successfully.';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/org/branches']), 1200);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to create branch.';
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

  selectedBusinessUnitName(): string {
    if (!this.form.businessUnitId) {
      return 'Not linked';
    }

    return (
      this.businessUnits().find((unit) => unit.id === this.form.businessUnitId)?.name ||
      'Unit not found'
    );
  }

  private loadOptionsAndRecord(branchId: string | null): void {
    forkJoin({
      legalEntities: this.organizationService.getAllLegalEntities(),
      businessUnits: this.organizationService.getAllBusinessUnits(),
      branch: branchId
        ? this.organizationService.getBranchById(branchId)
        : of<Branch | null>(null),
    }).subscribe({
      next: ({ legalEntities, businessUnits, branch }) => {
        this.legalEntities.set(legalEntities);
        this.businessUnits.set(businessUnits);

        if (branch) {
          this.form = {
            legalEntityId: branch.legalEntityId,
            businessUnitId: branch.businessUnitId ?? '',
            code: branch.code,
            name: branch.name,
            addressLine1: branch.addressLine1 ?? '',
            addressLine2: branch.addressLine2 ?? '',
            city: branch.city ?? '',
            state: branch.state ?? '',
            postalCode: branch.postalCode ?? '',
            countryCode: branch.countryCode ?? '',
            phone: branch.phone ?? '',
            email: branch.email ?? '',
            timezone: branch.timezone ?? timezoneOptions[0],
            status: branch.status,
          };
          this.isLoadingBranch.set(false);
        }

        this.isLoadingOptions.set(false);
      },
      error: () => {
        this.errorMessage = 'Could not load branch data.';
        this.isLoadingOptions.set(false);
        this.isLoadingBranch.set(false);
      },
    });
  }
}
