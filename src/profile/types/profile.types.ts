export type UserRole = "Admin" | "Manager" | "Developer";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
}

export interface UpdateProfileRequest {
  name: string;
}