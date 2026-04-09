import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListHeader, LucideIcon } from '@hishab-nikash/shared-ui';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, ListHeader, LucideIcon],
  templateUrl: './roles.html',
  styleUrls: ['./roles.scss']
})
export class RolesComponent {}
