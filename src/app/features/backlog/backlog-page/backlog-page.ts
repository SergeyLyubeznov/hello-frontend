import { Component } from '@angular/core';
import { InDevelopment } from '../../../shared/components/in-development/in-development';

@Component({
  selector: 'app-backlog-page',
  imports: [InDevelopment],
  templateUrl: './backlog-page.html',
  styleUrl: './backlog-page.scss',
})
export class BacklogPage {}
