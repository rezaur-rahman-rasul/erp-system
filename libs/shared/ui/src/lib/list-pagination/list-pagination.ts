import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-list-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-pagination.html',
  styleUrls: ['./list-pagination.scss']
})
export class ListPagination {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() rowsPerPage = 10;
  @Input() pageInfo: { start: number; end: number; total: number } = { start: 0, end: 0, total: 0 };

  @Output() rowsPerPageChange = new EventEmitter<string>();
  @Output() prevPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();
  @Output() goToPage = new EventEmitter<number>();

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
