import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LucideIcon } from '../lucide-icon/lucide-icon';

@Component({
  selector: 'app-list-overview',
  standalone: true,
  imports: [CommonModule, LucideIcon],
  templateUrl: './list-overview.html',
  styleUrls: ['./list-overview.scss']
})
export class ListOverview {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() metricLabel = '';
  @Input() metricValue: string | number = '';
  @Input() icon = 'layoutDashboard';

  @Input() guidanceTitle = 'Guidelines';
  @Input() guidanceItems: string[] = [
    'View and manage records efficiently.',
    'Filter data using the inputs in each column.',
    'Click headers to sort the table data.',
  ];
}
