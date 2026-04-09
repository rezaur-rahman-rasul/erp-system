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
import { User } from "@hishab-nikash/shared-models";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { switchMap, tap } from "rxjs/operators";
import { RouterLink } from "@angular/router";

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

  // Sorting State
  sortColumn = signal<keyof User | "">("displayName");
  sortDirection = signal<"asc" | "desc">("asc");

  // Filtering State (Atomic signals for simpler individual inputs)
  idFilter = signal("");
  nameFilter = signal("");
  emailFilter = signal("");
  roleFilter = signal("");
  tenantFilter = signal("");
  statusFilter = signal("");

  // Combined Filters for Template
  filters = computed(() => ({
    id: this.idFilter(),
    displayName: this.nameFilter(),
    email: this.emailFilter(),
    role: this.roleFilter(),
    tenantId: this.tenantFilter(),
    status: this.statusFilter(),
  }));

  // Pagination State
  currentPage = signal(1);
  rowsPerPage = signal(10);

  // Data Loading using Signals with RxJS Interop
  private readonly users$ = toObservable(
    computed(() => ({
      page: this.currentPage(),
      limit: this.rowsPerPage(),
      sort: this.sortColumn(),
      order: this.sortDirection(),
      // In a real API, we'd add filter params here
    }))
  ).pipe(
    switchMap((params) => this.iamService.getUsers(params)),
    tap((users) => {
      // Mocked total logic for demo
      this.totalUsers.set(users.length > 0 ? 100 : 0);
    })
  );

  users = toSignal(this.users$, { initialValue: [] as User[] });
  totalUsers = signal(100); 

  // Computed: Total Pages
  totalPages = computed(() => Math.ceil(this.totalUsers() / this.rowsPerPage()));

  // Computed: Page Info
  pageInfo = computed(() => {
    const total = this.totalUsers();
    const rows = this.rowsPerPage();
    const page = this.currentPage();

    return {
      start: total === 0 ? 0 : (page - 1) * rows + 1,
      end: Math.min(page * rows, total),
      total,
    };
  });

  // Methods for Template
  toggleSort(column: keyof User): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set("asc");
    }
  }

  sortIcon(column: keyof User): string {
    if (this.sortColumn() !== column) return "↕";
    return this.sortDirection() === "asc" ? "↑" : "↓";
  }

  setFilter(column: string, value: string): void {
    switch (column) {
      case "id": this.idFilter.set(value); break;
      case "displayName": this.nameFilter.set(value); break;
      case "email": this.emailFilter.set(value); break;
      case "role": this.roleFilter.set(value); break;
      case "tenantId": this.tenantFilter.set(value); break;
      case "status": this.statusFilter.set(value); break;
    }
    this.currentPage.set(1);
  }

  statusClass(status: string): string {
    return status === "ACTIVE" ? "status-completed" : "status-new";
  }

  setRowsPerPage(rows: string | number): void {
    this.rowsPerPage.set(Number(rows));
    this.currentPage.set(1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  trackUser(index: number, user: User): string {
    return user.id;
  }

  onDelete(user: User): void {
    console.log("Delete User:", user);
  }
}
