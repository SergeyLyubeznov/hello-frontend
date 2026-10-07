import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, defer, tap, throwError } from 'rxjs';
import { CreateTaskDto, Task, TaskStatus, UpdateTaskDto } from '../models/task.model';

const API_URL = '/api/tasks';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly http = inject(HttpClient);

  private readonly _tasks = signal<Task[]>([]);
  readonly tasks = this._tasks.asReadonly();

  // Lets screens show progress only once the tasks are really there.
  private readonly _loaded = signal(false);
  readonly loaded = this._loaded.asReadonly();

  loadTasks(): void {
    this.http.get<Task[]>(API_URL).subscribe({
      next: (tasks) => {
        this._tasks.set(tasks);
        this._loaded.set(true);
      },
      error: (err) => console.error('Failed to load tasks', err),
    });
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${API_URL}/${id}`);
  }

  createTask(dto: CreateTaskDto): Observable<Task> {
    return this.http
      .post<Task>(API_URL, dto)
      .pipe(tap((task) => this._tasks.update((tasks) => [...tasks, task])));
  }

  updateTask(id: number, dto: UpdateTaskDto): Observable<Task> {
    return this.http
      .put<Task>(`${API_URL}/${id}`, dto)
      .pipe(
        tap((updated) =>
          this._tasks.update((tasks) => tasks.map((task) => (task.id === id ? updated : task))),
        ),
      );
  }

  deleteTask(id: number): Observable<void> {
    return this.http
      .delete<void>(`${API_URL}/${id}`)
      .pipe(tap(() => this._tasks.update((tasks) => tasks.filter((task) => task.id !== id))));
  }

  // Optimistic: the task changes column at once, and goes back if the request fails.
  moveTask(id: number, status: TaskStatus): Observable<Task> {
    return defer(() => {
      const original = this._tasks().find((task) => task.id === id);
      this.setStatusLocally(id, status);

      return this.http.patch<Task>(`${API_URL}/${id}/status`, { status }).pipe(
        tap((updated) =>
          this._tasks.update((tasks) => tasks.map((task) => (task.id === id ? updated : task))),
        ),
        catchError((error) => {
          if (original) {
            this.setStatusLocally(id, original.status);
          }
          return throwError(() => error);
        }),
      );
    });
  }

  private setStatusLocally(id: number, status: TaskStatus): void {
    this._tasks.update((tasks) =>
      tasks.map((task) => (task.id === id ? { ...task, status } : task)),
    );
  }
}
