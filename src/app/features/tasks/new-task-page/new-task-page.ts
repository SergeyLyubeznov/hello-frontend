import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskForm } from '../components/task-form/task-form';
import { BOARD_COLUMNS, CreateTaskDto, TaskStatus } from '../models/task.model';
import { TasksService } from '../services/tasks.service';

@Component({
  selector: 'app-new-task-page',
  imports: [RouterLink, TaskForm],
  templateUrl: './new-task-page.html',
})
export class NewTaskPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly tasksService = inject(TasksService);

  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly initialValue: CreateTaskDto = {
    title: '',
    description: '',
    status: this.initialStatus(),
    priority: 'MEDIUM',
  };

  private initialStatus(): TaskStatus {
    const status = this.route.snapshot.queryParamMap.get('status');
    const known = BOARD_COLUMNS.find((column) => column.status === status);
    return known ? known.status : 'PENDING';
  }

  protected onSubmit(dto: CreateTaskDto): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.tasksService.createTask(dto).subscribe({
      next: () => this.router.navigate(['/board']),
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('Could not create the task. Try again.');
      },
    });
  }
}
