import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@hishab-nikash/shared-auth';
import { LucideIcon } from '@hishab-nikash/shared-ui';
import {
  AuthorizationResource,
  PermissionDefinition,
  Role,
  User,
} from '@hishab-nikash/shared-models';
import { forkJoin } from 'rxjs';
import { IAMService } from '../../services/iam.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideIcon],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly iamService = inject(IAMService);
  readonly currentUser = inject(AuthService).currentUser;

  readonly isLoading = signal(true);
  readonly loadError = signal('');
  readonly users = signal<User[]>([]);
  readonly roles = signal<Role[]>([]);
  readonly permissions = signal<PermissionDefinition[]>([]);
  readonly resources = signal<AuthorizationResource[]>([]);

  readonly moduleCards = [
    {
      title: 'Sign-in',
      caption: 'Secure access',
      detail: 'Manage sign-in, session, and account access.',
      icon: 'keyRound',
    },
    {
      title: 'Users',
      caption: 'People records',
      detail: 'Create, update, list, and change user status.',
      icon: 'users',
    },
    {
      title: 'Roles',
      caption: 'Role setup',
      detail: 'Maintain roles and the permissions assigned to them.',
      icon: 'shieldCheck',
    },
    {
      title: 'Organization Access',
      caption: 'Entity access',
      detail: 'Track legal-entity and branch-level access.',
      icon: 'building2',
    },
    {
      title: 'Permissions',
      caption: 'Permission list',
      detail: 'Review the permissions available across the system.',
      icon: 'shieldEllipsis',
    },
    {
      title: 'Access Areas',
      caption: 'Access coverage',
      detail: 'Review access areas and the permissions linked to them.',
      icon: 'waypoints',
    },
  ];

  readonly activeUsersCount = computed(
    () => this.users().filter((user) => user.status === 'ACTIVE').length
  );

  readonly serviceCount = computed(() =>
    new Set(this.permissions().map((permission) => permission.service)).size
  );

  readonly currentUserAccessCount = computed(
    () => this.currentUser()?.organizationAccesses?.length ?? 0
  );

  readonly summaryCards = computed(() => [
    {
      label: 'Users',
      value: this.users().length,
      note: `${this.activeUsersCount()} active`,
      icon: 'users',
    },
    {
      label: 'Roles',
      value: this.roles().length,
      note: 'Available roles',
      icon: 'shieldCheck',
    },
    {
      label: 'Permissions',
      value: this.permissions().length,
      note: `${this.serviceCount()} services`,
      icon: 'shieldEllipsis',
    },
    {
      label: 'Access Areas',
      value: this.resources().length,
      note: 'Available access points',
      icon: 'libraryBig',
    },
    {
      label: 'Org Access',
      value: this.currentUserAccessCount(),
      note: 'Current user assignments',
      icon: 'building2',
    },
  ]);

  readonly serviceCoverage = computed(() =>
    Array.from(
      this.permissions().reduce((accumulator, permission) => {
        const currentCount = accumulator.get(permission.service) ?? 0;
        accumulator.set(permission.service, currentCount + 1);
        return accumulator;
      }, new Map<string, number>())
    )
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
  );

  readonly topRoles = computed(() =>
    [...this.roles()]
      .sort((left, right) => right.permissions.length - left.permissions.length)
      .slice(0, 5)
  );

  readonly topTenants = computed(() =>
    Array.from(
      this.users().reduce((accumulator, user) => {
        const currentCount = accumulator.get(user.tenantId) ?? 0;
        accumulator.set(user.tenantId, currentCount + 1);
        return accumulator;
      }, new Map<string, number>())
    )
      .sort((left, right) => right[1] - left[1])
      .slice(0, 4)
  );

  readonly resourceHighlights = computed(() =>
    [...this.resources()]
      .sort((left, right) => left.fullCode.localeCompare(right.fullCode))
      .slice(0, 6)
  );

  constructor() {
    this.loadDashboard();
  }

  get todayLabel(): string {
    return new Intl.DateTimeFormat('en', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(new Date());
  }

  get greeting(): string {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
      return 'Good morning';
    }

    if (currentHour < 17) {
      return 'Good afternoon';
    }

    return 'Good evening';
  }

  private loadDashboard(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    forkJoin({
      users: this.iamService.getUsers({ page: 1, limit: 1000 }),
      roles: this.iamService.getRoles(),
      permissions: this.iamService.getPermissionDefinitions(),
      resources: this.iamService.getAuthorizationResources(),
    }).subscribe({
      next: ({ users, roles, permissions, resources }) => {
        this.users.set(users);
        this.roles.set(roles);
        this.permissions.set(permissions);
        this.resources.set(resources);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.loadError.set(
          error?.error?.message || 'Failed to load dashboard information.'
        );
        this.isLoading.set(false);
      },
    });
  }
}
