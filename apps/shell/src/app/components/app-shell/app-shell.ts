import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { LucideIcon } from "@hishab-nikash/shared-ui";
import { AuthService } from "@hishab-nikash/shared-auth";

@Component({
  selector: "app-shell",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideIcon,
  ],
  templateUrl: "./app-shell.html",
  styleUrl: "./app-shell.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  currentUser = this.authService.currentUser;
  isDesktop = signal(window.innerWidth >= 1024);
  isCollapsed = signal(false);
  isMobileOpen = signal(false);

  get isSidebarOpen(): boolean {
    return this.isDesktop() || this.isMobileOpen();
  }

  @HostListener("window:resize", ["$event"])
  onResize(event: Event): void {
    const width = (event.target as Window).innerWidth;
    const desktop = width >= 1024;

    this.isDesktop.set(desktop);

    if (desktop) {
      this.isMobileOpen.set(false);
    } else {
      this.isCollapsed.set(false);
    }
  }

  toggleSidebar(): void {
    if (this.isDesktop()) {
      this.isCollapsed.update((collapsed) => !collapsed);
    } else {
      this.isMobileOpen.update((open) => !open);
    }
  }

  closeMobileSidebar(): void {
    if (!this.isDesktop()) {
      this.isMobileOpen.set(false);
    }
  }

  get pageTitle(): string {
    const path = window.location.pathname;

    if (path.includes("iam/users")) return "User Management";
    if (path.includes("iam/roles")) return "Roles & Permissions";
    if (path.includes("iam/organizations")) return "Organization Access";
    // if (path.includes("customers")) return "Customers";
    // if (path.includes("employees")) return "Employees";
    // if (path.includes("measurements")) return "Measurements";
    // if (path.includes("orders")) return "Orders";
    // if (path.includes("payments")) return "Payments";
    return "Dashboard Overview";
  }

  protected readonly navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "layoutDashboard" },
    { path: "/iam/users", label: "Users", icon: "users" },
    { path: "/iam/roles", label: "Roles", icon: "shieldCheck" },
    // { path: "/customers", label: "Customers", icon: "userCircle" },
    // { path: "/employees", label: "Employees", icon: "briefcaseBusiness" },
    // { path: "/measurements", label: "Measurements", icon: "ruler" },
    // { path: "/orders", label: "Orders", icon: "package2" },
    // { path: "/payments", label: "Payments", icon: "walletCards" },
  ];

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
