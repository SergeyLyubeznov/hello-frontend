import { Routes } from '@angular/router';
import { Shell } from './core/layout/shell/shell';
import { BacklogPage } from './features/backlog/backlog-page/backlog-page';
import { BoardPage } from './features/board/board-page/board-page';
import { DashboardPage } from './features/dashboard/dashboard-page/dashboard-page';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', redirectTo: 'board', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardPage },
      { path: 'board', component: BoardPage },
      { path: 'backlog', component: BacklogPage },
    ],
  },
];
