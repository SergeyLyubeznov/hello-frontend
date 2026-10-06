import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskForm } from '../components/task-form/task-form';
import { CreateTaskDto, Task, UpdateTaskDto } from '../models/task.model';
import { TasksService } from '../services/tasks.service';

type LoadState = 'loading' | 'ready' | 'not-found' | 'error';

@Component({
  selector: 'app-edit-task-page',
  imports: [RouterLink, TaskForm],
  templateUrl: './edit-task-page.html',
})
export class EditTaskPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly tasksService = inject(TasksService);

  protected readonly id = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly state = signal<LoadState>('loading');
  protected readonly task = signal<Task | null>(null);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // The form works with label ids, while the loaded task carries whole labels.
  protected readonly initialValue = computed<CreateTaskDto | null>(() => {
    const task = this.task();
    if (!task) {
      return null;
    }

    return {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      projectId: task.projectId,
      labelIds: task.labels.map((label) => label.id),
    };
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

  protected onSubmit(dto: UpdateTaskDto): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.tasksService.updateTask(this.id, dto).subscribe({
      next: () => this.router.navigate(['/tasks', this.id]),
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('Could not save the task. Try again.');
      },
    });
  }
}
