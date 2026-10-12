// ============================================================
// PROJECT ROLE
// ============================================================

export type ProjectUserRole =
  | "Admin"
  | "Manager"
  | "Developer";

// Developer is displayed as Employee in the UI.
export type ProjectRoleLabel =
  | "Admin"
  | "Manager"
  | "Employee";


// ============================================================
// PROJECT STATUS
// ============================================================

export type ProjectStatus =
  | "Planning"
  | "Active"
  | "OnHold"
  | "Completed"
  | "Archived";


// ============================================================
// PROJECT PRIORITY
// ============================================================

export type ProjectPriority =
  | "Low"
  | "Medium"
  | "High"
  | "Critical";


// ============================================================
// PROJECT USER
// ============================================================

export interface ProjectUser {
  id: string;
  name: string;
  email: string;
  role: ProjectUserRole;
}


// ============================================================
// BASE PROJECT
// ============================================================

export interface Project {
  id: string;

  name: string;

  description?: string;

  category?: string;

  status: ProjectStatus;

  priority: ProjectPriority;

  dueDate?: string | null;

  managerId?: string | null;

  teamMemberIds: string[];

  createdAt?: string;

  updatedAt?: string;
}


// ============================================================
// ADMIN PROJECT
// ============================================================

export interface AdminProject extends Project {
  managerId: string | null;

  teamMemberIds: string[];

  manager?: ProjectUser | null;

  teamMembers?: ProjectUser[];

  createdBy?: string;

  createdByName?: string;
}


// ============================================================
// MANAGER PROJECT
// ============================================================

export interface ManagerProject extends Project {
  managerId: string;

  teamMemberIds: string[];

  teamMembers?: ProjectUser[];

  taskCount?: number;

  completedTaskCount?: number;

  pendingTaskCount?: number;

  overdueTaskCount?: number;
}


// ============================================================
// EMPLOYEE PROJECT
// ============================================================

export interface EmployeeProject extends Project {
  managerId: string;

  manager?: ProjectUser | null;

  myTaskCount?: number;

  completedTaskCount?: number;

  pendingTaskCount?: number;

  inProgressTaskCount?: number;

  overdueTaskCount?: number;
}


// ============================================================
// CREATE PROJECT
// ============================================================

export interface CreateProjectRequest {
  name: string;

  description?: string;

  category?: string;

  priority: ProjectPriority;

  dueDate?: string | null;

  managerId?: string | null;

  teamMemberIds: string[];
}


// ============================================================
// UPDATE PROJECT
// ============================================================

export interface UpdateProjectRequest {
  name: string;

  description?: string;

  category?: string;

  status: ProjectStatus;

  priority: ProjectPriority;

  dueDate?: string | null;

  managerId?: string | null;

  teamMemberIds: string[];
}


// ============================================================
// PROJECT FILTERS
// ============================================================

export interface ProjectFilters {
  search?: string;

  status?: ProjectStatus | "All";

  priority?: ProjectPriority | "All";

  managerId?: string;

  page?: number;

  pageSize?: number;
}