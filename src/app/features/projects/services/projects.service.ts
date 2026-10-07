import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, shareReplay, tap, throwError } from 'rxjs';
import { Project, ProjectDto } from '../../tasks/models/task.model';

const API_URL = '/api/projects';
const LAST_PROJECT_KEY = 'taskboard.lastProjectId';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly http = inject(HttpClient);

  private readonly _projects = signal<Project[]>([]);
  readonly projects = this._projects.asReadonly();

  // Lets screens tell "not loaded yet" apart from "there are no projects".
  private readonly _loaded = signal(false);
  readonly loaded = this._loaded.asReadonly();

  private request: Observable<Project[]> | null = null;

  // Fetched once without counts (withCount=false skips the extra count query on the backend).
  // Several callers share the same request, and a guard can wait for it.
  whenLoaded(): Observable<Project[]> {
    this.request ??= this.http.get<Project[]>(API_URL, { params: { withCount: false } }).pipe(
      tap((projects) => {
        this._projects.set(projects);
        this._loaded.set(true);
      }),
      catchError((error) => {
        this.request = null;
        return throwError(() => error);
      }),
      shareReplay(1),
    );
    return this.request;
  }

  loadProjects(): void {
    this.whenLoaded().subscribe({
      error: (err) => console.error('Failed to load projects', err),
    });
  }

  // Always asks the backend and includes `taskCount`. Used by the Dashboard and project page.
  refreshProjects(): void {
    this.http.get<Project[]>(API_URL).subscribe({
      next: (projects) => {
        this._projects.set(projects);
        this._loaded.set(true);
      },
      error: (err) => console.error('Failed to load projects', err),
    });
  }

  createProject(dto: ProjectDto): Observable<Project> {
    return this.http
      .post<Project>(API_URL, dto)
      .pipe(tap((project) => this._projects.update((projects) => [...projects, project])));
  }

  updateProject(id: number, dto: ProjectDto): Observable<Project> {
    return this.http
      .put<Project>(`${API_URL}/${id}`, dto)
      .pipe(
        tap((updated) =>
          this._projects.update((projects) =>
            projects.map((project) => (project.id === id ? updated : project)),
          ),
        ),
      );
  }

  // The backend also deletes all the project's tasks, so callers should reload the tasks.
  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`).pipe(
      tap(() => {
        this._projects.update((projects) => projects.filter((project) => project.id !== id));
        if (this.lastProjectId() === id) {
          this.forgetProject();
        }
      }),
    );
  }

  // The project whose board was opened last, so "Board" in the menu can return to it.
  lastProjectId(): number | null {
    try {
      const value = Number(localStorage.getItem(LAST_PROJECT_KEY));
      return Number.isInteger(value) && value > 0 ? value : null;
    } catch {
      return null;
    }
  }

  rememberProject(id: number): void {
    try {
      localStorage.setItem(LAST_PROJECT_KEY, String(id));
    } catch {
      // Storage can be blocked (private mode); the app works without it.
    }
  }

  private forgetProject(): void {
    try {
      localStorage.removeItem(LAST_PROJECT_KEY);
    } catch {
      // Nothing to do when storage is blocked.
    }
  }
}
