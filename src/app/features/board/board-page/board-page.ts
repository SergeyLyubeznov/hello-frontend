import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TasksService } from '../../tasks/services/tasks.service';
import { BOARD_COLUMNS, PRIORITY_META, Task, TaskStatus } from '../../tasks/models/task.model';

@Component({
  selector: 'app-board-page',
  imports: [RouterLink],
  templateUrl: './board-page.html',
  styleUrl: './board-page.scss',
})
export class BoardPage {
  protected readonly tasksService = inject(TasksService);
  protected readonly columns = BOARD_COLUMNS;
  protected readonly priority = PRIORITY_META;
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

  constructor() {
    this.tasksService.loadTasks();
  }
}
