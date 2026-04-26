import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalEntity } from '@hishab-nikash/shared-models';
import {
  ListHeader,
  ListOverview,
  ListPagination,
  LucideIcon,
} from '@hishab-nikash/shared-ui';
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

type LegalEntityFilters = {
  code: string;
  legalName: string;
  countryCode: string;
  baseCurrencyCode: string;
  status: string;
  updatedAt: string;
};

type SortColumn =
  | 'code'
  | 'legalName'
  | 'countryCode'
  | 'baseCurrencyCode'
  | 'fiscalYearStartMonth'
  | 'status'
  | 'lastUpdatedAt';

@Component({
  selector: 'app-legal-entities',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ListHeader,
    ListOverview,
    ListPagination,
    LucideIcon,
  ],
  templateUrl: './legal-entities.html',
  styleUrl: './legal-entities.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalEntitiesComponent {
  private readonly organizationService = inject(OrganizationService);

  readonly isLoading = signal(true);
  readonly allEntities = signal<LegalEntity[]>([]);
  readonly statusChangingId = signal<string | null>(null);
  readonly actionMessage = signal('');
  readonly actionError = signal('');
  readonly guidanceItems = [
    'Use legal entities for the top-most operating structure.',
    'Keep registration and finance details complete before branches are added.',
    'Change active status from the list without opening the full edit form.',
  ];

  readonly filters = signal<LegalEntityFilters>({
    code: '',
    legalName: '',
    countryCode: '',
    baseCurrencyCode: '',
    status: '',
    updatedAt: '',
  });

  readonly currentSort = signal<{ column: SortColumn; direction: SortDirection } | null>(
    {
      column: 'legalName',
      direction: 'asc',
    }
  );

  readonly currentPage = signal(1);
  readonly rowsPerPage = signal(ORGANIZATION_PAGE_SIZE);
  readonly skeletonRows = Array.from({ length: 8 });

  readonly filteredEntities = computed(() => {
    const filterState = this.filters();
    const rows = this.allEntities().filter((entity) => {
      return (
        entity.code.toLowerCase().includes(filterState.code.toLowerCase()) &&
        entity.legalName
          .toLowerCase()
          .includes(filterState.legalName.toLowerCase()) &&
        (entity.countryCode || '')
          .toLowerCase()
          .includes(filterState.countryCode.toLowerCase()) &&
        (entity.baseCurrencyCode || '')
          .toLowerCase()
          .includes(filterState.baseCurrencyCode.toLowerCase()) &&
        entity.status.toLowerCase().includes(filterState.status.toLowerCase()) &&
        matchesDateFilter(entity.lastUpdatedAt || entity.createdAt, filterState.updatedAt)
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
        case 'legalName':
          return sortText(left.legalName, right.legalName, sort.direction);
        case 'countryCode':
          return sortText(left.countryCode, right.countryCode, sort.direction);
        case 'baseCurrencyCode':
          return sortText(
            left.baseCurrencyCode,
            right.baseCurrencyCode,
            sort.direction
          );
        case 'fiscalYearStartMonth':
          return sortNumber(
            left.fiscalYearStartMonth,
            right.fiscalYearStartMonth,
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

  readonly totalEntitiesCount = computed(() => this.filteredEntities().length);
  readonly activeEntitiesCount = computed(
    () => this.allEntities().filter((entity) => isActiveStatus(entity.status)).length
  );
  readonly inactiveEntitiesCount = computed(
    () => this.allEntities().filter((entity) => !isActiveStatus(entity.status)).length
  );
  readonly countryCount = computed(
    () =>
      new Set(
        this.allEntities()
          .map((entity) => entity.countryCode)
          .filter(Boolean)
      ).size
  );

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalEntitiesCount() / this.rowsPerPage()))
  );

  readonly pagedEntities = computed(() => {
    const start = (this.currentPage() - 1) * this.rowsPerPage();
    return this.filteredEntities().slice(start, start + this.rowsPerPage());
  });

  readonly pageInfo = computed(() => {
    const total = this.totalEntitiesCount();
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
    this.loadLegalEntities();
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

  setFilter(key: keyof LegalEntityFilters, value: string): void {
    this.filters.update((state) => ({ ...state, [key]: value }));
    this.currentPage.set(1);
  }

  statusClass(status: string): string {
    return statusBadgeClass(status);
  }

  statusActionLabel(entity: LegalEntity): string {
    return isActiveStatus(entity.status) ? 'Deactivate' : 'Activate';
  }

  isStatusChanging(entityId: string): boolean {
    return this.statusChangingId() === entityId;
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

  trackEntity(_index: number, entity: LegalEntity): string {
    return entity.id;
  }

  serialOf(index: number): number {
    return (this.currentPage() - 1) * this.rowsPerPage() + index + 1;
  }

  formatDate(value?: string): string {
    return formatDateTime(value);
  }

  fiscalMonthLabel(month: number): string {
    return new Intl.DateTimeFormat('en', { month: 'long' }).format(
      new Date(2024, Math.max(month - 1, 0), 1)
    );
  }

  toggleStatus(entity: LegalEntity): void {
    const nextStatus = isActiveStatus(entity.status) ? 'INACTIVE' : 'ACTIVE';

    if (
      !window.confirm(
        `${nextStatus === 'ACTIVE' ? 'Activate' : 'Deactivate'} ${entity.legalName}?`
      )
    ) {
      return;
    }

    this.actionMessage.set('');
    this.actionError.set('');
    this.statusChangingId.set(entity.id);

    this.organizationService.changeLegalEntityStatus(entity.id, nextStatus).subscribe({
      next: (updatedEntity) => {
        this.allEntities.update((entities) =>
          entities.map((entityItem) =>
            entityItem.id === entity.id
              ? { ...entityItem, ...updatedEntity, status: updatedEntity.status }
              : entityItem
          )
        );
        this.actionMessage.set(
          `${entity.legalName} ${nextStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully.`
        );
        this.statusChangingId.set(null);
      },
      error: (error) => {
        this.actionError.set(
          error?.error?.message || 'Failed to update legal entity status.'
        );
        this.statusChangingId.set(null);
      },
    });
  }

  private loadLegalEntities(): void {
    this.isLoading.set(true);
    this.actionError.set('');

    this.organizationService
      .getLegalEntities({ page: 1, size: ORGANIZATION_FETCH_SIZE })
      .subscribe({
        next: (response) => {
          this.allEntities.set(response.content ?? []);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.actionError.set(
            error?.error?.message || 'Failed to load legal entities.'
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
