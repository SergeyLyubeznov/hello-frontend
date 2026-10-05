import { Task } from './task.model';

// A task is overdue when its due date (a "YYYY-MM-DD" string) is before today
// and the task is not finished yet.
export function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === 'COMPLETED') {
    return false;
  }

  return task.dueDate.slice(0, 10) < todayAsIsoDate();
}

function todayAsIsoDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}
