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
import { User, UserStatus } from '@hishab-nikash/shared-models';
import { IAMService } from '../../services/iam.service';

type SortDirection = 'asc' | 'desc';
type UserFilters = {
  username: string;
  displayName: string;
  email: string;
  role: string;
  tenantId: string;
  status: string;
  createdBy: string;
  createdAt: string;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
};

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ListHeader,
    ListOverview,
    ListPagination,
    LucideIcon,
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {
  private readonly iamService = inject(IAMService);

  readonly isLoading = signal(true);
  readonly allUsers = signal<User[]>([]);
  readonly statusUpdatingUserId = signal<string | null>(null);
  readonly deletingUserId = signal<string | null>(null);
  readonly actionMessage = signal('');
  readonly actionError = signal('');
  readonly guidanceItems = [
    'Use filters and sorting to find the right account quickly.',
    'Activate or deactivate accounts directly from the list.',
    'Open a user to update profile details, roles, and organization access.',
  ];

  readonly filters = signal<UserFilters>({
    username: '',
    displayName: '',
    email: '',
    role: '',
    tenantId: '',
    status: '',
    createdBy: '',
    createdAt: '',
    lastUpdatedBy: '',
    lastUpdatedAt: '',
  });

  readonly currentSort = signal<{ column: keyof User; direction: SortDirection } | null>({
    column: 'displayName',
    direction: 'asc',
  });

  readonly currentPage = signal(1);
  readonly rowsPerPage = signal(10);
  readonly skeletonRows = Array.from({ length: 8 });

  readonly filteredUsers = computed(() => {
    const filterState = this.filters();
    const rows = this.allUsers().filter((user) => {
      const rolesMatch =
        user.roles.some((role) =>
          role.name.toLowerCase().includes(filterState.role.toLowerCase())
        ) || filterState.role === '';

      return (
        user.username.toLowerCase().includes(filterState.username.toLowerCase()) &&
        user.displayName
          .toLowerCase()
          .includes(filterState.displayName.toLowerCase()) &&
        user.email.toLowerCase().includes(filterState.email.toLowerCase()) &&
        rolesMatch &&
        user.tenantId.toLowerCase().includes(filterState.tenantId.toLowerCase()) &&
        user.status.toLowerCase().includes(filterState.status.toLowerCase()) &&
        (user.createdBy || '')
          .toLowerCase()
          .includes(filterState.createdBy.toLowerCase()) &&
        this.matchesDateFilter(user.createdAt, filterState.createdAt) &&
        (user.lastUpdatedBy || '')
          .toLowerCase()
          .includes(filterState.lastUpdatedBy.toLowerCase()) &&
        this.matchesDateFilter(user.lastUpdatedAt, filterState.lastUpdatedAt)
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

  readonly totalUsersCount = computed(() => this.filteredUsers().length);
  readonly activeUsersCount = computed(
    () => this.allUsers().filter((user) => user.status === 'ACTIVE').length
  );
  readonly inactiveUsersCount = computed(
    () => this.allUsers().filter((user) => user.status !== 'ACTIVE').length
  );
  readonly tenantCount = computed(
    () => new Set(this.allUsers().map((user) => user.tenantId)).size
  );
  readonly usersWithAccessCount = computed(
    () =>
      this.allUsers().filter(
        (user) => (user.organizationAccesses ?? []).length > 0
      ).length
  );

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalUsersCount() / this.rowsPerPage()))
  );

  readonly pagedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.rowsPerPage();
    return this.filteredUsers().slice(start, start + this.rowsPerPage());
  });

  readonly pageInfo = computed(() => {
    const total = this.totalUsersCount();
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
    this.loadUsers();
  }

  toggleSort(column: keyof User): void {
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

  sortIcon(column: keyof User): string {
    const current = this.currentSort();

    if (!current || current.column !== column) {
      return '^v';
    }

    return current.direction === 'asc' ? '^' : 'v';
  }

  singleArrowSortIcon(column: keyof User): string {
    const current = this.currentSort();

    if (!current || current.column !== column) {
      return '^';
    }

    return current.direction === 'asc' ? '^' : 'v';
  }

  setFilter(key: keyof UserFilters, value: string): void {
    this.filters.update((state) => ({ ...state, [key]: value }));
    this.currentPage.set(1);
  }

  statusClass(status: UserStatus): string {
    return status === 'ACTIVE' ? 'status-completed' : 'status-new';
  }

  statusActionLabel(user: User): string {
    return user.status === 'ACTIVE' ? 'Deactivate' : 'Activate';
  }

  organizationAccessLabel(user: User): string {
    const count = user.organizationAccesses?.length ?? 0;

    if (count === 0) {
      return 'None';
    }

    if (count === 1) {
      return '1 assignment';
    }

    return `${count} assignments`;
  }

  hasPrimaryAccess(user: User): boolean {
    return (user.organizationAccesses ?? []).some((access) => access.primaryAccess);
  }

  isStatusUpdating(userId: string): boolean {
    return this.statusUpdatingUserId() === userId;
  }

  isDeleting(userId: string): boolean {
    return this.deletingUserId() === userId;
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

  trackUser(_index: number, user: User): string {
    return user.id;
  }

  serialOf(index: number): number {
    return (this.currentPage() - 1) * this.rowsPerPage() + index + 1;
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

  onDelete(user: User): void {
    if (!window.confirm(`Delete user ${user.displayName}?`)) {
      return;
    }

    this.actionMessage.set('');
    this.actionError.set('');
    this.deletingUserId.set(user.id);

    this.iamService.deleteUser(user.id).subscribe({
      next: () => {
        this.allUsers.update((users) =>
          users.filter((currentUser) => currentUser.id !== user.id)
        );
        this.actionMessage.set(`User ${user.displayName} deleted successfully.`);
        this.deletingUserId.set(null);
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
          this.actionError.set(error?.error?.message || 'Failed to delete user.');
        }

        this.deletingUserId.set(null);
      },
    });
  }

  toggleUserStatus(user: User): void {
    const nextStatus = this.nextStatus(user.status);
    const actionLabel = nextStatus === 'ACTIVE' ? 'activate' : 'deactivate';

    if (
      !window.confirm(
        `${actionLabel[0].toUpperCase()}${actionLabel.slice(1)} user ${user.displayName}?`
      )
    ) {
      return;
    }

    this.actionMessage.set('');
    this.actionError.set('');
    this.statusUpdatingUserId.set(user.id);

    this.iamService.updateUserStatus(user.id, { status: nextStatus }).subscribe({
      next: (updatedUser) => {
        this.allUsers.update((users) =>
          users.map((currentUser) =>
            currentUser.id === user.id
              ? {
                  ...currentUser,
                  ...(updatedUser ?? {}),
                  status: updatedUser?.status ?? nextStatus,
                }
              : currentUser
          )
        );
        this.actionMessage.set(
          `User ${user.displayName} ${nextStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully.`
        );
        this.statusUpdatingUserId.set(null);
      },
      error: (error) => {
        this.actionError.set(
          error?.error?.message || 'Failed to update user status.'
        );
        this.statusUpdatingUserId.set(null);
      },
    });
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    this.actionError.set('');

    this.iamService.getUsers({ page: 1, limit: 1000 }).subscribe({
      next: (users) => {
        this.allUsers.set(users.map((user) => this.normalizeUser(user)));
        this.isLoading.set(false);
      },
      error: (error) => {
        this.actionError.set(error?.error?.message || 'Failed to load users.');
        this.isLoading.set(false);
      },
    });
  }

  private nextStatus(status: UserStatus): UserStatus {
    return status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
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

  private compareRows(
    left: User,
    right: User,
    column: keyof User,
    direction: SortDirection
  ): number {
    let leftValue: string | number = left[column] as string | number;
    let rightValue: string | number = right[column] as string | number;

    if (column === 'roles') {
      leftValue = left.roles[0]?.name || '';
      rightValue = right.roles[0]?.name || '';
    }

    if (typeof leftValue === 'string' && typeof rightValue === 'string') {
      return direction === 'asc'
        ? leftValue.localeCompare(rightValue)
        : rightValue.localeCompare(leftValue);
    }

    if (leftValue < rightValue) {
      return direction === 'asc' ? -1 : 1;
    }

    if (leftValue > rightValue) {
      return direction === 'asc' ? 1 : -1;
    }

    return 0;
  }

  private normalizeUser(user: User): User {
    return {
      ...user,
      roles: Array.isArray(user.roles) ? user.roles : [],
      organizationAccesses: Array.isArray(user.organizationAccesses)
        ? user.organizationAccesses
        : [],
      createdBy: user.createdBy ?? '',
      createdAt: user.createdAt ?? '',
      lastUpdatedBy: user.lastUpdatedBy ?? '',
      lastUpdatedAt: user.lastUpdatedAt ?? '',
    };
  }
}
