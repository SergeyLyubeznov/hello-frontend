import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BOARD_COLUMNS, PRIORITY_META, Task } from '../models/task.model';
import { TasksService } from '../services/tasks.service';

type LoadState = 'loading' | 'ready' | 'not-found' | 'error';

@Component({
  selector: 'app-task-detail-page',
  imports: [RouterLink],
  templateUrl: './task-detail-page.html',
  styleUrl: './task-detail-page.scss',
})
export class TaskDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly tasksService = inject(TasksService);

  protected readonly id = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly state = signal<LoadState>('loading');
  protected readonly task = signal<Task | null>(null);

  protected readonly column = computed(() =>
    BOARD_COLUMNS.find((column) => column.status === this.task()?.status),
  );

  protected readonly priority = computed(() => {
    const task = this.task();
    return task ? PRIORITY_META[task.priority] : undefined;
  });

  constructor() {
    if (!Number.isInteger(this.id)) {
      this.state.set('not-found');
      return;
    }

    this.tasksService.getTask(this.id).subscribe({
      next: (task) => {
        this.task.set(task);
        this.state.set('ready');
      },
      error: (err: HttpErrorResponse) => {
        this.state.set(err.status === 404 ? 'not-found' : 'error');
      },
    });
  }
}
