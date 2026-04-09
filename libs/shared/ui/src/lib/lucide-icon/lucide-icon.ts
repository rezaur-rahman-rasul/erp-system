import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import * as LucideIcons from 'lucide-angular';

@Component({
  selector: 'app-lucide-icon',
  standalone: true,
  // Pick ALL icons to support dynamic string names
  imports: [CommonModule, LucideAngularModule],
  template: `
    <lucide-icon
      [img]="iconImg"
      [size]="size"
      [strokeWidth]="strokeWidth"
      [class]="class"
    ></lucide-icon>
  `,
})
export class LucideIcon {
  @Input() name: string = '';
  @Input() size: number | string = 24;
  @Input() strokeWidth: number | string = 2;
  @Input() class: string = '';

  get iconImg() {
    // Map string name to icon object
    // Users pass camelCase names like 'layoutDashboard'
    // Lucide exports them as PascalCase (e.g., LayoutDashboard)
    const iconName = this.name.charAt(0).toUpperCase() + this.name.slice(1);
    
    // Check for exact match first, then PascalCase
    const icon = (LucideIcons as any)[iconName] || (LucideIcons as any)[this.name];
    
    return icon || LucideIcons.HelpCircle;
  }
}
