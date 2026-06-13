export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  memberId?: string | null;
  member?: Member | null;
}

export interface DashboardKPIs {
  onTimeRate: number;         
  overdueCount: number;       
  overdueUrgent: Task[];      
  weeklyVelocity: number;     
  workloadByMember: WorkloadItem[];
  statusBreakdown: StatusBreakdown;
  dueSoonTasks: Task[];       
}

export interface WorkloadItem {
  member: Member;
  todo: number;
  inProgress: number;
  done: number;
  blocked: number;
  total: number;
  overdue: number;
}

export interface StatusBreakdown {
  todo: number;
  inProgress: number;
  done: number;
  blocked: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  memberId?: string;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  completedAt?: string | null;
}
