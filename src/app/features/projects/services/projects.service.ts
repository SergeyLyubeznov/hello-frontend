import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Project } from '../../tasks/models/task.model';

const API_URL = '/api/projects';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly http = inject(HttpClient);

  private readonly _projects = signal<Project[]>([]);
  readonly projects = this._projects.asReadonly();

  // Lets screens tell "not loaded yet" apart from "there are no projects".
  private readonly _loaded = signal(false);
  readonly loaded = this._loaded.asReadonly();

  private requested = false;

  // Fetched once without counts (withCount=false skips the extra count query on the backend).
  loadProjects(): void {
    if (this.requested) {
      return;
    }

    this.requested = true;
    this.http.get<Project[]>(API_URL, { params: { withCount: false } }).subscribe({
      next: (projects) => {
        this._projects.set(projects);
        this._loaded.set(true);
      },
      error: (err) => {
        this.requested = false;
        console.error('Failed to load projects', err);
      },
    });
  }
}
