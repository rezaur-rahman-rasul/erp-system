import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideIcon } from '../lucide-icon/lucide-icon';

@Component({
  selector: 'app-form-header',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideIcon],
  templateUrl: './form-header.html',
  styleUrls: ['./form-header.scss']
})
export class FormHeader {
  @Input() icon = 'edit';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() badge = '';
  @Input() actionText = 'Back';
  @Input() actionRoute = '';
}
