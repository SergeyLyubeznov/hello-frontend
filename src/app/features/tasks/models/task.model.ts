export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'TESTING' | 'COMPLETED';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
}

export type CreateTaskDto = Omit<Task, 'id'>;

export interface BoardColumn {
  status: TaskStatus;
  title: string;
}

export const BOARD_COLUMNS: BoardColumn[] = [
  { status: 'PENDING', title: 'To do' },
  { status: 'IN_PROGRESS', title: 'In progress' },
  { status: 'TESTING', title: 'In review' },
  { status: 'COMPLETED', title: 'Done' },
];
