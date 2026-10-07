import { Task, TaskStatus } from '../tasks/models/task.model';

export interface ProjectProgress {
  total: number;
  done: number;
  percent: number;
  byStatus: Record<TaskStatus, number>;
}

// Progress is "finished tasks out of all tasks" of one project.
export function projectProgress(tasks: Task[]): ProjectProgress {
  const byStatus: Record<TaskStatus, number> = {
    PENDING: 0,
    IN_PROGRESS: 0,
    TESTING: 0,
    COMPLETED: 0,
  };

  for (const task of tasks) {
    byStatus[task.status]++;
  }

  const total = tasks.length;
  const done = byStatus.COMPLETED;
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100), byStatus };
}
