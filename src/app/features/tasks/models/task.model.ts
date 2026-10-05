export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'TESTING' | 'COMPLETED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
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

export type CreateTaskDto = Omit<Task, 'id'>;
export type UpdateTaskDto = CreateTaskDto;

export interface BoardColumn {
  status: TaskStatus;
  title: string;
  color: string;
}

export const BOARD_COLUMNS: BoardColumn[] = [
  { status: 'PENDING', title: 'To do', color: '#7a8190' },
  { status: 'IN_PROGRESS', title: 'In progress', color: '#4250c4' },
  { status: 'TESTING', title: 'In review', color: '#b7791f' },
  { status: 'COMPLETED', title: 'Done', color: '#2f855a' },
];
