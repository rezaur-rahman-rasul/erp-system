import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideIcon } from '../lucide-icon/lucide-icon';


@Component({
  selector: 'app-list-header',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideIcon],
  templateUrl: './list-header.html',
  styleUrls: ['./list-header.scss']
})
export class ListHeader {
  @Input() icon = 'layoutDashboard';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() badge = '';
  @Input() actionText = '';
  @Input() actionRoute = '';
}
