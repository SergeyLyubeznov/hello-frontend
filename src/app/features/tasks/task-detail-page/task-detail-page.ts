import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { BOARD_COLUMNS, PRIORITY_META, Task } from '../models/task.model';
import { TasksService } from '../services/tasks.service';

type LoadState = 'loading' | 'ready' | 'not-found' | 'error';

@Component({
  selector: 'app-task-detail-page',
  imports: [RouterLink, ConfirmDialog],
  templateUrl: './task-detail-page.html',
  styleUrl: './task-detail-page.scss',
})
export class TaskDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tasksService = inject(TasksService);

  protected readonly id = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly state = signal<LoadState>('loading');
  protected readonly task = signal<Task | null>(null);

  protected readonly confirmingDelete = signal(false);
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  protected readonly column = computed(() =>
    BOARD_COLUMNS.find((column) => column.status === this.task()?.status),
  );

  protected readonly priority = computed(() => {
    const task = this.task();
    return task ? PRIORITY_META[task.priority] : undefined;
  });

  protected readonly deleteMessage = computed(
    () => `“${this.task()?.title}” will be permanently deleted. This can’t be undone.`,
  );

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

  protected openDeleteDialog(): void {
    this.deleteError.set(null);
    this.confirmingDelete.set(true);
  }

  protected closeDeleteDialog(): void {
    this.confirmingDelete.set(false);
  }

  protected confirmDelete(): void {
    this.deleting.set(true);
    this.deleteError.set(null);

    this.tasksService.deleteTask(this.id).subscribe({
      next: () => this.router.navigate(['/board']),
      error: () => {
        this.deleting.set(false);
        this.deleteError.set('Could not delete the task. Try again.');
      },
    });
  }
}
