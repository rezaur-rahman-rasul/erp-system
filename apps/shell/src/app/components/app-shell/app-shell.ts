import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  NavigationEnd,
} from '@angular/router';
import { LucideIcon } from '@hishab-nikash/shared-ui';
import { AuthService } from '@hishab-nikash/shared-auth';

type NavItem = {
  path: string;
  label: string;
  note: string;
  icon: string;
  exact?: boolean;
};

type NavGroup = {
  id: string;
  label: string;
  note: string;
  icon: string;
  items: NavItem[];
};

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideIcon,
  ],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;
  readonly isDesktop = signal(window.innerWidth >= 1024);
  readonly isCollapsed = signal(false);
  readonly isMobileOpen = signal(false);
  readonly expandedGroupId = signal<string | null>(null);

  protected readonly navGroups: NavGroup[] = [
    {
      id: 'organization-setup',
      label: 'Organization Setup',
      note: 'Entities, branches, and structure',
      icon: 'building2',
      items: [
        {
          path: '/org/dashboard',
          label: 'Overview',
          note: 'Organization service summary',
          icon: 'layoutDashboard',
          exact: true,
        },
        {
          path: '/org/legal-entities',
          label: 'Legal Entities',
          note: 'Top-level registered entities',
          icon: 'building2',
        },
        {
          path: '/org/business-units',
          label: 'Business Units',
          note: 'Internal operating units',
          icon: 'briefcaseBusiness',
        },
        {
          path: '/org/branches',
          label: 'Branches',
          note: 'Locations and contact setup',
          icon: 'mapPinned',
        },
        {
          path: '/org/departments',
          label: 'Departments',
          note: 'Reporting lines and owners',
          icon: 'network',
        },
        {
          path: '/org/hierarchy',
          label: 'Structure',
          note: 'Entity, branch, and department tree',
          icon: 'gitBranchPlus',
        },
      ],
    },
    {
      id: 'user-access',
      label: 'User & Access',
      note: 'Accounts, roles, and coverage',
      icon: 'shieldCheck',
      items: [
        {
          path: '/dashboard',
          label: 'Overview',
          note: 'Live access and identity summary',
          icon: 'layoutDashboard',
          exact: true,
        },
        {
          path: '/iam/users',
          label: 'Users',
          note: 'User lifecycle and status',
          icon: 'users',
        },
        {
          path: '/iam/roles',
          label: 'Roles',
          note: 'Roles and included permissions',
          icon: 'shieldCheck',
        },
        {
          path: '/iam/access-catalog',
          label: 'Access Directory',
          note: 'Permissions and access areas',
          icon: 'libraryBig',
        },
      ],
    },
    {
      id: 'master-data',
      label: 'Master Data',
      note: 'Reference sets and operational masters',
      icon: 'databaseZap',
      items: [
        {
          path: '/master/dashboard',
          label: 'Overview',
          note: 'Service pulse and alignment',
          icon: 'layoutDashboard',
          exact: true,
        },
        {
          path: '/master/catalog',
          label: 'Catalog',
          note: 'All domains in one explorer',
          icon: 'tableProperties',
        },
      ],
    },
  ];

  protected readonly accessWorkspaceModules = [
    { name: 'Sign-in', description: 'Account access and sessions' },
    { name: 'Users', description: 'People and account records' },
    { name: 'Roles', description: 'Role setup and updates' },
    { name: 'Access', description: 'Access areas and checks' },
    { name: 'Permissions', description: 'Available permission list' },
  ];

  protected readonly organizationWorkspaceModules = [
    { name: 'Entities', description: 'Registered legal entities' },
    { name: 'Units', description: 'Operating unit setup' },
    { name: 'Branches', description: 'Location and contact records' },
    { name: 'Departments', description: 'Reporting structure and owners' },
    { name: 'Structure', description: 'Organization tree view' },
  ];

  protected readonly masterDataWorkspaceModules = [
    { name: 'Reference', description: 'Currencies, units, terms, and tax rules' },
    { name: 'Commercial', description: 'Customer and supplier masters' },
    { name: 'Operations', description: 'Products and warehouse records' },
    { name: 'Finance', description: 'Chart of accounts setup' },
    { name: 'People', description: 'Employee master records' },
  ];

  constructor() {
    this.syncExpandedGroup();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.syncExpandedGroup();
      }
    });
  }

  get isSidebarOpen(): boolean {
    return this.isDesktop() || this.isMobileOpen();
  }

  get isSidebarCompact(): boolean {
    return this.isDesktop() && this.isCollapsed();
  }

  get workspaceModules(): { name: string; description: string }[] {
    if (this.currentPath.startsWith('/master')) {
      return this.masterDataWorkspaceModules;
    }

    return this.currentPath.startsWith('/org')
      ? this.organizationWorkspaceModules
      : this.accessWorkspaceModules;
  }

  get pageSection(): string {
    if (this.currentPath.startsWith('/master')) {
      return 'Master Data';
    }

    return this.currentPath.startsWith('/org')
      ? 'Organization Setup'
      : 'Access Management';
  }

  get pageTitle(): string {
    const path = this.currentPath;

    if (path.includes('/org/hierarchy')) {
      return 'Organization Structure';
    }

    if (path.includes('/org/legal-entities/create')) {
      return 'Create Legal Entity';
    }

    if (path.includes('/org/legal-entities/') && path.includes('/edit')) {
      return 'Edit Legal Entity';
    }

    if (path.includes('/org/legal-entities')) {
      return 'Legal Entities';
    }

    if (path.includes('/org/business-units/create')) {
      return 'Create Business Unit';
    }

    if (path.includes('/org/business-units/') && path.includes('/edit')) {
      return 'Edit Business Unit';
    }

    if (path.includes('/org/business-units')) {
      return 'Business Units';
    }

    if (path.includes('/org/branches/create')) {
      return 'Create Branch';
    }

    if (path.includes('/org/branches/') && path.includes('/edit')) {
      return 'Edit Branch';
    }

    if (path.includes('/org/branches')) {
      return 'Branches';
    }

    if (path.includes('/org/departments/create')) {
      return 'Create Department';
    }

    if (path.includes('/org/departments/') && path.includes('/edit')) {
      return 'Edit Department';
    }

    if (path.includes('/org/departments')) {
      return 'Departments';
    }

    if (path.includes('/org/dashboard')) {
      return 'Organization Overview';
    }

    if (path.includes('/master/catalog')) {
      return 'Master Data Catalog';
    }

    if (path.includes('/master/dashboard')) {
      return 'Master Data Overview';
    }

    if (path.includes('/iam/access-catalog')) {
      return 'Access Directory';
    }

    if (path.includes('/iam/users/create')) {
      return 'Create User';
    }

    if (path.includes('/iam/users/') && path.includes('/edit')) {
      return 'Edit User';
    }

    if (path.includes('/iam/users')) {
      return 'User Management';
    }

    if (path.includes('/iam/roles/create')) {
      return 'Create Role';
    }

    if (path.includes('/iam/roles/') && path.includes('/edit')) {
      return 'Edit Role';
    }

    if (path.includes('/iam/roles')) {
      return 'Roles and Permissions';
    }

    return 'Overview';
  }

  get pageSubtitle(): string {
    const path = this.currentPath;

    if (path.includes('/org/hierarchy')) {
      return 'Inspect the current legal entity, branch, and department structure.';
    }

    if (path.includes('/org/legal-entities')) {
      return 'Manage legal entity identity, finance base, and lifecycle details.';
    }

    if (path.includes('/org/business-units')) {
      return 'Manage operating units and the teams responsible for them.';
    }

    if (path.includes('/org/branches')) {
      return 'Manage branch locations, contact details, and operating status.';
    }

    if (path.includes('/org/departments')) {
      return 'Manage reporting lines, department heads, and branch alignment.';
    }

    if (path.includes('/org/dashboard')) {
      return 'Manage legal entities, units, branches, and departments from one workspace.';
    }

    if (path.includes('/master/catalog')) {
      return 'Browse reference data, commercial parties, operational masters, finance structure, and people records from one catalog.';
    }

    if (path.includes('/master/dashboard')) {
      return 'Monitor master-data coverage, service alignment, and domain readiness from one workspace.';
    }

    if (path.includes('/iam/access-catalog')) {
      return 'Browse permissions, access areas, and role setup details.';
    }

    if (path.includes('/iam/users')) {
      return 'Manage user details, roles, and organization access.';
    }

    if (path.includes('/iam/roles')) {
      return 'Manage role details, permissions, and access coverage.';
    }

    return 'Manage people, roles, and access from one workspace.';
  }

  get todayLabel(): string {
    return new Intl.DateTimeFormat('en', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(new Date());
  }

  private get currentPath(): string {
    return this.router.url.split('?')[0];
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const width = (event.target as Window).innerWidth;
    const desktop = width >= 1024;

    this.isDesktop.set(desktop);

    if (desktop) {
      this.isMobileOpen.set(false);
      return;
    }

    this.isCollapsed.set(false);
  }

  toggleSidebar(): void {
    if (this.isDesktop()) {
      this.isCollapsed.update((collapsed) => !collapsed);
      return;
    }

    this.isMobileOpen.update((open) => !open);
  }

  toggleGroup(groupId: string): void {
    if (this.isSidebarCompact) {
      this.isCollapsed.set(false);
      this.expandedGroupId.set(groupId);
      return;
    }

    this.expandedGroupId.update((currentGroupId) =>
      currentGroupId === groupId ? null : groupId
    );
  }

  isGroupExpanded(groupId: string): boolean {
    return this.expandedGroupId() === groupId;
  }

  isGroupActive(group: NavGroup): boolean {
    return group.items.some((item) => this.isItemActive(item));
  }

  onMenuItemClick(groupId: string): void {
    this.expandedGroupId.set(groupId);
    this.closeMobileSidebar();
  }

  linkActiveOptions(item: NavItem): { exact: boolean } {
    return { exact: !!item.exact };
  }

  closeMobileSidebar(): void {
    if (!this.isDesktop()) {
      this.isMobileOpen.set(false);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private syncExpandedGroup(): void {
    this.expandedGroupId.set(this.resolveExpandedGroup());
  }

  private resolveExpandedGroup(): string | null {
    if (this.currentPath === '/') {
      return null;
    }

    return this.navGroups.find((group) => this.isGroupActive(group))?.id ?? null;
  }

  private isItemActive(item: NavItem): boolean {
    if (item.exact) {
      return this.currentPath === item.path;
    }

    return (
      this.currentPath === item.path ||
      this.currentPath.startsWith(`${item.path}/`)
    );
  }
}
