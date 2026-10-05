import { Component, OnInit, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BOARD_COLUMNS, CreateTaskDto, PRIORITIES } from '../../models/task.model';
import { LabelsService } from '../../services/labels.service';

const EMPTY_TASK: CreateTaskDto = {
  title: '',
  description: '',
  status: 'PENDING',
  priority: 'MEDIUM',
  dueDate: null,
  labelIds: [],
};

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss',
})
export class TaskForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly labelsService = inject(LabelsService);

  readonly initialValue = input<CreateTaskDto>(EMPTY_TASK);
  readonly submitLabel = input('Save');
  readonly saving = input(false);
  readonly errorMessage = input<string | null>(null);

  readonly submitted = output<CreateTaskDto>();

  protected readonly statuses = BOARD_COLUMNS;
  protected readonly priorities = PRIORITIES;
  protected readonly labels = this.labelsService.labels;

  protected readonly form = this.fb.group({
    title: [EMPTY_TASK.title, [Validators.required, Validators.maxLength(100)]],
    description: [EMPTY_TASK.description, [Validators.maxLength(500)]],
    status: [EMPTY_TASK.status],
    priority: [EMPTY_TASK.priority],
    dueDate: [''],
    labelIds: [EMPTY_TASK.labelIds],
  });

  constructor() {
    this.labelsService.loadLabels();
  }

  ngOnInit(): void {
    const { title, description, status, priority, dueDate, labelIds } = this.initialValue();
    // A date input only understands "YYYY-MM-DD", so cut off any time part.
    this.form.reset({
      title,
      description,
      status,
      priority,
      dueDate: dueDate?.slice(0, 10) ?? '',
      labelIds,
    });
  }

  protected isLabelSelected(id: number): boolean {
    return this.form.controls.labelIds.value.includes(id);
  }

  protected toggleLabel(id: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.form.controls.labelIds.value;
    this.form.controls.labelIds.setValue(
      checked ? [...current, id] : current.filter((labelId) => labelId !== id),
    );
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { dueDate, ...task } = this.form.getRawValue();
    this.submitted.emit({ ...task, dueDate: dueDate || null });
  }
}
