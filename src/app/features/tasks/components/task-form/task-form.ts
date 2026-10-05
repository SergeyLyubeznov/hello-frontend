import { Component, OnInit, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BOARD_COLUMNS, CreateTaskDto, PRIORITIES } from '../../models/task.model';

const EMPTY_TASK: CreateTaskDto = {
  title: '',
  description: '',
  status: 'PENDING',
  priority: 'MEDIUM',
};

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss',
})
export class TaskForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly initialValue = input<CreateTaskDto>(EMPTY_TASK);
  readonly submitLabel = input('Save');
  readonly saving = input(false);
  readonly errorMessage = input<string | null>(null);

  readonly submitted = output<CreateTaskDto>();

  protected readonly statuses = BOARD_COLUMNS;
  protected readonly priorities = PRIORITIES;

  protected readonly form = this.fb.group({
    title: [EMPTY_TASK.title, [Validators.required, Validators.maxLength(100)]],
    description: [EMPTY_TASK.description, [Validators.maxLength(500)]],
    status: [EMPTY_TASK.status],
    priority: [EMPTY_TASK.priority],
  });

  ngOnInit(): void {
    const { title, description, status, priority } = this.initialValue();
    this.form.reset({ title, description, status, priority });
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }
}
