import { Injectable } from '@angular/core';
import {
  BaseHttpService,
  resolveServiceBaseUrl,
} from '@hishab-nikash/shared-data-access';
import {
  ApiResponse,
  ChartOfAccount,
  Currency,
  Customer,
  Employee,
  MasterDataCatalogSnapshot,
  PaymentTerm,
  Product,
  Supplier,
  TaxCode,
  UnitOfMeasure,
  Warehouse,
} from '@hishab-nikash/shared-models';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MasterDataService extends BaseHttpService {
  private readonly BASE_URL = resolveServiceBaseUrl('masterData');

  private readonly CHART_OF_ACCOUNTS_PATH = `${this.BASE_URL}/api/v1/chart-of-accounts`;
  private readonly CURRENCIES_PATH = `${this.BASE_URL}/api/v1/currencies`;
  private readonly CUSTOMERS_PATH = `${this.BASE_URL}/api/v1/customers`;
  private readonly EMPLOYEES_PATH = `${this.BASE_URL}/api/v1/employees`;
  private readonly PAYMENT_TERMS_PATH = `${this.BASE_URL}/api/v1/payment-terms`;
  private readonly PRODUCTS_PATH = `${this.BASE_URL}/api/v1/products`;
  private readonly SUPPLIERS_PATH = `${this.BASE_URL}/api/v1/suppliers`;
  private readonly TAX_CODES_PATH = `${this.BASE_URL}/api/v1/tax-codes`;
  private readonly UNITS_OF_MEASURE_PATH = `${this.BASE_URL}/api/v1/units-of-measure`;
  private readonly WAREHOUSES_PATH = `${this.BASE_URL}/api/v1/warehouses`;

  getCatalogSnapshot(): Observable<MasterDataCatalogSnapshot> {
    return forkJoin({
      chartOfAccounts: this.getChartOfAccounts(),
      currencies: this.getCurrencies(),
      customers: this.getCustomers(),
      employees: this.getEmployees(),
      paymentTerms: this.getPaymentTerms(),
      products: this.getProducts(),
      suppliers: this.getSuppliers(),
      taxCodes: this.getTaxCodes(),
      unitsOfMeasure: this.getUnitsOfMeasure(),
      warehouses: this.getWarehouses(),
    });
  }

  getChartOfAccounts(): Observable<ChartOfAccount[]> {
    return this.getList<ChartOfAccount>(this.CHART_OF_ACCOUNTS_PATH);
  }

  getCurrencies(): Observable<Currency[]> {
    return this.getList<Currency>(this.CURRENCIES_PATH);
  }

  getCustomers(): Observable<Customer[]> {
    return this.getList<Customer>(this.CUSTOMERS_PATH);
  }

  getEmployees(): Observable<Employee[]> {
    return this.getList<Employee>(this.EMPLOYEES_PATH);
  }

  getPaymentTerms(): Observable<PaymentTerm[]> {
    return this.getList<PaymentTerm>(this.PAYMENT_TERMS_PATH);
  }

  getProducts(): Observable<Product[]> {
    return this.getList<Product>(this.PRODUCTS_PATH);
  }

  getSuppliers(): Observable<Supplier[]> {
    return this.getList<Supplier>(this.SUPPLIERS_PATH);
  }

  getTaxCodes(): Observable<TaxCode[]> {
    return this.getList<TaxCode>(this.TAX_CODES_PATH);
  }

  getUnitsOfMeasure(): Observable<UnitOfMeasure[]> {
    return this.getList<UnitOfMeasure>(this.UNITS_OF_MEASURE_PATH);
  }

  getWarehouses(): Observable<Warehouse[]> {
    return this.getList<Warehouse>(this.WAREHOUSES_PATH);
  }

  private getList<T>(path: string): Observable<T[]> {
    return this.get<ApiResponse<T[]>>(path).pipe(
      map((response) => response.data ?? [])
    );
  }
}
