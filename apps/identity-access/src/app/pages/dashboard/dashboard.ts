import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Users, Briefcase, ShoppingBag, Clock, CheckCircle } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardComponent {
  readonly Users = Users;
  readonly Briefcase = Briefcase;
  readonly ShoppingBag = ShoppingBag;
  readonly Clock = Clock;
  readonly CheckCircle = CheckCircle;

  readonly statCards = [
    { title: 'Total Customers', value: '25', text: 'Registered customers', icon: this.Users, color: 'text-blue-500', bg: 'bg-blue-100', iconBg: 'bg-blue-50' },
    { title: 'Total Employees', value: '8', text: 'Active team members', icon: this.Briefcase, color: 'text-slate-600', bg: 'bg-slate-100', iconBg: 'bg-slate-50' },
    { title: 'Total Orders', value: '45', text: 'All recorded orders', icon: this.ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-100', iconBg: 'bg-purple-50' },
    { title: 'Pending Orders', value: '12', text: 'Need attention', icon: this.Clock, color: 'text-amber-500', bg: 'bg-amber-100', iconBg: 'bg-amber-50' },
    { title: 'Delivered Orders', value: '33', text: 'Completed successfully', icon: this.CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-100', iconBg: 'bg-emerald-50' },
  ];

  readonly employees = [
    { name: 'John Doe', phone: '01700000001', orders: 5, delivered: 3 },
    { name: 'Jane Smith', phone: '01700000002', orders: 3, delivered: 2 }
  ];
}
