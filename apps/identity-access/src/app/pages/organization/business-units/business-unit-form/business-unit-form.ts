import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  BusinessUnit,
  CreateBusinessUnitRequest,
  LegalEntity,
  UpdateBusinessUnitRequest,
} from '@hishab-nikash/shared-models';
import { FormHeader, LucideIcon } from '@hishab-nikash/shared-ui';
import { forkJoin, of } from 'rxjs';
import { OrganizationService } from '../../../../services/organization.service';
import { optionalText } from '../../organization.utils';

interface BusinessUnitFormModel {
  legalEntityId: string;
  code: string;
  name: string;
  description: string;
  managerEmployeeId: string;
  status: string;
}

@Component({
  selector: 'app-business-unit-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FormHeader, LucideIcon],
  templateUrl: './business-unit-form.html',
  styleUrl: './business-unit-form.scss',
})
export class BusinessUnitFormComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly organizationService = inject(OrganizationService);

  readonly editUnitId = signal<string | null>(null);
  readonly isEditMode = signal(false);
  readonly isLoadingUnit = signal(false);
  readonly isLoadingOptions = signal(true);
  readonly legalEntities = signal<LegalEntity[]>([]);

  form: BusinessUnitFormModel = {
    legalEntityId: '',
    code: '',
    name: '',
    description: '',
    managerEmployeeId: '',
    status: 'ACTIVE',
  };

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor() {
    const unitId = this.route.snapshot.paramMap.get('id');

    if (unitId) {
      this.editUnitId.set(unitId);
      this.isEditMode.set(true);
      this.isLoadingUnit.set(true);
    }

    this.loadOptionsAndRecord(unitId);
  }

  saveUnit(ngForm: NgForm): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!ngForm.valid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode()) {
      const updatePayload: UpdateBusinessUnitRequest = {
        name: this.form.name.trim(),
        description: optionalText(this.form.description),
        managerEmployeeId: optionalText(this.form.managerEmployeeId) ?? null,
        status: this.form.status,
      };

      this.organizationService
        .updateBusinessUnit(this.editUnitId()!, updatePayload)
        .subscribe({
          next: () => {
            this.successMessage = 'Business unit updated successfully.';
            this.isSubmitting = false;
            setTimeout(() => this.router.navigate(['/org/business-units']), 1200);
          },
          error: (error) => {
            this.errorMessage =
              error?.error?.message || 'Failed to update business unit.';
            this.isSubmitting = false;
          },
        });

      return;
    }

    const createPayload: CreateBusinessUnitRequest = {
      legalEntityId: this.form.legalEntityId,
      code: this.form.code.trim().toUpperCase(),
      name: this.form.name.trim(),
      description: optionalText(this.form.description),
      managerEmployeeId: optionalText(this.form.managerEmployeeId) ?? null,
    };

    this.organizationService.createBusinessUnit(createPayload).subscribe({
      next: () => {
        this.successMessage = 'Business unit created successfully.';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/org/business-units']), 1200);
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Failed to create business unit.';
        this.isSubmitting = false;
      },
    });
  }

  private loadOptionsAndRecord(unitId: string | null): void {
    forkJoin({
      legalEntities: this.organizationService.getAllLegalEntities(),
      businessUnit: unitId
        ? this.organizationService.getBusinessUnitById(unitId)
        : of<BusinessUnit | null>(null),
    }).subscribe({
      next: ({ legalEntities, businessUnit }) => {
        this.legalEntities.set(legalEntities);

        if (businessUnit) {
          this.applyUnit(businessUnit);
          this.isLoadingUnit.set(false);
        }

        this.isLoadingOptions.set(false);
      },
      error: () => {
        this.errorMessage = 'Could not load business unit data.';
        this.isLoadingOptions.set(false);
        this.isLoadingUnit.set(false);
      },
    });
  }

  private applyUnit(unit: BusinessUnit): void {
    this.form = {
      legalEntityId: unit.legalEntityId,
      code: unit.code,
      name: unit.name,
      description: unit.description ?? '',
      managerEmployeeId: unit.managerEmployeeId ?? '',
      status: unit.status,
    };
  }

  selectedEntityName(): string {
    return (
      this.legalEntities().find((entity) => entity.id === this.form.legalEntityId)
        ?.legalName || 'Select a legal entity'
    );
  }
}
