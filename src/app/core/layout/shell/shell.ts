import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ProjectsService } from '../../../features/projects/services/projects.service';
import { ToastHost } from '../../../shared/components/toast-host/toast-host';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastHost],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly projectsService = inject(ProjectsService);

  protected readonly projects = this.projectsService.projects;

  constructor() {
    this.projectsService.loadProjects();
  }
}
