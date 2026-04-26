import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  CreateLegalEntityRequest,
  UpdateLegalEntityRequest,
} from '@hishab-nikash/shared-models';
import { FormHeader, LucideIcon } from '@hishab-nikash/shared-ui';
import { OrganizationService } from '../../../../services/organization.service';
import { fiscalMonthOptions, optionalText } from '../../organization.utils';

interface LegalEntityFormModel {
  code: string;
  legalName: string;
  tradeName: string;
  registrationNumber: string;
  taxNumber: string;
  countryCode: string;
  baseCurrencyCode: string;
  fiscalYearStartMonth: number;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  status: string;
}

@Component({
  selector: 'app-legal-entity-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FormHeader, LucideIcon],
  templateUrl: './legal-entity-form.html',
  styleUrl: './legal-entity-form.scss',
})
export class LegalEntityFormComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly organizationService = inject(OrganizationService);

  readonly editEntityId = signal<string | null>(null);
  readonly isEditMode = signal(false);
  readonly isLoadingEntity = signal(false);
  readonly fiscalMonthOptions = fiscalMonthOptions;

  form: LegalEntityFormModel = {
    code: '',
    legalName: '',
    tradeName: '',
    registrationNumber: '',
    taxNumber: '',
    countryCode: '',
    baseCurrencyCode: '',
    fiscalYearStartMonth: 1,
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    status: 'ACTIVE',
  };

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor() {
    const entityId = this.route.snapshot.paramMap.get('id');

    if (entityId) {
      this.editEntityId.set(entityId);
      this.isEditMode.set(true);
      this.isLoadingEntity.set(true);
      this.loadEntity(entityId);
    }
  }

  saveEntity(ngForm: NgForm): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!ngForm.valid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode()) {
      const updatePayload: UpdateLegalEntityRequest = {
        legalName: this.form.legalName.trim(),
        tradeName: optionalText(this.form.tradeName),
        registrationNumber: this.form.registrationNumber.trim(),
        taxNumber: optionalText(this.form.taxNumber),
        countryCode: this.form.countryCode.trim().toUpperCase(),
        baseCurrencyCode: this.form.baseCurrencyCode.trim().toUpperCase(),
        fiscalYearStartMonth: Number(this.form.fiscalYearStartMonth),
        addressLine1: optionalText(this.form.addressLine1),
        addressLine2: optionalText(this.form.addressLine2),
        city: optionalText(this.form.city),
        state: optionalText(this.form.state),
        postalCode: optionalText(this.form.postalCode),
        phone: optionalText(this.form.phone),
        email: optionalText(this.form.email),
        website: optionalText(this.form.website),
        status: this.form.status,
      };

      this.organizationService
        .updateLegalEntity(this.editEntityId()!, updatePayload)
        .subscribe({
          next: () => {
            this.successMessage = 'Legal entity updated successfully.';
            this.isSubmitting = false;
            setTimeout(() => this.router.navigate(['/org/legal-entities']), 1200);
          },
          error: (error) => {
            this.errorMessage =
              error?.error?.message || 'Failed to update legal entity.';
            this.isSubmitting = false;
          },
        });

      return;
    }

    const createPayload: CreateLegalEntityRequest = {
      code: this.form.code.trim().toUpperCase(),
      legalName: this.form.legalName.trim(),
      tradeName: optionalText(this.form.tradeName),
      registrationNumber: this.form.registrationNumber.trim(),
      taxNumber: optionalText(this.form.taxNumber),
      countryCode: this.form.countryCode.trim().toUpperCase(),
      baseCurrencyCode: this.form.baseCurrencyCode.trim().toUpperCase(),
      fiscalYearStartMonth: Number(this.form.fiscalYearStartMonth),
      addressLine1: optionalText(this.form.addressLine1),
      addressLine2: optionalText(this.form.addressLine2),
      city: optionalText(this.form.city),
      state: optionalText(this.form.state),
      postalCode: optionalText(this.form.postalCode),
      phone: optionalText(this.form.phone),
      email: optionalText(this.form.email),
      website: optionalText(this.form.website),
    };

    this.organizationService.createLegalEntity(createPayload).subscribe({
      next: () => {
        this.successMessage = 'Legal entity created successfully.';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/org/legal-entities']), 1200);
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Failed to create legal entity.';
        this.isSubmitting = false;
      },
    });
  }

  private loadEntity(entityId: string): void {
    this.organizationService.getLegalEntityById(entityId).subscribe({
      next: (entity) => {
        this.form = {
          code: entity.code,
          legalName: entity.legalName,
          tradeName: entity.tradeName ?? '',
          registrationNumber: entity.registrationNumber,
          taxNumber: entity.taxNumber ?? '',
          countryCode: entity.countryCode,
          baseCurrencyCode: entity.baseCurrencyCode,
          fiscalYearStartMonth: entity.fiscalYearStartMonth,
          addressLine1: entity.addressLine1 ?? '',
          addressLine2: entity.addressLine2 ?? '',
          city: entity.city ?? '',
          state: entity.state ?? '',
          postalCode: entity.postalCode ?? '',
          phone: entity.phone ?? '',
          email: entity.email ?? '',
          website: entity.website ?? '',
          status: entity.status,
        };
        this.isLoadingEntity.set(false);
      },
      error: () => {
        this.errorMessage = 'Could not load legal entity data.';
        this.isLoadingEntity.set(false);
      },
    });
  }
}
