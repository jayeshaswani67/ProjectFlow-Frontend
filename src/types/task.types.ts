// ============================================================
// TASK ROLE
// ============================================================

export type TaskUserRole =
  | "Admin"
  | "Manager"
  | "Developer";

// Developer is displayed as Employee.
export type TaskRoleLabel =
  | "Admin"
  | "Manager"
  | "Employee";


// ============================================================
// TASK STATUS
// ============================================================

export type TaskStatus =
  | "Todo"
  | "InProgress"
  | "Submitted"
  | "ChangesRequested"
  | "Completed";


// ============================================================
// TASK PRIORITY
// ============================================================

export type TaskPriority =
  | "Low"
  | "Medium"
  | "High"
  | "Critical";


// ============================================================
// TASK USER
// ============================================================

export interface TaskUser {
  id: string;

  name: string;

  email: string;

  role: TaskUserRole;
}


// ============================================================
// BASE TASK
// ============================================================

export interface Task {
  id: string;

  projectId: string;

  title: string;

  description?: string;

  status: TaskStatus;

  priority: TaskPriority;

  assignedTo?: string | null;

  dueDate?: string | null;

  createdAt?: string;

  updatedAt?: string;
}


// ============================================================
// ADMIN TASK
// ============================================================

export interface AdminTask extends Task {
  projectName?: string;

  assignedUser?: TaskUser | null;

  createdBy?: string;

  createdByName?: string;
}


// ============================================================
// MANAGER TASK
// ============================================================

export interface ManagerTask extends Task {
  projectName?: string;

  assignedTo: string;

  assignedUser?: TaskUser | null;

  submissionStatus?: string | null;
}


// ============================================================
// EMPLOYEE TASK
// ============================================================

export interface EmployeeTask extends Task {
  projectName?: string;

  assignedTo: string;

  manager?: TaskUser | null;

  submissionStatus?: string | null;

  managerFeedback?: string | null;

  submittedAt?: string | null;
}


// ============================================================
// CREATE TASK
// ============================================================

export interface CreateTaskRequest {
  projectId: string;

  title: string;

  description?: string;

  priority: TaskPriority;

  assignedTo?: string | null;

  dueDate?: string | null;
}


// ============================================================
// UPDATE TASK
// ============================================================

export interface UpdateTaskRequest {
  title: string;

  description?: string;

  status: TaskStatus;

  priority: TaskPriority;

  assignedTo?: string | null;

  dueDate?: string | null;
}


// ============================================================
// EMPLOYEE STATUS UPDATE
// ============================================================

export interface UpdateTaskStatusRequest {
  status:
    | "Todo"
    | "InProgress"
    | "Submitted"
    | "ChangesRequested"
    | "Completed";
}

// ============================================================
// TASK SUMMARY
// ============================================================

export interface TaskSummary {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  today: number;
  overdue: number;
}


// ============================================================
// TASK FILTERS
// ============================================================

export interface TaskFilters {
  search?: string;

  status?: TaskStatus | "All";

  priority?: TaskPriority | "All";

  projectId?: string;

  assignedTo?: string;

  page?: number;

  pageSize?: number;
}