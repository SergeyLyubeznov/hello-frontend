import { Routes } from '@angular/router';
import { BoardPage } from './features/board/board-page/board-page';

export const routes: Routes = [
  { path: '', redirectTo: 'board', pathMatch: 'full' },
  { path: 'board', component: BoardPage },
];
