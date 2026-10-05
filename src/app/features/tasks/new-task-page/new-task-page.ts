import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BOARD_COLUMNS, TaskStatus } from '../models/task.model';
import { TasksService } from '../services/tasks.service';

@Component({
  selector: 'app-new-task-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './new-task-page.html',
  styleUrl: './new-task-page.scss',
})
export class NewTaskPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly tasksService = inject(TasksService);

  protected readonly statuses = BOARD_COLUMNS;
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    status: ['PENDING' as TaskStatus],
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    this.tasksService.createTask(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/board']),
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('Could not create the task. Try again.');
      },
    });
  }
}
