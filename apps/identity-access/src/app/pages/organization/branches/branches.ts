import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Branch, BusinessUnit, LegalEntity } from '@hishab-nikash/shared-models';
import {
  ListHeader,
  ListOverview,
  ListPagination,
  LucideIcon,
} from '@hishab-nikash/shared-ui';
import { forkJoin } from 'rxjs';
import { OrganizationService } from '../../../services/organization.service';
import {
  formatDateTime,
  isActiveStatus,
  matchesDateFilter,
  ORGANIZATION_FETCH_SIZE,
  ORGANIZATION_PAGE_SIZE,
  SortDirection,
  sortNumber,
  sortText,
  statusBadgeClass,
} from '../organization.utils';

type BranchFilters = {
  code: string;
  name: string;
  legalEntity: string;
  businessUnit: string;
  city: string;
  status: string;
  updatedAt: string;
};

type SortColumn =
  | 'code'
  | 'name'
  | 'legalEntity'
  | 'businessUnit'
  | 'city'
  | 'status'
  | 'lastUpdatedAt';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ListHeader,
    ListOverview,
    ListPagination,
    LucideIcon,
  ],
  templateUrl: './branches.html',
  styleUrl: './branches.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BranchesComponent {
  private readonly organizationService = inject(OrganizationService);

  readonly isLoading = signal(true);
  readonly loadError = signal('');
  readonly branches = signal<Branch[]>([]);
  readonly legalEntities = signal<LegalEntity[]>([]);
  readonly businessUnits = signal<BusinessUnit[]>([]);
  readonly guidanceItems = [
    'Use branches for real operating locations, not temporary delivery points.',
    'Keep branch contact and timezone details complete for operations teams.',
    'Link a branch to a business unit when ownership is already clear.',
  ];

  readonly filters = signal<BranchFilters>({
    code: '',
    name: '',
    legalEntity: '',
    businessUnit: '',
    city: '',
    status: '',
    updatedAt: '',
  });

  readonly currentSort = signal<{ column: SortColumn; direction: SortDirection } | null>(
    {
      column: 'name',
      direction: 'asc',
    }
  );

  readonly currentPage = signal(1);
  readonly rowsPerPage = signal(ORGANIZATION_PAGE_SIZE);
  readonly skeletonRows = Array.from({ length: 8 });

  readonly filteredBranches = computed(() => {
    const filterState = this.filters();
    const rows = this.branches().filter((branch) => {
      return (
        branch.code.toLowerCase().includes(filterState.code.toLowerCase()) &&
        branch.name.toLowerCase().includes(filterState.name.toLowerCase()) &&
        this.legalEntityName(branch.legalEntityId)
          .toLowerCase()
          .includes(filterState.legalEntity.toLowerCase()) &&
        this.businessUnitName(branch.businessUnitId)
          .toLowerCase()
          .includes(filterState.businessUnit.toLowerCase()) &&
        (branch.city || '').toLowerCase().includes(filterState.city.toLowerCase()) &&
        branch.status.toLowerCase().includes(filterState.status.toLowerCase()) &&
        matchesDateFilter(branch.lastUpdatedAt || branch.createdAt, filterState.updatedAt)
      );
    });

    const sort = this.currentSort();

    if (!sort) {
      return rows;
    }

    return [...rows].sort((left, right) => {
      switch (sort.column) {
        case 'code':
          return sortText(left.code, right.code, sort.direction);
        case 'name':
          return sortText(left.name, right.name, sort.direction);
        case 'legalEntity':
          return sortText(
            this.legalEntityName(left.legalEntityId),
            this.legalEntityName(right.legalEntityId),
            sort.direction
          );
        case 'businessUnit':
          return sortText(
            this.businessUnitName(left.businessUnitId),
            this.businessUnitName(right.businessUnitId),
            sort.direction
          );
        case 'city':
          return sortText(left.city, right.city, sort.direction);
        case 'status':
          return sortText(left.status, right.status, sort.direction);
        case 'lastUpdatedAt':
          return sortNumber(
            this.toTimestamp(left.lastUpdatedAt || left.createdAt),
            this.toTimestamp(right.lastUpdatedAt || right.createdAt),
            sort.direction
          );
        default:
          return 0;
      }
    });
  });

  readonly totalBranchesCount = computed(() => this.filteredBranches().length);
  readonly activeBranchesCount = computed(
    () => this.branches().filter((branch) => isActiveStatus(branch.status)).length
  );
  readonly mappedUnitCount = computed(
    () => this.branches().filter((branch) => !!branch.businessUnitId).length
  );
  readonly cityCount = computed(
    () =>
      new Set(
        this.branches()
          .map((branch) => branch.city)
          .filter(Boolean)
      ).size
  );

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalBranchesCount() / this.rowsPerPage()))
  );

  readonly pagedBranches = computed(() => {
    const start = (this.currentPage() - 1) * this.rowsPerPage();
    return this.filteredBranches().slice(start, start + this.rowsPerPage());
  });

  readonly pageInfo = computed(() => {
    const total = this.totalBranchesCount();
    const rows = this.rowsPerPage();
    const page = this.currentPage();

    if (total === 0) {
      return { start: 0, end: 0, total: 0 };
    }

    const start = (page - 1) * rows + 1;
    const end = Math.min(page * rows, total);
    return { start, end, total };
  });

  constructor() {
    this.loadBranches();
  }

  toggleSort(column: SortColumn): void {
    const current = this.currentSort();

    if (current?.column === column) {
      this.currentSort.set({
        column,
        direction: current.direction === 'asc' ? 'desc' : 'asc',
      });
      return;
    }

    this.currentSort.set({ column, direction: 'asc' });
  }

  sortIcon(column: SortColumn): string {
    const current = this.currentSort();

    if (!current || current.column !== column) {
      return '^v';
    }

    return current.direction === 'asc' ? '^' : 'v';
  }

  singleArrowSortIcon(column: SortColumn): string {
    const current = this.currentSort();

    if (!current || current.column !== column) {
      return '^';
    }

    return current.direction === 'asc' ? '^' : 'v';
  }

  setFilter(key: keyof BranchFilters, value: string): void {
    this.filters.update((state) => ({ ...state, [key]: value }));
    this.currentPage.set(1);
  }

  statusClass(status: string): string {
    return statusBadgeClass(status);
  }

  legalEntityName(legalEntityId: string): string {
    return (
      this.legalEntities().find((entity) => entity.id === legalEntityId)?.legalName ||
      'Entity not found'
    );
  }

  businessUnitName(businessUnitId?: string | null): string {
    if (!businessUnitId) {
      return 'Not linked';
    }

    return (
      this.businessUnits().find((unit) => unit.id === businessUnitId)?.name ||
      'Unit not found'
    );
  }

  setRowsPerPage(value: string | number): void {
    this.rowsPerPage.set(Number(value));
    this.currentPage.set(1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((page) => page + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  trackBranch(_index: number, branch: Branch): string {
    return branch.id;
  }

  serialOf(index: number): number {
    return (this.currentPage() - 1) * this.rowsPerPage() + index + 1;
  }

  formatDate(value?: string): string {
    return formatDateTime(value);
  }

  private loadBranches(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    forkJoin({
      branches: this.organizationService.getBranches({
        page: 1,
        size: ORGANIZATION_FETCH_SIZE,
      }),
      legalEntities: this.organizationService.getAllLegalEntities(),
      businessUnits: this.organizationService.getAllBusinessUnits(),
    }).subscribe({
      next: ({ branches, legalEntities, businessUnits }) => {
        this.branches.set(branches.content ?? []);
        this.legalEntities.set(legalEntities);
        this.businessUnits.set(businessUnits);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.loadError.set(error?.error?.message || 'Failed to load branches.');
        this.isLoading.set(false);
      },
    });
  }

  private toTimestamp(value?: string): number {
    if (!value) {
      return 0;
    }

    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }
}
