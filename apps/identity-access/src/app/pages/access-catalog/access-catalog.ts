import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ListHeader, ListOverview, LucideIcon } from '@hishab-nikash/shared-ui';
import {
  AuthorizationResource,
  PermissionDefinition,
  ResourcePermission,
} from '@hishab-nikash/shared-models';
import { forkJoin } from 'rxjs';
import { IAMService } from '../../services/iam.service';

@Component({
  selector: 'app-access-catalog',
  standalone: true,
  imports: [CommonModule, ListHeader, ListOverview, LucideIcon],
  templateUrl: './access-catalog.html',
  styleUrl: './access-catalog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessCatalogComponent {
  private readonly iamService = inject(IAMService);

  readonly isLoading = signal(true);
  readonly actionError = signal('');
  readonly query = signal('');
  readonly serviceFilter = signal('all');
  readonly selectedResourceCode = signal<string | null>(null);

  readonly permissions = signal<PermissionDefinition[]>([]);
  readonly resources = signal<AuthorizationResource[]>([]);
  readonly resourcePermissions = signal<ResourcePermission[]>([]);

  readonly guidanceItems = [
    'Use filters to narrow the list by module or name.',
    'Check an access area before adding permissions to a role.',
    'Review linked permissions to confirm the right access is assigned.',
  ];

  readonly services = computed(() =>
    Array.from(
      new Set([
        ...this.permissions().map((permission) => permission.service),
        ...this.resources().map((resource) => resource.serviceCode),
      ])
    )
      .filter(Boolean)
      .sort((left, right) => left.localeCompare(right))
  );

  readonly filteredResources = computed(() => {
    const query = this.query().trim().toLowerCase();
    const serviceFilter = this.serviceFilter();

    return this.resources()
      .filter((resource) => {
        const matchesService =
          serviceFilter === 'all' || resource.serviceCode === serviceFilter;
        const haystack = [
          resource.name,
          resource.code,
          resource.fullCode,
          resource.type,
          resource.status,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return matchesService && (query.length === 0 || haystack.includes(query));
      })
      .sort((left, right) => left.fullCode.localeCompare(right.fullCode));
  });

  readonly selectedResource = computed(() => {
    const selectedResourceCode = this.selectedResourceCode();
    const availableResources = this.filteredResources();

    if (!availableResources.length) {
      return null;
    }

    return (
      availableResources.find(
        (resource) => resource.fullCode === selectedResourceCode
      ) ?? availableResources[0]
    );
  });

  readonly selectedResourcePermissions = computed(() => {
    const resource = this.selectedResource();

    if (!resource) {
      return [];
    }

    return this.resourcePermissions()
      .filter(
        (permission) =>
          permission.resourceCode === resource.fullCode ||
          permission.resourceCode === resource.code
      )
      .sort((left, right) => left.permissionKey.localeCompare(right.permissionKey));
  });

  readonly activeResourceCount = computed(
    () =>
      this.resources().filter(
        (resource) => resource.status?.toLowerCase() === 'active'
      ).length
  );

  readonly permissionBindingCount = computed(() => this.resourcePermissions().length);

  constructor() {
    this.loadCatalog();
  }

  setQuery(value: string): void {
    this.query.set(value);
  }

  setServiceFilter(value: string): void {
    this.serviceFilter.set(value);
  }

  selectResource(resource: AuthorizationResource): void {
    this.selectedResourceCode.set(resource.fullCode);
  }

  trackByResource(_index: number, resource: AuthorizationResource): string {
    return resource.id;
  }

  trackByPermission(_index: number, permission: ResourcePermission): string {
    return permission.id;
  }

  private loadCatalog(): void {
    this.isLoading.set(true);
    this.actionError.set('');

    forkJoin({
      permissions: this.iamService.getPermissionDefinitions(),
      resources: this.iamService.getAuthorizationResources(),
      resourcePermissions: this.iamService.getResourcePermissions(),
    }).subscribe({
      next: ({ permissions, resources, resourcePermissions }) => {
        this.permissions.set(permissions);
        this.resources.set(resources);
        this.resourcePermissions.set(resourcePermissions);
        this.selectedResourceCode.set(resources[0]?.fullCode ?? null);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.actionError.set(
          error?.error?.message || 'Failed to load access information.'
        );
        this.isLoading.set(false);
      },
    });
  }
}
