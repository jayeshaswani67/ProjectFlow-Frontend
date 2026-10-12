export type DashboardRole =
  | "Admin"
  | "Manager"
  | "Developer";

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  teamMembers: number;
  pendingReviews: number;
  pendingSubmissions: number;
}

export interface DashboardProject {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string | null;
}

export interface DashboardTask {
  id: string;
  projectId: string;
  title: string;
  status: string;
  priority: string;
  assignedTo?: string;
  dueDate?: string | null;
}

export interface DashboardTeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
}

export interface DashboardSubmission {
  id: string;
  taskId: string;
  employeeId: string;
  status: string;
  submittedAt: string;
  managerFeedback?: string | null;
}

export interface DashboardResponse {
  role: DashboardRole;

  stats: DashboardStats;

  recentProjects?: DashboardProject[];

  tasks?: DashboardTask[];

  teamMembers?: DashboardTeamMember[];

  submissions?: DashboardSubmission[];
}