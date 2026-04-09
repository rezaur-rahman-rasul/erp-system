import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { 
  LucideAngularModule, 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  Ruler, 
  ShoppingBag, 
  CreditCard,
  LogOut,
  Menu
} from 'lucide-angular';

@Component({
  selector: 'lib-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss'],
})
export class MainLayout {
  readonly LayoutDashboard = LayoutDashboard;
  readonly Users = Users;
  readonly UserSquare2 = UserSquare2;
  readonly Ruler = Ruler;
  readonly ShoppingBag = ShoppingBag;
  readonly CreditCard = CreditCard;
  readonly LogOut = LogOut;
  readonly Menu = Menu;
}
