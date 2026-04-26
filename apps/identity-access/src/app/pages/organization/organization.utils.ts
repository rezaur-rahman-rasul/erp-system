export type SortDirection = 'asc' | 'desc';

export const ORGANIZATION_PAGE_SIZE = 12;
export const ORGANIZATION_FETCH_SIZE = 500;

export const organizationStatuses = ['ACTIVE', 'INACTIVE'];

export const fiscalMonthOptions = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export const timezoneOptions = [
  'Asia/Dhaka',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Europe/London',
  'UTC',
];

export function formatDateTime(value?: string): string {
  if (!value) {
    return '--';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '--';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(parsed);
}

export function toDateInputValue(value?: string): string {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function matchesDateFilter(value: string | undefined, filter: string): boolean {
  if (!filter) {
    return true;
  }

  return toDateInputValue(value) === filter;
}

export function normalizeText(value?: string | null): string {
  return (value ?? '').trim();
}

export function nullableText(value?: string | null): string | null {
  const normalized = normalizeText(value);
  return normalized || null;
}

export function optionalText(value?: string | null): string | undefined {
  const normalized = normalizeText(value);
  return normalized || undefined;
}

export function statusBadgeClass(status?: string): string {
  return status === 'ACTIVE' ? 'status-completed' : 'status-new';
}

export function isActiveStatus(status?: string): boolean {
  return status === 'ACTIVE';
}

export function sortText(
  left: string | undefined | null,
  right: string | undefined | null,
  direction: SortDirection
): number {
  const leftValue = normalizeText(left).toLowerCase();
  const rightValue = normalizeText(right).toLowerCase();

  return direction === 'asc'
    ? leftValue.localeCompare(rightValue)
    : rightValue.localeCompare(leftValue);
}

export function sortNumber(
  left: number | undefined | null,
  right: number | undefined | null,
  direction: SortDirection
): number {
  const leftValue = left ?? 0;
  const rightValue = right ?? 0;

  if (leftValue === rightValue) {
    return 0;
  }

  return direction === 'asc'
    ? leftValue < rightValue
      ? -1
      : 1
    : leftValue > rightValue
      ? -1
      : 1;
}
