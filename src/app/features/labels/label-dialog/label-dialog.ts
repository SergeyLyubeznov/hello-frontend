import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  computed,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { LabelChip } from '../../../shared/components/label-chip/label-chip';
import { Label, LabelDto } from '../../tasks/models/task.model';
import { LABEL_COLORS, LabelColor } from '../label-colors';

// The backend trims the name, so a name made only of spaces counts as empty.
function notBlank(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim() ? null : { required: true };
}

@Component({
  selector: 'app-label-dialog',
  imports: [ReactiveFormsModule, LabelChip],
  templateUrl: './label-dialog.html',
  styleUrl: './label-dialog.scss',
})
export class LabelDialog implements OnInit, AfterViewInit {
  private readonly fb = inject(NonNullableFormBuilder);

  // `null` means a new label is being created.
  readonly label = input<Label | null>(null);
  readonly saving = input(false);
  readonly errorMessage = input<string | null>(null);

  readonly saved = output<LabelDto>();
  readonly cancelled = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected colors: LabelColor[] = LABEL_COLORS;

  protected readonly form = this.fb.group({
    name: ['', [notBlank, Validators.maxLength(50)]],
    colorId: [LABEL_COLORS[0].id],
  });

  private readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  protected readonly preview = computed<Label>(() => {
    const { name, colorId } = this.formValue();
    const color = this.colors.find((c) => c.id === colorId) ?? this.colors[0];
    return {
      id: 0,
      name: name?.trim() || 'Label name',
      textColor: color.textColor,
      backgroundColor: color.backgroundColor,
    };
  });

  ngOnInit(): void {
    const label = this.label();
    if (!label) {
      return;
    }

    const match = LABEL_COLORS.find(
      (c) =>
        c.textColor.toLowerCase() === label.textColor.toLowerCase() &&
        c.backgroundColor.toLowerCase() === label.backgroundColor.toLowerCase(),
    );

    // A label saved with custom colors keeps them as an extra "Current" choice.
    if (!match) {
      this.colors = [
        {
          id: 'current',
          name: 'Current',
          textColor: label.textColor,
          backgroundColor: label.backgroundColor,
        },
        ...LABEL_COLORS,
      ];
    }

    this.form.reset({ name: label.name, colorId: match?.id ?? 'current' });
  }

  ngAfterViewInit(): void {
    this.dialog().nativeElement.showModal();
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, colorId } = this.form.getRawValue();
    const color = this.colors.find((c) => c.id === colorId) ?? this.colors[0];
    this.saved.emit({
      name: name.trim(),
      textColor: color.textColor,
      backgroundColor: color.backgroundColor,
    });
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
