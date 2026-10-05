import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { LabelChip } from '../../../shared/components/label-chip/label-chip';
import { Label, LabelDto } from '../../tasks/models/task.model';
import { LabelsService } from '../../tasks/services/labels.service';
import { LabelDialog } from '../label-dialog/label-dialog';

@Component({
  selector: 'app-labels-page',
  imports: [LabelChip, LabelDialog, ConfirmDialog],
  templateUrl: './labels-page.html',
  styleUrl: './labels-page.scss',
})
export class LabelsPage {
  private readonly labelsService = inject(LabelsService);

  protected readonly labels = this.labelsService.labels;

  // `null` = closed. `{ label: null }` = creating, `{ label }` = editing that label.
  protected readonly dialog = signal<{ label: Label | null } | null>(null);
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);

  protected readonly labelToDelete = signal<Label | null>(null);
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  protected readonly deleteHeading = computed(
    () => `Delete label “${this.labelToDelete()?.name}”?`,
  );

  protected readonly deleteMessage = computed(() => {
    const count = this.labelToDelete()?.taskCount ?? 0;
    if (count === 0) {
      return 'No task uses this label.';
    }
    return `The label will be removed from ${count} ${count === 1 ? 'task' : 'tasks'}. The tasks themselves won’t be deleted.`;
  });

  constructor() {
    this.labelsService.refreshLabels();
  }

  protected openCreate(): void {
    this.saveError.set(null);
    this.dialog.set({ label: null });
  }

  protected openEdit(label: Label): void {
    this.saveError.set(null);
    this.dialog.set({ label });
  }

  protected closeDialog(): void {
    this.dialog.set(null);
    this.saving.set(false);
  }

  protected save(dto: LabelDto): void {
    const editing = this.dialog()?.label ?? null;

    this.saving.set(true);
    this.saveError.set(null);

    const request = editing
      ? this.labelsService.updateLabel(editing.id, dto)
      : this.labelsService.createLabel(dto);

    request.subscribe({
      next: () => this.closeDialog(),
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.saveError.set(this.describeSaveError(err));
      },
    });
  }

  protected askDelete(label: Label): void {
    this.deleteError.set(null);
    this.labelToDelete.set(label);
  }

  protected cancelDelete(): void {
    this.labelToDelete.set(null);
    this.deleting.set(false);
  }

  protected confirmDelete(): void {
    const label = this.labelToDelete();
    if (!label) {
      return;
    }

    this.deleting.set(true);
    this.deleteError.set(null);

    this.labelsService.deleteLabel(label.id).subscribe({
      next: () => this.cancelDelete(),
      error: () => {
        this.deleting.set(false);
        this.deleteError.set('Could not delete the label. Try again.');
      },
    });
  }

  private describeSaveError(err: HttpErrorResponse): string {
    if (err.status === 409) {
      return 'A label with this name already exists.';
    }
    if (err.status === 400) {
      return 'The name or color is not valid.';
    }
    return 'Could not save the label. Try again.';
  }
}
