import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ListHeader,
  ListOverview,
  ListPagination,
  LucideIcon,
} from "@hishab-nikash/shared-ui";
import { IAMService } from "../../services/iam.service";
import { User, UserStatus } from "@hishab-nikash/shared-models";
import { RouterLink } from "@angular/router";

type SortDirection = 'asc' | 'desc';

@Component({
  selector: "app-users",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ListHeader,
    ListOverview,
    ListPagination,
    LucideIcon,
  ],
  templateUrl: "./users.html",
  styleUrl: "./users.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {
  private readonly iamService = inject(IAMService);

  // Loading state – starts true until first data arrives
  readonly isLoading = signal(true);

  // Raw data from service – initially empty
  readonly allUsers = signal<User[]>([]);
  readonly statusUpdatingUserId = signal<string | null>(null);
  readonly deletingUserId = signal<string | null>(null);
  readonly actionMessage = signal('');
  readonly actionError = signal('');

  constructor() {
    this.loadUsers();
  }

  // Filtering State
  readonly filters = signal<Record<string, string>>({
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

  // Sorting State
  readonly currentSort = signal<{ column: keyof User; direction: SortDirection } | null>({
    column: 'displayName',
    direction: 'asc'
  });

  // Pagination State
  readonly currentPage = signal(1);
  readonly rowsPerPage = signal(10);

  // Reactive Logic: Filtering and Sorting (Client-side)
  readonly filteredUsers = computed(() => {
    const f = this.filters();
    const rows = this.allUsers().filter((user) => {
      const rolesMatch = user.roles.some(r => r.name.toLowerCase().includes(f['role'].toLowerCase())) || f['role'] === '';
      return (
        user.username.toLowerCase().includes(f['username'].toLowerCase()) &&
        user.displayName.toLowerCase().includes(f['displayName'].toLowerCase()) &&
        user.email.toLowerCase().includes(f['email'].toLowerCase()) &&
        rolesMatch &&
        user.tenantId.toLowerCase().includes(f['tenantId'].toLowerCase()) &&
        user.status.toLowerCase().includes(f['status'].toLowerCase()) &&
        (user.createdBy || '').toLowerCase().includes(f['createdBy'].toLowerCase()) &&
        this.matchesDateFilter(user.createdAt, f['createdAt']) &&
        (user.lastUpdatedBy || '').toLowerCase().includes(f['lastUpdatedBy'].toLowerCase()) &&
        this.matchesDateFilter(user.lastUpdatedAt, f['lastUpdatedAt'])
      );
    });

    const sort = this.currentSort();
    if (!sort) return rows;
    return [...rows].sort((a, b) => this.compareRows(a, b, sort.column, sort.direction));
  });

  readonly totalUsersCount = computed(() => this.filteredUsers().length);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalUsersCount() / this.rowsPerPage())));

  readonly pagedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.rowsPerPage();
    return this.filteredUsers().slice(start, start + this.rowsPerPage());
  });

  readonly pageInfo = computed(() => {
    const total = this.totalUsersCount();
    const rows = this.rowsPerPage();
    const page = this.currentPage();
    if (total === 0) return { start: 0, end: 0, total: 0 };
    const start = (page - 1) * rows + 1;
    const end = Math.min(page * rows, total);
    return { start, end, total };
  });

  // Skeleton rows for loading UI
  readonly skeletonRows = Array.from({ length: 8 });

  toggleSort(column: keyof User): void {
    const current = this.currentSort();
    if (current?.column === column) {
      this.currentSort.set({ column, direction: current.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      this.currentSort.set({ column, direction: 'asc' });
    }
  }

  sortIcon(column: keyof User): string {
    const current = this.currentSort();
    if (!current || current.column !== column) return '⇅';
    return current.direction === 'asc' ? '↑' : '↓';
  }

  singleArrowSortIcon(column: keyof User): string {
    const current = this.currentSort();
    if (!current || current.column !== column) return '↑';
    return current.direction === 'asc' ? '↑' : '↓';
  }

  setFilter(key: string, value: string): void {
    this.filters.update((state) => ({ ...state, [key]: value }));
    this.currentPage.set(1);
  }

  statusClass(status: UserStatus): string {
    return status === 'ACTIVE' ? 'status-completed' : 'status-new';
  }

  statusActionLabel(user: User): string {
    return user.status === 'ACTIVE' ? 'Deactivate' : 'Activate';
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
    if (this.currentPage() < this.totalPages()) this.currentPage.update((p) => p + 1);
  }

  prevPage(): void {
    if (this.currentPage() > 1) this.currentPage.update((p) => p - 1);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  trackUser(index: number, user: User): string {
    return user.id;
  }

  /** Returns the 1-based serial number for a row, accounting for the current page */
  serialOf(index: number): number {
    return (this.currentPage() - 1) * this.rowsPerPage() + index + 1;
  }

  /** Formats an ISO date string to a readable short format */
  formatDate(date?: string): string {
    if (!date) return '—';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
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
      error: (err) => {
        const status = err?.status;
        const backendMessage = err?.error?.message || err?.error?.error || '';
        const deleteNotSupported =
          typeof backendMessage === 'string' &&
          backendMessage.toLowerCase().includes("request method 'delete' is not supported");

        if (status === 404 || status === 405 || deleteNotSupported) {
          this.actionError.set('Delete endpoint is not available in backend yet.');
        } else {
          this.actionError.set(err?.error?.message || 'Failed to delete user.');
        }
        this.deletingUserId.set(null);
      },
    });
  }

  toggleUserStatus(user: User): void {
    const nextStatus = this.nextStatus(user.status);
    const actionLabel = nextStatus === 'ACTIVE' ? 'activate' : 'deactivate';

    if (!window.confirm(`${actionLabel[0].toUpperCase()}${actionLabel.slice(1)} user ${user.displayName}?`)) {
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
        this.actionMessage.set(`User ${user.displayName} ${nextStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully.`);
        this.statusUpdatingUserId.set(null);
      },
      error: (err) => {
        this.actionError.set(err?.error?.message || 'Failed to update user status.');
        this.statusUpdatingUserId.set(null);
      },
    });
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    this.actionError.set('');

    this.iamService.getUsers({ page: 1, limit: 1000 }).subscribe({
      next: (users) => {
        this.allUsers.set(users);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.actionError.set(err?.error?.message || 'Failed to load users.');
        this.isLoading.set(false);
      },
    });
  }

  private nextStatus(status: UserStatus): UserStatus {
    return status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  }

  private matchesDateFilter(date: string | undefined, filter: string): boolean {
    if (!filter) return true;
    return this.toDateInputValue(date) === filter;
  }

  private toDateInputValue(date?: string): string {
    if (!date) return '';

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return '';

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private compareRows(a: User, b: User, column: keyof User, direction: SortDirection): number {
    let valA: any = a[column];
    let valB: any = b[column];
    if (column === 'roles') {
      valA = a.roles[0]?.name || '';
      valB = b.roles[0]?.name || '';
    }
    if (typeof valA === 'string' && typeof valB === 'string') {
      return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  }
}
