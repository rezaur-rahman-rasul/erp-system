import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { BusinessUnit, LegalEntity } from '@hishab-nikash/shared-models';
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

type BusinessUnitFilters = {
  code: string;
  name: string;
  legalEntity: string;
  manager: string;
  status: string;
  updatedAt: string;
};

type SortColumn =
  | 'code'
  | 'name'
  | 'legalEntity'
  | 'managerEmployeeId'
  | 'status'
  | 'lastUpdatedAt';

@Component({
  selector: 'app-business-units',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ListHeader,
    ListOverview,
    ListPagination,
    LucideIcon,
  ],
  templateUrl: './business-units.html',
  styleUrl: './business-units.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessUnitsComponent {
  private readonly organizationService = inject(OrganizationService);

  readonly isLoading = signal(true);
  readonly loadError = signal('');
  readonly allUnits = signal<BusinessUnit[]>([]);
  readonly legalEntities = signal<LegalEntity[]>([]);
  readonly guidanceItems = [
    'Use business units to separate lines of business under a legal entity.',
    'Attach managers where possible so ownership is visible from the list.',
    'Keep descriptions short and practical for operations teams.',
  ];

  readonly filters = signal<BusinessUnitFilters>({
    code: '',
    name: '',
    legalEntity: '',
    manager: '',
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

  readonly filteredUnits = computed(() => {
    const filterState = this.filters();
    const rows = this.allUnits().filter((unit) => {
      const legalEntityName = this.legalEntityName(unit.legalEntityId);

      return (
        unit.code.toLowerCase().includes(filterState.code.toLowerCase()) &&
        unit.name.toLowerCase().includes(filterState.name.toLowerCase()) &&
        legalEntityName.toLowerCase().includes(filterState.legalEntity.toLowerCase()) &&
        (unit.managerEmployeeId || '')
          .toLowerCase()
          .includes(filterState.manager.toLowerCase()) &&
        unit.status.toLowerCase().includes(filterState.status.toLowerCase()) &&
        matchesDateFilter(unit.lastUpdatedAt || unit.createdAt, filterState.updatedAt)
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
        case 'managerEmployeeId':
          return sortText(
            left.managerEmployeeId,
            right.managerEmployeeId,
            sort.direction
          );
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

  readonly totalUnitsCount = computed(() => this.filteredUnits().length);
  readonly activeUnitsCount = computed(
    () => this.allUnits().filter((unit) => isActiveStatus(unit.status)).length
  );
  readonly managedUnitsCount = computed(
    () => this.allUnits().filter((unit) => !!unit.managerEmployeeId).length
  );
  readonly coveredEntityCount = computed(
    () => new Set(this.allUnits().map((unit) => unit.legalEntityId)).size
  );

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalUnitsCount() / this.rowsPerPage()))
  );

  readonly pagedUnits = computed(() => {
    const start = (this.currentPage() - 1) * this.rowsPerPage();
    return this.filteredUnits().slice(start, start + this.rowsPerPage());
  });

  readonly pageInfo = computed(() => {
    const total = this.totalUnitsCount();
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
    this.loadBusinessUnits();
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

  setFilter(key: keyof BusinessUnitFilters, value: string): void {
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

  trackUnit(_index: number, unit: BusinessUnit): string {
    return unit.id;
  }

  serialOf(index: number): number {
    return (this.currentPage() - 1) * this.rowsPerPage() + index + 1;
  }

  formatDate(value?: string): string {
    return formatDateTime(value);
  }

  private loadBusinessUnits(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    forkJoin({
      businessUnits: this.organizationService.getBusinessUnits({
        page: 1,
        size: ORGANIZATION_FETCH_SIZE,
      }),
      legalEntities: this.organizationService.getAllLegalEntities(),
    }).subscribe({
      next: ({ businessUnits, legalEntities }) => {
        this.allUnits.set(businessUnits.content ?? []);
        this.legalEntities.set(legalEntities);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.loadError.set(
          error?.error?.message || 'Failed to load business units.'
        );
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
