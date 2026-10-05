import { Component } from '@angular/core';
import { InDevelopment } from '../../../shared/components/in-development/in-development';

@Component({
  selector: 'app-dashboard-page',
  imports: [InDevelopment],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {}
