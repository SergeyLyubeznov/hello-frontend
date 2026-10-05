import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { CreateTaskDto, Task } from '../models/task.model';

const API_URL = '/api/tasks';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly http = inject(HttpClient);

  private readonly _tasks = signal<Task[]>([]);
  readonly tasks = this._tasks.asReadonly();

  loadTasks(): void {
    this.http.get<Task[]>(API_URL).subscribe({
      next: (tasks) => this._tasks.set(tasks),
      error: (err) => console.error('Failed to load tasks', err),
    });
  }

  createTask(dto: CreateTaskDto): Observable<Task> {
    return this.http
      .post<Task>(API_URL, dto)
      .pipe(tap((task) => this._tasks.update((tasks) => [...tasks, task])));
  }
}
