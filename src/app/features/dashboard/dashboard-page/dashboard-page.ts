import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectDialog } from '../../projects/project-dialog/project-dialog';
import { ProjectProgress, projectProgress } from '../../projects/project-progress';
import { ProjectsService } from '../../projects/services/projects.service';
import { ProjectDto, Task } from '../../tasks/models/task.model';
import { isoDateFromToday } from '../../tasks/models/task.utils';
import { TasksService } from '../../tasks/services/tasks.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [DatePipe, RouterLink, ProjectDialog],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  private readonly projectsService = inject(ProjectsService);
  private readonly tasksService = inject(TasksService);

  protected readonly projects = this.projectsService.projects;
  protected readonly projectsLoaded = this.projectsService.loaded;
  protected readonly tasksLoaded = this.tasksService.loaded;

  protected readonly today = new Date();
  protected readonly greeting = this.greetingFor(this.today.getHours());

  // Progress of every project, worked out from the loaded tasks.
  protected readonly progressByProject = computed(() => {
    const groups = new Map<number, Task[]>();
    for (const task of this.tasksService.tasks()) {
      const group = groups.get(task.projectId) ?? [];
      group.push(task);
      groups.set(task.projectId, group);
    }

    const result = new Map<number, ProjectProgress>();
    for (const [projectId, tasks] of groups) {
      result.set(projectId, projectProgress(tasks));
    }
    return result;
  });

  protected readonly emptyProgress = projectProgress([]);

  // Unfinished tasks that are overdue or due within the next 7 days, soonest first.
  protected readonly dueThisWeek = computed(() => {
    const lastDay = isoDateFromToday(7);
    return this.tasksService
      .tasks()
      .filter(
        (task) =>
          task.dueDate && task.status !== 'COMPLETED' && task.dueDate.slice(0, 10) <= lastDay,
      )
      .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
      .slice(0, 6);
  });

  protected readonly creating = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);

  constructor() {
    this.projectsService.refreshProjects();
    this.tasksService.loadTasks();
  }

  protected progressOf(projectId: number): ProjectProgress {
    return this.progressByProject().get(projectId) ?? this.emptyProgress;
  }

  protected projectTitle(projectId: number): string {
    return this.projects().find((project) => project.id === projectId)?.title ?? '';
  }

  protected isOverdueDate(dueDate: string): boolean {
    return dueDate.slice(0, 10) < isoDateFromToday(0);
  }

  protected openCreate(): void {
    this.saveError.set(null);
    this.creating.set(true);
  }

  protected closeCreate(): void {
    this.creating.set(false);
    this.saving.set(false);
  }

  protected save(dto: ProjectDto): void {
    this.saving.set(true);
    this.saveError.set(null);

    this.projectsService.createProject(dto).subscribe({
      next: () => this.closeCreate(),
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.saveError.set(
          err.status === 400
            ? 'The name, description or color is not valid.'
            : 'Could not create the project. Try again.',
        );
      },
    });
  }

  private greetingFor(hour: number): string {
    if (hour < 12) {
      return 'Good morning';
    }
    return hour < 18 ? 'Good afternoon' : 'Good evening';
  }
}
