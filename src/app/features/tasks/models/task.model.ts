export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'TESTING' | 'COMPLETED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Label {
  id: number;
  name: string;
  textColor: string;
  backgroundColor: string;
  // Only the labels endpoint sends this: how many tasks use the label.
  taskCount?: number;
}

export type LabelDto = Omit<Label, 'id' | 'taskCount'>;

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  labels: Label[];
  createdAt: string;
  updatedAt: string;
}

export interface PriorityOption {
  value: TaskPriority;
  label: string;
  icon: string;
  color: string;
  background: string;
}

export const PRIORITY_META: Record<TaskPriority, PriorityOption> = {
  LOW: { value: 'LOW', label: 'Low', icon: '▽', color: '#3e4856', background: '#eceef1' },
  MEDIUM: { value: 'MEDIUM', label: 'Medium', icon: '▲', color: '#7a4b05', background: '#fbefc9' },
  HIGH: { value: 'HIGH', label: 'High', icon: '▲▲', color: '#9a2a0b', background: '#fde4da' },
  CRITICAL: {
    value: 'CRITICAL',
    label: 'Critical',
    icon: '▲▲▲',
    color: '#ffffff',
    background: '#b42318',
  },
};

export const PRIORITIES: PriorityOption[] = [
  PRIORITY_META.LOW,
  PRIORITY_META.MEDIUM,
  PRIORITY_META.HIGH,
  PRIORITY_META.CRITICAL,
];

// The backend returns full labels on a task but expects only their ids when saving.
// PUT without `labelIds` clears the task's labels, so always send them.
export type CreateTaskDto = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'labels'> & {
  labelIds: number[];
};
export type UpdateTaskDto = CreateTaskDto;

export interface BoardColumn {
  status: TaskStatus;
  title: string;
  color: string;
  badgeColor: string;
  badgeBackground: string;
}

export const BOARD_COLUMNS: BoardColumn[] = [
  {
    status: 'PENDING',
    title: 'To do',
    color: '#7a8190',
    badgeColor: '#3e4856',
    badgeBackground: '#eceef1',
  },
  {
    status: 'IN_PROGRESS',
    title: 'In progress',
    color: '#4250c4',
    badgeColor: '#3730a3',
    badgeBackground: '#e3e7fb',
  },
  {
    status: 'TESTING',
    title: 'In review',
    color: '#b7791f',
    badgeColor: '#7a4b05',
    badgeBackground: '#fbefc9',
  },
  {
    status: 'COMPLETED',
    title: 'Done',
    color: '#2f855a',
    badgeColor: '#14532d',
    badgeBackground: '#d8f3e1',
  },
];
