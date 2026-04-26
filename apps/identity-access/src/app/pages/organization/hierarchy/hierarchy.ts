import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { OrganizationTree } from '@hishab-nikash/shared-models';
import { ListHeader, LucideIcon } from '@hishab-nikash/shared-ui';
import { OrganizationService } from '../../../services/organization.service';

@Component({
  selector: 'app-organization-hierarchy',
  standalone: true,
  imports: [CommonModule, ListHeader, LucideIcon],
  templateUrl: './hierarchy.html',
  styleUrl: './hierarchy.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationHierarchyComponent {
  private readonly organizationService = inject(OrganizationService);

  readonly isLoading = signal(true);
  readonly loadError = signal('');
  readonly trees = signal<OrganizationTree[]>([]);
  readonly selectedLegalEntityId = signal('');

  readonly selectedTree = computed(() => {
    const selectedId = this.selectedLegalEntityId();
    const availableTrees = this.trees();

    if (!selectedId) {
      return availableTrees[0] ?? null;
    }

    return (
      availableTrees.find((tree) => tree.legalEntityId === selectedId) ??
      availableTrees[0] ??
      null
    );
  });

  constructor() {
    this.loadHierarchy();
  }

  selectTree(legalEntityId: string): void {
    this.selectedLegalEntityId.set(legalEntityId);
  }

  branchDepartmentCount(branch: OrganizationTree['branches'][number]): number {
    return this.departmentLines(branch.departments).length;
  }

  departmentLines(
    departments: OrganizationTree['branches'][number]['departments'],
    depth = 0
  ): Array<{ id: string; code: string; name: string; status: string; depth: number }> {
    return departments.flatMap((department) => [
      {
        id: department.id,
        code: department.code,
        name: department.name,
        status: department.status,
        depth,
      },
      ...this.departmentLines(department.children, depth + 1),
    ]);
  }

  private loadHierarchy(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    this.organizationService.getOrganizationTrees().subscribe({
      next: (trees) => {
        this.trees.set(trees);
        this.selectedLegalEntityId.set(trees[0]?.legalEntityId ?? '');
        this.isLoading.set(false);
      },
      error: (error) => {
        this.loadError.set(
          error?.error?.message || 'Failed to load organization structure.'
        );
        this.isLoading.set(false);
      },
    });
  }
}
