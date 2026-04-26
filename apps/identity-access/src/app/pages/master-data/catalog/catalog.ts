import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  ListHeader,
  ListOverview,
  LucideIcon,
} from '@hishab-nikash/shared-ui';
import { MasterDataService } from '../../../services/master-data.service';
import {
  buildMasterDataCategoryStates,
  countSnapshotRecords,
  EMPTY_MASTER_DATA_CATALOG_SNAPSHOT,
  MASTER_DATA_CATEGORY_CONFIG,
  MasterDataCategoryKey,
  toneClass,
} from '../master-data.config';

type CategoryFilter = MasterDataCategoryKey | 'all';

@Component({
  selector: 'app-master-data-catalog',
  standalone: true,
  imports: [CommonModule, ListHeader, ListOverview, LucideIcon],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MasterDataCatalogComponent {
  private readonly masterDataService = inject(MasterDataService);

  readonly isLoading = signal(true);
  readonly loadError = signal('');
  readonly snapshot = signal(EMPTY_MASTER_DATA_CATALOG_SNAPSHOT);
  readonly selectedCategory = signal<CategoryFilter>('all');

  readonly categoryOptions = [
    { key: 'all' as const, title: 'All Areas', icon: 'layoutGrid' },
    ...MASTER_DATA_CATEGORY_CONFIG,
  ];

  readonly guidanceItems = [
    'Master Data now follows the same shell, route, and typed-contract structure as the other services.',
    'Each card shows the live API endpoint, permission family, dependencies, and a preview of current rows.',
    'Reference sets stay separated from tenant- and organization-bound records to make data ownership clearer.',
  ];

  readonly categoryStates = computed(() => {
    const categories = buildMasterDataCategoryStates(this.snapshot());
    const selected = this.selectedCategory();

    if (selected === 'all') {
      return categories;
    }

    return categories.filter((category) => category.key === selected);
  });

  readonly totalRecords = computed(() => countSnapshotRecords(this.snapshot()));

  protected readonly resolveToneClass = toneClass;

  constructor() {
    this.loadCatalog();
  }

  setCategory(category: CategoryFilter): void {
    this.selectedCategory.set(category);
  }

  isCategorySelected(category: CategoryFilter): boolean {
    return this.selectedCategory() === category;
  }

  trackByKey(index: number): string {
    return this.categoryStates()[index]?.key ?? `${index}`;
  }

  loadCatalog(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    this.masterDataService.getCatalogSnapshot().subscribe({
      next: (snapshot) => {
        this.snapshot.set(snapshot);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.loadError.set(
          error?.error?.message || 'Failed to load the master-data catalog.'
        );
        this.isLoading.set(false);
      },
    });
  }
}
