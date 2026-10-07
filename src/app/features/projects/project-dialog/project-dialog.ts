import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Project, ProjectDto } from '../../tasks/models/task.model';
import { PROJECT_COLORS, ProjectColor } from '../project-colors';

// The backend trims the name, so a name made only of spaces counts as empty.
function notBlank(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim() ? null : { required: true };
}

@Component({
  selector: 'app-project-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './project-dialog.html',
  styleUrl: './project-dialog.scss',
})
export class ProjectDialog implements OnInit, AfterViewInit {
  private readonly fb = inject(NonNullableFormBuilder);

  // `null` means a new project is being created.
  readonly project = input<Project | null>(null);
  readonly saving = input(false);
  readonly errorMessage = input<string | null>(null);

  readonly saved = output<ProjectDto>();
  readonly cancelled = output<void>();
  readonly deleteRequested = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected colors: ProjectColor[] = PROJECT_COLORS;

  protected readonly form = this.fb.group({
    title: ['', [notBlank, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    colorId: [PROJECT_COLORS[0].id],
  });

  ngOnInit(): void {
    const project = this.project();
    if (!project) {
      return;
    }

    const match = PROJECT_COLORS.find((c) => c.color.toLowerCase() === project.color.toLowerCase());

    // A project saved with a custom color keeps it as an extra "Current" choice.
    if (!match) {
      this.colors = [{ id: 'current', name: 'Current', color: project.color }, ...PROJECT_COLORS];
    }

    this.form.reset({
      title: project.title,
      description: project.description,
      colorId: match?.id ?? 'current',
    });
  }

  ngAfterViewInit(): void {
    this.dialog().nativeElement.showModal();
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, description, colorId } = this.form.getRawValue();
    const color = this.colors.find((c) => c.id === colorId) ?? this.colors[0];
    this.saved.emit({ title: title.trim(), description, color: color.color });
  }

  // Escape key: the parent owns the dialog's state, so only report the request.
  protected onEscape(event: Event): void {
    event.preventDefault();
    this.requestCancel();
  }

  // The dialog has no padding, so a click whose target is the dialog itself hit the backdrop.
  protected onClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) {
      this.requestCancel();
    }
  }

  protected requestCancel(): void {
    if (!this.saving()) {
      this.cancelled.emit();
    }
  }
}
