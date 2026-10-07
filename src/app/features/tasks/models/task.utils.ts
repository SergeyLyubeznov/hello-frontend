import { Task } from './task.model';

// A task is overdue when its due date (a "YYYY-MM-DD" string) is before today
// and the task is not finished yet.
export function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === 'COMPLETED') {
    return false;
  }

  return task.dueDate.slice(0, 10) < isoDateFromToday(0);
}

// Today plus `days` days, as "YYYY-MM-DD" in the viewer's time zone.
export function isoDateFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
