import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Branch, Department, LegalEntity } from '@hishab-nikash/shared-models';
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

type DepartmentFilters = {
  code: string;
  name: string;
  legalEntity: string;
  branch: string;
  head: string;
  status: string;
  updatedAt: string;
};

type SortColumn =
  | 'code'
  | 'name'
  | 'legalEntity'
  | 'branch'
  | 'headEmployeeId'
  | 'status'
  | 'lastUpdatedAt';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ListHeader,
    ListOverview,
    ListPagination,
    LucideIcon,
  ],
  templateUrl: './departments.html',
  styleUrl: './departments.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentsComponent {
  private readonly organizationService = inject(OrganizationService);

  readonly isLoading = signal(true);
  readonly loadError = signal('');
  readonly departments = signal<Department[]>([]);
  readonly legalEntities = signal<LegalEntity[]>([]);
  readonly branches = signal<Branch[]>([]);
  readonly guidanceItems = [
    'Departments should mirror durable reporting lines, not temporary task groups.',
    'Link departments to branches so operating ownership stays visible.',
    'Use parent departments sparingly and keep the structure easy to follow.',
  ];

  readonly filters = signal<DepartmentFilters>({
    code: '',
    name: '',
    legalEntity: '',
    branch: '',
    head: '',
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

  readonly filteredDepartments = computed(() => {
    const filterState = this.filters();
    const rows = this.departments().filter((department) => {
      return (
        department.code.toLowerCase().includes(filterState.code.toLowerCase()) &&
        department.name.toLowerCase().includes(filterState.name.toLowerCase()) &&
        this.legalEntityName(department.legalEntityId)
          .toLowerCase()
          .includes(filterState.legalEntity.toLowerCase()) &&
        this.branchName(department.branchId)
          .toLowerCase()
          .includes(filterState.branch.toLowerCase()) &&
        (department.headEmployeeId || '')
          .toLowerCase()
          .includes(filterState.head.toLowerCase()) &&
        department.status.toLowerCase().includes(filterState.status.toLowerCase()) &&
        matchesDateFilter(
          department.lastUpdatedAt || department.createdAt,
          filterState.updatedAt
        )
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
        case 'branch':
          return sortText(
            this.branchName(left.branchId),
            this.branchName(right.branchId),
            sort.direction
          );
        case 'headEmployeeId':
          return sortText(
            left.headEmployeeId,
            right.headEmployeeId,
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

  readonly totalDepartmentsCount = computed(() => this.filteredDepartments().length);
  readonly activeDepartmentsCount = computed(
    () => this.departments().filter((department) => isActiveStatus(department.status)).length
  );
  readonly headedDepartmentsCount = computed(
    () => this.departments().filter((department) => !!department.headEmployeeId).length
  );
  readonly linkedBranchesCount = computed(
    () => new Set(this.departments().map((department) => department.branchId).filter(Boolean)).size
  );

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalDepartmentsCount() / this.rowsPerPage()))
  );

  readonly pagedDepartments = computed(() => {
    const start = (this.currentPage() - 1) * this.rowsPerPage();
    return this.filteredDepartments().slice(start, start + this.rowsPerPage());
  });

  readonly pageInfo = computed(() => {
    const total = this.totalDepartmentsCount();
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
    this.loadDepartments();
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

  setFilter(key: keyof DepartmentFilters, value: string): void {
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

  branchName(branchId?: string | null): string {
    if (!branchId) {
      return 'Not linked';
    }

    return this.branches().find((branch) => branch.id === branchId)?.name || 'Branch not found';
  }

  parentDepartmentName(parentDepartmentId?: string | null): string {
    if (!parentDepartmentId) {
      return 'Top level';
    }

    return (
      this.departments().find((department) => department.id === parentDepartmentId)?.name ||
      'Parent not found'
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

  trackDepartment(_index: number, department: Department): string {
    return department.id;
  }

  serialOf(index: number): number {
    return (this.currentPage() - 1) * this.rowsPerPage() + index + 1;
  }

  formatDate(value?: string): string {
    return formatDateTime(value);
  }

  private loadDepartments(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    forkJoin({
      departments: this.organizationService.getDepartments({
        page: 1,
        size: ORGANIZATION_FETCH_SIZE,
      }),
      legalEntities: this.organizationService.getAllLegalEntities(),
      branches: this.organizationService.getAllBranches(),
    }).subscribe({
      next: ({ departments, legalEntities, branches }) => {
        this.departments.set(departments.content ?? []);
        this.legalEntities.set(legalEntities);
        this.branches.set(branches);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.loadError.set(error?.error?.message || 'Failed to load departments.');
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
