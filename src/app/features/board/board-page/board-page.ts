import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LabelChip } from '../../../shared/components/label-chip/label-chip';
import { ToastService } from '../../../shared/services/toast.service';
import { ProjectsService } from '../../projects/services/projects.service';
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
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);
  private readonly projectsService = inject(ProjectsService);

  protected readonly tasksService = inject(TasksService);
  protected readonly columns = BOARD_COLUMNS;
  protected readonly priority = PRIORITY_META;
  protected readonly isOverdue = isOverdue;

  protected readonly projects = this.projectsService.projects;
  protected readonly projectsLoaded = this.projectsService.loaded;

  // The same page instance is reused when switching projects, so the id must be reactive.
  private readonly params = toSignal(this.route.paramMap, { requireSync: true });
  private readonly projectId = computed(() => {
    const raw = this.params().get('projectId');
    const id = Number(raw);
    return raw !== null && Number.isInteger(id) ? id : null;
  });

  protected readonly project = computed(() =>
    this.projects().find((project) => project.id === this.projectId()),
  );

  // The backend cannot filter tasks by project yet, so the board filters them here.
  protected readonly projectTasks = computed(() =>
    this.tasksService.tasks().filter((task) => task.projectId === this.projectId()),
  );

  protected readonly tasksByStatus = computed<Record<TaskStatus, Task[]>>(() => {
    const groups: Record<TaskStatus, Task[]> = {
      PENDING: [],
      IN_PROGRESS: [],
      TESTING: [],
      COMPLETED: [],
    };

    for (const task of this.projectTasks()) {
      groups[task.status].push(task);
    }

    return groups;
  });

  // The column a dragged card is currently over (to highlight it).
  protected readonly hoveredStatus = signal<TaskStatus | null>(null);

  constructor() {
    this.projectsService.loadProjects();
    this.tasksService.loadTasks();

    // Remember the open project, so "Board" in the menu comes back to it.
    effect(() => {
      const project = this.project();
      if (project) {
        this.projectsService.rememberProject(project.id);
      }
    });
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
