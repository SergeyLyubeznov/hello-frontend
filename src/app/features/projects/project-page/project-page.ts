import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { LabelChip } from '../../../shared/components/label-chip/label-chip';
import { BOARD_COLUMNS, ProjectDto } from '../../tasks/models/task.model';
import { isOverdue } from '../../tasks/models/task.utils';
import { LabelsService } from '../../tasks/services/labels.service';
import { TasksService } from '../../tasks/services/tasks.service';
import { ProjectDialog } from '../project-dialog/project-dialog';
import { projectProgress } from '../project-progress';
import { ProjectsService } from '../services/projects.service';

@Component({
  selector: 'app-project-page',
  imports: [DatePipe, RouterLink, LabelChip, ProjectDialog, ConfirmDialog],
  templateUrl: './project-page.html',
  styleUrl: './project-page.scss',
})
export class ProjectPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectsService = inject(ProjectsService);
  private readonly tasksService = inject(TasksService);
  private readonly labelsService = inject(LabelsService);

  protected readonly columns = BOARD_COLUMNS;
  protected readonly isOverdue = isOverdue;
  protected readonly projectsLoaded = this.projectsService.loaded;
  protected readonly tasksLoaded = this.tasksService.loaded;

  private readonly params = toSignal(this.route.paramMap, { requireSync: true });
  protected readonly projectId = computed(() => {
    const raw = this.params().get('id');
    const id = Number(raw);
    return raw !== null && Number.isInteger(id) ? id : null;
  });

  protected readonly project = computed(() =>
    this.projectsService.projects().find((project) => project.id === this.projectId()),
  );

  // The backend cannot filter tasks by project yet, so they are filtered here.
  private readonly tasks = computed(() =>
    this.tasksService.tasks().filter((task) => task.projectId === this.projectId()),
  );

  protected readonly progress = computed(() => projectProgress(this.tasks()));
  protected readonly labelCount = computed(() => this.labelsService.labels().length);

  // Unfinished tasks with a due date, the soonest first.
  protected readonly dueSoon = computed(() =>
    this.tasks()
      .filter((task) => task.dueDate && task.status !== 'COMPLETED')
      .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
      .slice(0, 4),
  );

  protected readonly editing = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);

  protected readonly confirmingDelete = signal(false);
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  protected readonly deleteHeading = computed(() => `Delete project “${this.project()?.title}”?`);

  protected readonly deleteMessage = computed(() => {
    const count = this.project()?.taskCount ?? this.progress().total;
    return `This permanently deletes the project with its ${count} ${count === 1 ? 'task' : 'tasks'}. This can’t be undone.`;
  });

  constructor() {
    this.projectsService.refreshProjects();
    this.tasksService.loadTasks();
    this.labelsService.loadLabels();
  }

  protected openEdit(): void {
    this.saveError.set(null);
    this.editing.set(true);
  }

  protected closeEdit(): void {
    this.editing.set(false);
    this.saving.set(false);
  }

  protected save(dto: ProjectDto): void {
    const project = this.project();
    if (!project) {
      return;
    }

    this.saving.set(true);
    this.saveError.set(null);

    this.projectsService.updateProject(project.id, dto).subscribe({
      next: () => {
        this.closeEdit();
        // The update response has no fresh task count when the list was loaded without it.
        this.projectsService.refreshProjects();
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.saveError.set(
          err.status === 400
            ? 'The name, description or color is not valid.'
            : 'Could not save the project. Try again.',
        );
      },
    });
  }

  // "Delete project" in the edit dialog hands over to the confirmation dialog.
  protected askDelete(): void {
    this.closeEdit();
    this.deleteError.set(null);
    this.confirmingDelete.set(true);
  }

  protected cancelDelete(): void {
    this.confirmingDelete.set(false);
    this.deleting.set(false);
  }

  protected confirmDelete(): void {
    const project = this.project();
    if (!project) {
      return;
    }

    this.deleting.set(true);
    this.deleteError.set(null);

    this.projectsService.deleteProject(project.id).subscribe({
      next: () => {
        // The backend deleted the project's tasks too.
        this.tasksService.loadTasks();
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.deleting.set(false);
        this.deleteError.set('Could not delete the project. Try again.');
      },
    });
  }
}
