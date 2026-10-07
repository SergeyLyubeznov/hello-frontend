import {
  AfterViewInit,
  Component,
  ElementRef,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog implements AfterViewInit {
  readonly heading = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input('Confirm');
  readonly busy = input(false);
  readonly errorMessage = input<string | null>(null);

  // For dangerous actions: the user must type this text before Confirm is enabled.
  readonly requiredText = input<string | null>(null);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly typed = signal('');
  protected readonly canConfirm = computed(() => {
    const required = this.requiredText();
    return required === null || this.typed().trim() === required.trim();
  });

  ngAfterViewInit(): void {
    this.dialog().nativeElement.showModal();
  }

  protected onTyped(event: Event): void {
    this.typed.set((event.target as HTMLInputElement).value);
  }

  protected confirm(): void {
    if (this.canConfirm() && !this.busy()) {
      this.confirmed.emit();
    }
  }

  // Escape key: the browser would close the dialog itself, but the parent owns its state.
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
    if (!this.busy()) {
      this.cancelled.emit();
    }
  }
}
