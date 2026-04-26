import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  ListHeader,
  ListOverview,
  ListPagination,
  LucideIcon,
} from '@hishab-nikash/shared-ui';
import { Role } from '@hishab-nikash/shared-models';
import { IAMService } from '../../services/iam.service';

type SortDirection = 'asc' | 'desc';
type RoleSortColumn =
  | 'code'
  | 'name'
  | 'description'
  | 'permissionCount'
  | 'createdBy'
  | 'createdAt'
  | 'lastUpdatedBy'
  | 'lastUpdatedAt';

type RoleFilters = {
  code: string;
  name: string;
  description: string;
  permission: string;
  createdBy: string;
  createdAt: string;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
};

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ListHeader,
    ListOverview,
    ListPagination,
    LucideIcon,
  ],
  templateUrl: './roles.html',
  styleUrl: './roles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesComponent {
  private readonly iamService = inject(IAMService);
  private readonly permissionPreviewLimit = 3;

  readonly isLoading = signal(true);
  readonly allRoles = signal<Role[]>([]);
  readonly deletingRoleId = signal<string | null>(null);
  readonly actionMessage = signal('');
  readonly actionError = signal('');
  readonly guidanceItems = [
    'Use permission counts to spot broad roles and empty roles quickly.',
    'Open a role to update its name, description, and included permissions.',
    'Use the access directory when choosing permissions for a role.',
  ];

  readonly filters = signal<RoleFilters>({
    code: '',
    name: '',
    description: '',
    permission: '',
    createdBy: '',
    createdAt: '',
    lastUpdatedBy: '',
    lastUpdatedAt: '',
  });

  readonly currentSort = signal<{ column: RoleSortColumn; direction: SortDirection } | null>({
    column: 'name',
    direction: 'asc',
  });

  readonly currentPage = signal(1);
  readonly rowsPerPage = signal(10);
  readonly skeletonRows = Array.from({ length: 6 });

  readonly filteredRoles = computed(() => {
    const filterState = this.filters();
    const rows = this.allRoles().filter((role) => {
      const permissionFilter = filterState.permission.trim().toLowerCase();
      const permissionsMatch =
        permissionFilter === '' ||
        role.permissions.some((permission) =>
          permission.toLowerCase().includes(permissionFilter)
        );

      return (
        role.code.toLowerCase().includes(filterState.code.toLowerCase()) &&
        role.name.toLowerCase().includes(filterState.name.toLowerCase()) &&
        (role.description ?? '')
          .toLowerCase()
          .includes(filterState.description.toLowerCase()) &&
        (role.createdBy ?? '')
          .toLowerCase()
          .includes(filterState.createdBy.toLowerCase()) &&
        this.matchesDateFilter(role.createdAt, filterState.createdAt) &&
        (role.lastUpdatedBy ?? '')
          .toLowerCase()
          .includes(filterState.lastUpdatedBy.toLowerCase()) &&
        this.matchesDateFilter(role.lastUpdatedAt, filterState.lastUpdatedAt) &&
        permissionsMatch
      );
    });

    const sort = this.currentSort();

    if (!sort) {
      return rows;
    }

    return [...rows].sort((left, right) =>
      this.compareRows(left, right, sort.column, sort.direction)
    );
  });

  readonly totalRolesCount = computed(() => this.filteredRoles().length);
  readonly configuredRolesCount = computed(
    () => this.allRoles().filter((role) => role.permissions.length > 0).length
  );
  readonly emptyRolesCount = computed(
    () => this.allRoles().filter((role) => role.permissions.length === 0).length
  );
  readonly highCoverageRolesCount = computed(
    () =>
      this.allRoles().filter((role) => role.permissions.length > this.permissionPreviewLimit)
        .length
  );
  readonly totalPermissionsCount = computed(
    () =>
      new Set(
        this.allRoles().flatMap((role) =>
          role.permissions.map((permission) => permission.toLowerCase())
        )
      ).size
  );

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalRolesCount() / this.rowsPerPage()))
  );

  readonly pagedRoles = computed(() => {
    const start = (this.currentPage() - 1) * this.rowsPerPage();
    return this.filteredRoles().slice(start, start + this.rowsPerPage());
  });

  readonly pageInfo = computed(() => {
    const total = this.totalRolesCount();
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
    this.loadRoles();
  }

  toggleSort(column: RoleSortColumn): void {
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

  sortIcon(column: RoleSortColumn): string {
    const current = this.currentSort();

    if (!current || current.column !== column) {
      return '^v';
    }

    return current.direction === 'asc' ? '^' : 'v';
  }

  singleArrowSortIcon(column: RoleSortColumn): string {
    const current = this.currentSort();

    if (!current || current.column !== column) {
      return '^';
    }

    return current.direction === 'asc' ? '^' : 'v';
  }

  setFilter(key: keyof RoleFilters, value: string): void {
    this.filters.update((state) => ({ ...state, [key]: value }));
    this.currentPage.set(1);
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

  trackRole(_index: number, role: Role): string {
    return role.id;
  }

  serialOf(index: number): number {
    return (this.currentPage() - 1) * this.rowsPerPage() + index + 1;
  }

  visiblePermissions(role: Role): string[] {
    return role.permissions.slice(0, this.permissionPreviewLimit);
  }

  hiddenPermissionCount(role: Role): number {
    return Math.max(0, role.permissions.length - this.permissionPreviewLimit);
  }

  permissionCountClass(role: Role): string {
    const count = role.permissions.length;

    if (count === 0) {
      return 'status-new';
    }

    if (count <= this.permissionPreviewLimit) {
      return 'status-progress';
    }

    return 'status-completed';
  }

  permissionCountLabel(role: Role): string {
    const count = role.permissions.length;

    if (count === 0) {
      return 'No Access';
    }

    if (count === 1) {
      return '1 Permission';
    }

    return `${count} Permissions`;
  }

  formatDate(date?: string): string {
    if (!date) {
      return '--';
    }

    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(date));
  }

  isRoleDeleting(roleId: string): boolean {
    return this.deletingRoleId() === roleId;
  }

  deleteRole(role: Role): void {
    if (!window.confirm(`Delete role ${role.name}?`)) {
      return;
    }

    this.actionMessage.set('');
    this.actionError.set('');
    this.deletingRoleId.set(role.id);

    this.iamService.deleteRole(role.id).subscribe({
      next: () => {
        this.allRoles.update((roles) =>
          roles.filter((currentRole) => currentRole.id !== role.id)
        );
        this.actionMessage.set(`Role ${role.name} deleted successfully.`);
        this.deletingRoleId.set(null);
      },
      error: (error) => {
        const status = error?.status;
        const backendMessage = error?.error?.message || error?.error?.error || '';
        const deleteNotSupported =
          typeof backendMessage === 'string' &&
          backendMessage
            .toLowerCase()
            .includes("request method 'delete' is not supported");

        if (status === 404 || status === 405 || deleteNotSupported) {
          this.actionError.set('Delete is not available right now.');
        } else {
          this.actionError.set(error?.error?.message || 'Failed to delete role.');
        }

        this.deletingRoleId.set(null);
      },
    });
  }

  private loadRoles(): void {
    this.isLoading.set(true);
    this.actionError.set('');

    this.iamService.getRoles().subscribe({
      next: (roles) => {
        this.allRoles.set(roles.map((role) => this.normalizeRole(role)));
        this.isLoading.set(false);
      },
      error: (error) => {
        this.actionError.set(error?.error?.message || 'Failed to load roles.');
        this.isLoading.set(false);
      },
    });
  }

  private compareRows(
    left: Role,
    right: Role,
    column: RoleSortColumn,
    direction: SortDirection
  ): number {
    if (column === 'permissionCount') {
      return direction === 'asc'
        ? left.permissions.length - right.permissions.length
        : right.permissions.length - left.permissions.length;
    }

    const leftValue = (left[column] ?? '').toLowerCase();
    const rightValue = (right[column] ?? '').toLowerCase();

    return direction === 'asc'
      ? leftValue.localeCompare(rightValue)
      : rightValue.localeCompare(leftValue);
  }

  private matchesDateFilter(date: string | undefined, filter: string): boolean {
    if (!filter) {
      return true;
    }

    return this.toDateInputValue(date) === filter;
  }

  private toDateInputValue(date?: string): string {
    if (!date) {
      return '';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private normalizeRole(role: Role): Role {
    return {
      ...role,
      code: role.code ?? '',
      description: role.description ?? '',
      permissions: Array.isArray(role.permissions) ? role.permissions : [],
      createdBy: role.createdBy ?? '',
      createdAt: role.createdAt ?? '',
      lastUpdatedBy: role.lastUpdatedBy ?? '',
      lastUpdatedAt: role.lastUpdatedAt ?? '',
    };
  }
}
