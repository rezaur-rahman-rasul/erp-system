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
import { MasterDataService } from '../../../services/master-data.service';
import {
  buildMasterDataCategoryStates,
  buildMasterDataDomainStates,
  countSnapshotRecords,
  EMPTY_MASTER_DATA_CATALOG_SNAPSHOT,
} from '../master-data.config';

@Component({
  selector: 'app-master-data-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideIcon],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MasterDataDashboardComponent {
  private readonly masterDataService = inject(MasterDataService);

  readonly currentUser = inject(AuthService).currentUser;
  readonly isLoading = signal(true);
  readonly loadError = signal('');
  readonly snapshot = signal(EMPTY_MASTER_DATA_CATALOG_SNAPSHOT);

  readonly domainStates = computed(() =>
    buildMasterDataDomainStates(this.snapshot())
  );

  readonly categoryStates = computed(() =>
    buildMasterDataCategoryStates(this.snapshot())
  );

  readonly totalRecords = computed(() => countSnapshotRecords(this.snapshot()));

  readonly totalActiveRecords = computed(() =>
    this.domainStates().reduce((sum, domain) => sum + domain.activeCount, 0)
  );

  readonly organizationLinkedDomainsCount = computed(
    () => this.domainStates().filter((domain) => domain.organizationLinked).length
  );

  readonly tenantScopedDomainsCount = computed(
    () => this.domainStates().filter((domain) => domain.tenantScoped).length
  );

  readonly summaryCards = computed(() => [
    {
      label: 'Datasets',
      value: this.domainStates().length,
      note: 'Live master-data contracts wired into the workspace',
      icon: 'databaseZap',
    },
    {
      label: 'Records',
      value: this.totalRecords(),
      note: `${this.totalActiveRecords()} active records across all domains`,
      icon: 'database',
    },
    {
      label: 'Reference Sets',
      value: this.categoryStates().find((category) => category.key === 'reference')
        ?.recordCount ?? 0,
      note: 'Reusable values for pricing, tax, and unit normalization',
      icon: 'bookCopy',
    },
    {
      label: 'Org-linked',
      value: this.organizationLinkedDomainsCount(),
      note: 'Datasets carrying legal-entity or branch dependencies',
      icon: 'building2',
    },
    {
      label: 'Tenant-scoped',
      value: this.tenantScopedDomainsCount(),
      note: 'Contracts segmented by tenant ownership',
      icon: 'binary',
    },
  ]);

  readonly busiestDomains = computed(() =>
    [...this.domainStates()]
      .sort((left, right) => right.count - left.count)
      .slice(0, 5)
  );

  readonly alignmentSignals = computed(() => [
    {
      title: 'Route alignment',
      value: '/master',
      note: 'The shell now treats Master Data as a first-class workspace beside IAM and Organization.',
    },
    {
      title: 'API surface',
      value: `${this.domainStates().length} datasets`,
      note: 'The catalog is wired to the live master-data endpoints under the shared response contract.',
    },
    {
      title: 'Organization links',
      value: `${this.organizationLinkedDomainsCount()}/${this.domainStates().length}`,
      note: 'Organization-aware datasets stay clearly separated from global reference data.',
    },
    {
      title: 'Tenant scope',
      value: `${this.tenantScopedDomainsCount()}`,
      note: 'Tenant-aware contracts are surfaced explicitly so ownership stays visible in the UI.',
    },
  ]);

  readonly quickLinks = [
    {
      title: 'Open the full catalog',
      copy: 'Inspect all master datasets and preview the live records returned by the service.',
      route: '/master/catalog',
      icon: 'tableProperties',
    },
    {
      title: 'Start with references',
      copy: 'Review currencies, units, payment terms, and tax codes before touching transactions.',
      route: '/master/catalog',
      icon: 'bookCopy',
    },
    {
      title: 'Validate operations',
      copy: 'Check product, warehouse, and employee readiness from one place.',
      route: '/master/catalog',
      icon: 'boxes',
    },
  ];

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

  trackCategory(index: number): string {
    return this.categoryStates()[index]?.key ?? `${index}`;
  }

  trackDomain(index: number): string {
    return this.domainStates()[index]?.key ?? `${index}`;
  }

  private loadDashboard(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    this.masterDataService.getCatalogSnapshot().subscribe({
      next: (snapshot) => {
        this.snapshot.set(snapshot);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.loadError.set(
          error?.error?.message || 'Failed to load the master-data overview.'
        );
        this.isLoading.set(false);
      },
    });
  }
}
