import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LabelChip } from '../../../shared/components/label-chip/label-chip';
import { ToastService } from '../../../shared/services/toast.service';
import { TasksService } from '../../tasks/services/tasks.service';
import { BOARD_COLUMNS, PRIORITY_META, Task, TaskStatus } from '../../tasks/models/task.model';
import { isOverdue } from '../../tasks/models/task.utils';

@Component({
  selector: 'app-board-page',
  imports: [DatePipe, RouterLink, LabelChip, CdkDropListGroup, CdkDropList, CdkDrag],
  templateUrl: './board-page.html',
  styleUrl: './board-page.scss',
})
export class BoardPage {
  private readonly toastService = inject(ToastService);

  protected readonly tasksService = inject(TasksService);
  protected readonly columns = BOARD_COLUMNS;
  protected readonly priority = PRIORITY_META;
  protected readonly isOverdue = isOverdue;
  protected readonly tasksByStatus = computed<Record<TaskStatus, Task[]>>(() => {
    const groups: Record<TaskStatus, Task[]> = {
      PENDING: [],
      IN_PROGRESS: [],
      TESTING: [],
      COMPLETED: [],
    };

    for (const task of this.tasksService.tasks()) {
      groups[task.status].push(task);
    }

    return groups;
  });

  // The column a dragged card is currently over (to highlight it).
  protected readonly hoveredStatus = signal<TaskStatus | null>(null);

  constructor() {
    this.tasksService.loadTasks();
  }

  // Only moves between columns are saved: the backend has no order inside a column.
  protected onDrop(event: CdkDragDrop<TaskStatus, TaskStatus, Task>, target: TaskStatus): void {
    this.hoveredStatus.set(null);

    const task = event.item.data;
    if (event.previousContainer === event.container || task.status === target) {
      return;
    }

    this.tasksService.moveTask(task.id, target).subscribe({
      error: () => this.reportMoveError(task, target),
    });
  }

  // A toast stays visible wherever the board is scrolled and does not shift the layout.
  private reportMoveError(task: Task, target: TaskStatus): void {
    const column = BOARD_COLUMNS.find((c) => c.status === target);
    this.toastService.show(
      `Could not move “${task.title}” to ${column?.title ?? target}. It was put back.`,
    );
  }
}
