import { MasterDataCatalogSnapshot } from '@hishab-nikash/shared-models';

export type MasterDataCategoryKey =
  | 'reference'
  | 'commercial'
  | 'operations'
  | 'finance'
  | 'workforce';

export type MasterDataTone =
  | 'success'
  | 'neutral'
  | 'soft'
  | 'warning'
  | 'accent';

export type MasterDataDomainKey = keyof MasterDataCatalogSnapshot;

export type MasterDataPreviewColumn = {
  label: string;
  value: (record: any) => string;
  tone?: (record: any) => MasterDataTone | null;
};

export type MasterDataDomainConfig = {
  key: MasterDataDomainKey;
  title: string;
  category: MasterDataCategoryKey;
  icon: string;
  summary: string;
  endpoint: string;
  permission: string;
  dependencies: string[];
  tenantScoped: boolean;
  organizationLinked: boolean;
  previewColumns: MasterDataPreviewColumn[];
};

export type MasterDataCategoryConfig = {
  key: MasterDataCategoryKey;
  title: string;
  icon: string;
  description: string;
};

export type MasterDataDomainState = MasterDataDomainConfig & {
  records: any[];
  previewRows: any[];
  count: number;
  activeCount: number;
  inactiveCount: number;
  lastUpdatedLabel: string;
};

export type MasterDataCategoryState = MasterDataCategoryConfig & {
  domainCount: number;
  recordCount: number;
  activeCount: number;
  domains: MasterDataDomainState[];
};

export const EMPTY_MASTER_DATA_CATALOG_SNAPSHOT: MasterDataCatalogSnapshot = {
  chartOfAccounts: [],
  currencies: [],
  customers: [],
  employees: [],
  paymentTerms: [],
  products: [],
  suppliers: [],
  taxCodes: [],
  unitsOfMeasure: [],
  warehouses: [],
};

export const MASTER_DATA_CATEGORY_CONFIG: MasterDataCategoryConfig[] = [
  {
    key: 'reference',
    title: 'Reference Foundations',
    icon: 'bookCopy',
    description:
      'Shared values and calculation rules reused across the ERP workflow.',
  },
  {
    key: 'commercial',
    title: 'Commercial Parties',
    icon: 'briefcaseBusiness',
    description:
      'Customers and suppliers anchored to tenant and legal-entity context.',
  },
  {
    key: 'operations',
    title: 'Operations and Logistics',
    icon: 'boxes',
    description:
      'Product and warehouse records that drive stock movement and fulfillment.',
  },
  {
    key: 'finance',
    title: 'Finance Structure',
    icon: 'landmark',
    description:
      'Posting and taxation references used to keep financial records aligned.',
  },
  {
    key: 'workforce',
    title: 'People Records',
    icon: 'idCard',
    description:
      'Employee master records connected to the right legal entity and tenant.',
  },
];

export const MASTER_DATA_DOMAIN_CONFIG: MasterDataDomainConfig[] = [
  {
    key: 'currencies',
    title: 'Currencies',
    category: 'reference',
    icon: 'coins',
    summary: 'Code, symbol, and decimal precision definitions for pricing and reporting.',
    endpoint: '/api/v1/currencies',
    permission: 'master-data:currency:*',
    dependencies: ['Shared reference'],
    tenantScoped: false,
    organizationLinked: false,
    previewColumns: [
      { label: 'Code', value: (record) => formatNullable(record.code) },
      { label: 'Name', value: (record) => formatNullable(record.name) },
      { label: 'Symbol', value: (record) => formatNullable(record.symbol) },
      {
        label: 'State',
        value: (record) => booleanLabel(record.active, 'Active', 'Inactive'),
        tone: (record) => (record.active ? 'success' : 'neutral'),
      },
    ],
  },
  {
    key: 'unitsOfMeasure',
    title: 'Units of Measure',
    category: 'reference',
    icon: 'ruler',
    summary: 'Reusable measurement rules that products and stock records depend on.',
    endpoint: '/api/v1/units-of-measure',
    permission: 'master-data:uom:*',
    dependencies: ['Products'],
    tenantScoped: false,
    organizationLinked: false,
    previewColumns: [
      { label: 'Code', value: (record) => formatNullable(record.code) },
      { label: 'Category', value: (record) => formatNullable(record.category) },
      {
        label: 'Base',
        value: (record) => booleanLabel(record.baseUnit, 'Base', 'Derived'),
        tone: (record) => (record.baseUnit ? 'accent' : 'soft'),
      },
      {
        label: 'Factor',
        value: (record) => formatNumeric(record.conversionFactor),
      },
    ],
  },
  {
    key: 'paymentTerms',
    title: 'Payment Terms',
    category: 'reference',
    icon: 'calendarClock',
    summary: 'Due-day and discount rules reused by purchasing and receivables.',
    endpoint: '/api/v1/payment-terms',
    permission: 'master-data:payment-term:*',
    dependencies: ['Customers', 'Suppliers'],
    tenantScoped: false,
    organizationLinked: false,
    previewColumns: [
      { label: 'Code', value: (record) => formatNullable(record.code) },
      { label: 'Name', value: (record) => formatNullable(record.name) },
      {
        label: 'Due',
        value: (record) => `${record.dueDays ?? 0} day(s)`,
      },
      {
        label: 'Discount',
        value: (record) =>
          record.discountPercentage === null ||
          record.discountPercentage === undefined
            ? '--'
            : `${formatNumeric(record.discountPercentage)}%`,
      },
    ],
  },
  {
    key: 'taxCodes',
    title: 'Tax Codes',
    category: 'reference',
    icon: 'receiptText',
    summary: 'Tax rules shared across products, invoices, and ledgers.',
    endpoint: '/api/v1/tax-codes',
    permission: 'master-data:tax-code:*',
    dependencies: ['Organization legal entities', 'Transaction calculations'],
    tenantScoped: true,
    organizationLinked: true,
    previewColumns: [
      { label: 'Code', value: (record) => formatNullable(record.code) },
      { label: 'Rate', value: (record) => `${formatNumeric(record.rate)}%` },
      {
        label: 'Mode',
        value: (record) => booleanLabel(record.inclusive, 'Inclusive', 'Exclusive'),
        tone: (record) => (record.inclusive ? 'accent' : 'soft'),
      },
      {
        label: 'State',
        value: (record) => booleanLabel(record.active, 'Active', 'Inactive'),
        tone: (record) => (record.active ? 'success' : 'neutral'),
      },
    ],
  },
  {
    key: 'customers',
    title: 'Customers',
    category: 'commercial',
    icon: 'handshake',
    summary: 'Customer masters tied to tenant context and legal-entity ownership.',
    endpoint: '/api/v1/customers',
    permission: 'master-data:customer:*',
    dependencies: ['Tenant access', 'Organization legal entities'],
    tenantScoped: true,
    organizationLinked: true,
    previewColumns: [
      { label: 'Code', value: (record) => formatNullable(record.code) },
      { label: 'Name', value: (record) => formatNullable(record.name) },
      { label: 'Entity', value: (record) => compactIdentifier(record.legalEntityId) },
      { label: 'Contact', value: (record) => formatNullable(record.email || record.phone) },
    ],
  },
  {
    key: 'suppliers',
    title: 'Suppliers',
    category: 'commercial',
    icon: 'truck',
    summary: 'Supplier masters aligned to purchasing, settlement, and tax context.',
    endpoint: '/api/v1/suppliers',
    permission: 'master-data:supplier:*',
    dependencies: ['Tenant access', 'Organization legal entities'],
    tenantScoped: true,
    organizationLinked: true,
    previewColumns: [
      { label: 'Code', value: (record) => formatNullable(record.code) },
      { label: 'Name', value: (record) => formatNullable(record.name) },
      { label: 'Entity', value: (record) => compactIdentifier(record.legalEntityId) },
      { label: 'Contact', value: (record) => formatNullable(record.email || record.phone) },
    ],
  },
  {
    key: 'products',
    title: 'Products',
    category: 'operations',
    icon: 'packageSearch',
    summary: 'Sellable and stock-managed items connected to UoM and entity ownership.',
    endpoint: '/api/v1/products',
    permission: 'master-data:product:*',
    dependencies: ['Units of measure', 'Organization legal entities'],
    tenantScoped: true,
    organizationLinked: true,
    previewColumns: [
      { label: 'Code', value: (record) => formatNullable(record.code) },
      { label: 'Name', value: (record) => formatNullable(record.name) },
      { label: 'UoM', value: (record) => compactIdentifier(record.unitOfMeasureId) },
      {
        label: 'State',
        value: (record) => booleanLabel(record.active, 'Active', 'Inactive'),
        tone: (record) => (record.active ? 'success' : 'neutral'),
      },
    ],
  },
  {
    key: 'warehouses',
    title: 'Warehouses',
    category: 'operations',
    icon: 'warehouse',
    summary: 'Warehouse locations linked to branches, legal entities, and stock routing.',
    endpoint: '/api/v1/warehouses',
    permission: 'master-data:warehouse:*',
    dependencies: ['Branches', 'Organization legal entities'],
    tenantScoped: true,
    organizationLinked: true,
    previewColumns: [
      { label: 'Code', value: (record) => formatNullable(record.code) },
      { label: 'Name', value: (record) => formatNullable(record.name) },
      { label: 'Branch', value: (record) => compactIdentifier(record.branchId) },
      { label: 'Location', value: (record) => formatNullable(record.locationCode) },
    ],
  },
  {
    key: 'chartOfAccounts',
    title: 'Chart of Accounts',
    category: 'finance',
    icon: 'notebookTabs',
    summary: 'Financial posting structure aligned to entity ownership and posting rules.',
    endpoint: '/api/v1/chart-of-accounts',
    permission: 'master-data:chart-of-account:*',
    dependencies: ['Organization legal entities', 'Financial posting rules'],
    tenantScoped: true,
    organizationLinked: true,
    previewColumns: [
      { label: 'Code', value: (record) => formatNullable(record.code) },
      { label: 'Name', value: (record) => formatNullable(record.name) },
      { label: 'Type', value: (record) => formatNullable(record.accountType) },
      {
        label: 'Posting',
        value: (record) =>
          booleanLabel(record.postingAllowed, 'Posting', 'Header only'),
        tone: (record) => (record.postingAllowed ? 'accent' : 'soft'),
      },
    ],
  },
  {
    key: 'employees',
    title: 'Employees',
    category: 'workforce',
    icon: 'badgeCheck',
    summary: 'Employee masters used by organization ownership and operational setup.',
    endpoint: '/api/v1/employees',
    permission: 'master-data:employee:*',
    dependencies: ['Tenant access', 'Organization legal entities'],
    tenantScoped: true,
    organizationLinked: true,
    previewColumns: [
      {
        label: 'Employee',
        value: (record) => formatNullable(record.employeeNumber),
      },
      { label: 'Name', value: (record) => formatNullable(record.fullName) },
      {
        label: 'Designation',
        value: (record) => formatNullable(record.designation),
      },
      {
        label: 'State',
        value: (record) => booleanLabel(record.active, 'Active', 'Inactive'),
        tone: (record) => (record.active ? 'success' : 'neutral'),
      },
    ],
  },
];

export function buildMasterDataDomainStates(
  snapshot: MasterDataCatalogSnapshot
): MasterDataDomainState[] {
  return MASTER_DATA_DOMAIN_CONFIG.map((domain) => {
    const records = [...snapshot[domain.key]];
    const activeCount = countActiveRecords(records);

    return {
      ...domain,
      records,
      previewRows: records.slice(0, 5),
      count: records.length,
      activeCount,
      inactiveCount: Math.max(records.length - activeCount, 0),
      lastUpdatedLabel: resolveLatestUpdate(records),
    };
  });
}

export function buildMasterDataCategoryStates(
  snapshot: MasterDataCatalogSnapshot
): MasterDataCategoryState[] {
  const domains = buildMasterDataDomainStates(snapshot);

  return MASTER_DATA_CATEGORY_CONFIG.map((category) => {
    const matchingDomains = domains.filter(
      (domain) => domain.category === category.key
    );

    return {
      ...category,
      domainCount: matchingDomains.length,
      recordCount: matchingDomains.reduce((sum, domain) => sum + domain.count, 0),
      activeCount: matchingDomains.reduce(
        (sum, domain) => sum + domain.activeCount,
        0
      ),
      domains: matchingDomains,
    };
  });
}

export function countSnapshotRecords(snapshot: MasterDataCatalogSnapshot): number {
  return Object.values(snapshot).reduce((sum, records) => sum + records.length, 0);
}

export function countActiveRecords(records: any[]): number {
  return records.filter((record) => Boolean(record?.active)).length;
}

export function compactIdentifier(value?: string | null): string {
  if (!value) {
    return '--';
  }

  return value.substring(0, 8).toUpperCase();
}

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

export function toneClass(tone?: MasterDataTone | null): string {
  switch (tone) {
    case 'success':
      return 'status-chip--success';
    case 'soft':
      return 'status-chip--soft';
    case 'warning':
      return 'status-chip--warning';
    case 'accent':
      return 'status-chip--accent';
    default:
      return 'status-chip--neutral';
  }
}

function booleanLabel(
  value: boolean,
  trueLabel: string,
  falseLabel: string
): string {
  return value ? trueLabel : falseLabel;
}

function formatNullable(value?: string | null): string {
  const normalized = `${value ?? ''}`.trim();
  return normalized || '--';
}

function formatNumeric(value?: number | string | null): string {
  if (value === null || value === undefined || value === '') {
    return '--';
  }

  const numericValue = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(numericValue)) {
    return '--';
  }

  return numericValue.toLocaleString('en-US', {
    maximumFractionDigits: numericValue % 1 === 0 ? 0 : 2,
  });
}

function resolveLatestUpdate(records: any[]): string {
  let latestTimestamp = 0;

  records.forEach((record) => {
    const candidate = toTimestamp(record?.lastUpdatedAt || record?.createdAt);

    if (candidate > latestTimestamp) {
      latestTimestamp = candidate;
    }
  });

  if (latestTimestamp === 0) {
    return '--';
  }

  return formatDateTime(new Date(latestTimestamp).toISOString());
}

function toTimestamp(value?: string): number {
  if (!value) {
    return 0;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}
