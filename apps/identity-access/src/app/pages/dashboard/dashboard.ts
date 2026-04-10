import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  Users,
  Clock,
  CheckCircle,
  Zap,
  List,
  TrendingUp,
  CalendarDays,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  host: { class: 'block' },
})
export class DashboardComponent {
  readonly Users = Users;
  readonly Clock = Clock;
  readonly CheckCircle = CheckCircle;
  readonly Zap = Zap;
  readonly List = List;
  readonly TrendingUp = TrendingUp;
  readonly CalendarDays = CalendarDays;
  readonly ShieldCheck = ShieldCheck;
  readonly ArrowUpRight = ArrowUpRight;

  readonly kpiCards = [
    { title: 'Total Users', value: '25', note: 'Registered accounts', trend: '+8.2% this month', icon: this.Users },
    { title: 'Roles', value: '12', note: 'Defined role sets', trend: '+1 this week', icon: this.ShieldCheck },
    { title: 'Policies', value: '34', note: 'Permission policies', trend: '+3 updated', icon: this.Zap },
    { title: 'Active Sessions', value: '19', note: 'Currently signed in', trend: 'Peak 31 today', icon: this.Clock },
    { title: 'Failed Logins (24h)', value: '7', note: 'Blocked / invalid', trend: '-2 vs yesterday', icon: this.TrendingUp },
  ];

  readonly quickActions = [
    { label: 'Add Customer', icon: this.Users },
    { label: 'Create Role', icon: this.ShieldCheck },
    { label: 'Review Policies', icon: this.Zap },
    { label: 'Audit Logs', icon: this.List },
    { label: 'Session Monitor', icon: this.Clock },
    { label: 'Security Trends', icon: this.TrendingUp },
  ];

  readonly posture = [
    { label: 'MFA Coverage', value: '62%', tone: 'gold', note: 'Users enrolled in MFA' },
    { label: 'Locked Accounts', value: '2', tone: 'slate', note: 'Temporary lockouts' },
    { label: 'Risk Status', value: 'Normal', tone: 'emerald', note: 'No active incidents' },
  ];

  readonly auditEvents = [
    { time: '2m ago', actor: 'admin', action: 'Updated role', target: 'Finance Manager', result: 'Success' },
    { time: '18m ago', actor: 'system', action: 'Token refresh', target: 'Session #A1C9', result: 'Success' },
    { time: '1h ago', actor: 'rezaur', action: 'Failed login', target: 'tenant ERP-DEFAULT', result: 'Blocked' },
    { time: '3h ago', actor: 'admin', action: 'Created user', target: 'user: arif', result: 'Success' },
    { time: 'Yesterday', actor: 'admin', action: 'Policy change', target: 'users:read → roles:read', result: 'Success' },
  ];

  get todayLabel(): string {
    return new Intl.DateTimeFormat('en', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(new Date());
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }
}
