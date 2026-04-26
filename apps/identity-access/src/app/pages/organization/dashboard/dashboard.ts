import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@hishab-nikash/shared-auth';
import {
  Branch,
  BusinessUnit,
  Department,
  DepartmentTree,
  LegalEntity,
  OrganizationTree,
  TenantProfile,
} from '@hishab-nikash/shared-models';
import { LucideIcon } from '@hishab-nikash/shared-ui';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrganizationService } from '../../../services/organization.service';

@Component({
  selector: 'app-organization-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideIcon],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationDashboardComponent {
  private readonly organizationService = inject(OrganizationService);

  readonly currentUser = inject(AuthService).currentUser;
  readonly isLoading = signal(true);
  readonly loadError = signal('');
  readonly legalEntities = signal<LegalEntity[]>([]);
  readonly businessUnits = signal<BusinessUnit[]>([]);
  readonly branches = signal<Branch[]>([]);
  readonly departments = signal<Department[]>([]);
  readonly tenantProfiles = signal<TenantProfile[]>([]);
  readonly trees = signal<OrganizationTree[]>([]);

  readonly quickLinks = [
    {
      title: 'Legal entities',
      copy: 'Maintain the companies and operating entities under the group.',
      route: '/org/legal-entities',
      icon: 'building2',
    },
    {
      title: 'Business units',
      copy: 'Organize internal lines of business and management ownership.',
      route: '/org/business-units',
      icon: 'briefcaseBusiness',
    },
    {
      title: 'Branches',
      copy: 'Manage branches, contact details, and operating locations.',
      route: '/org/branches',
      icon: 'mapPinned',
    },
    {
      title: 'Departments',
      copy: 'Define reporting lines and department ownership clearly.',
      route: '/org/departments',
      icon: 'network',
    },
  ];

  readonly activeLegalEntitiesCount = computed(
    () => this.legalEntities().filter((entity) => entity.status === 'ACTIVE').length
  );

  readonly activeBranchesCount = computed(
    () => this.branches().filter((branch) => branch.status === 'ACTIVE').length
  );

  readonly activeDepartmentsCount = computed(
    () => this.departments().filter((department) => department.status === 'ACTIVE').length
  );

  readonly summaryCards = computed(() => [
    {
      label: 'Legal Entities',
      value: this.legalEntities().length,
      note: `${this.activeLegalEntitiesCount()} active`,
      icon: 'building2',
    },
    {
      label: 'Business Units',
      value: this.businessUnits().length,
      note: 'Operating units',
      icon: 'briefcaseBusiness',
    },
    {
      label: 'Branches',
      value: this.branches().length,
      note: `${this.activeBranchesCount()} active`,
      icon: 'mapPinned',
    },
    {
      label: 'Departments',
      value: this.departments().length,
      note: `${this.activeDepartmentsCount()} active`,
      icon: 'network',
    },
    {
      label: 'Tenant Profiles',
      value: this.tenantProfiles().length,
      note: 'Published profiles',
      icon: 'badgeInfo',
    },
  ]);

  readonly highlightedEntities = computed(() =>
    this.trees()
      .map((tree) => ({
        id: tree.legalEntityId,
        name: tree.legalEntityName,
        code: tree.legalEntityCode,
        branchCount: tree.branches.length,
        unitCount: tree.businessUnits.length,
        departmentCount: tree.branches.reduce(
          (count, branch) => count + this.countDepartments(branch.departments),
          0
        ),
      }))
      .sort((left, right) => right.branchCount - left.branchCount)
      .slice(0, 4)
  );

  readonly recentBranches = computed(() =>
    [...this.branches()]
      .sort((left, right) =>
        this.sortDate(right.lastUpdatedAt || right.createdAt) -
        this.sortDate(left.lastUpdatedAt || left.createdAt)
      )
      .slice(0, 4)
  );

  readonly workloadHighlights = computed(() => [
    {
      title: 'Multi-branch entities',
      value: this.trees().filter((tree) => tree.branches.length > 1).length,
      note: 'Entities with more than one branch in the live structure.',
    },
    {
      title: 'Avg. departments per branch',
      value: this.averageDepartmentsPerBranch,
      note: 'Calculated from the structure currently returned by the service.',
    },
    {
      title: 'Published tenant profiles',
      value: this.tenantProfiles().filter((profile) => profile.active).length,
      note: 'Profiles currently marked as active.',
    },
  ]);

  constructor() {
    this.loadDashboard();
  }

  get todayLabel(): string {
    return new Intl.DateTimeFormat('en', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(new Date());
  }

  get greeting(): string {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
      return 'Good morning';
    }

    if (currentHour < 17) {
      return 'Good afternoon';
    }

    return 'Good evening';
  }

  get averageDepartmentsPerBranch(): string {
    if (this.branches().length === 0) {
      return '0';
    }

    return (this.departments().length / this.branches().length).toFixed(1);
  }

  private loadDashboard(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    forkJoin({
      legalEntities: this.organizationService.getAllLegalEntities(),
      businessUnits: this.organizationService.getAllBusinessUnits(),
      branches: this.organizationService.getAllBranches(),
      departments: this.organizationService.getAllDepartments(),
      tenantProfiles: this.organizationService
        .getTenantProfiles({ page: 1, size: 500 })
        .pipe(map((response) => response.content ?? [])),
      trees: this.organizationService.getOrganizationTrees(),
    }).subscribe({
      next: ({
        legalEntities,
        businessUnits,
        branches,
        departments,
        tenantProfiles,
        trees,
      }) => {
        this.legalEntities.set(legalEntities);
        this.businessUnits.set(businessUnits);
        this.branches.set(branches);
        this.departments.set(departments);
        this.tenantProfiles.set(tenantProfiles);
        this.trees.set(trees);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.loadError.set(
          error?.error?.message || 'Failed to load organization overview.'
        );
        this.isLoading.set(false);
      },
    });
  }

  private countDepartments(departments: DepartmentTree[]): number {
    return departments.reduce((count, department) => {
      const childDepartments = Array.isArray(department.children)
        ? department.children
        : [];

      return count + 1 + this.countDepartments(childDepartments);
    }, 0);
  }

  private sortDate(value?: string): number {
    if (!value) {
      return 0;
    }

    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }
}
