
import axios from "../lib/axios";
import {
  unwrapApiResponse,
  type ApiResponse,
} from "../types/Api";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar: string;
  status: string;
  joinedAt: string;
  updatedAt: string;
}

export interface CreateTeamMemberRequest {
  name: string;
  email: string;
  role: string;
  department: string;
  avatar: string;
  status: string;
}

export interface UpdateTeamMemberRequest {
  name: string;
  email: string;
  role: string;
  department: string;
  avatar: string;
  status: string;
}

export const getTeamMembers = async (): Promise<TeamMember[]> => {
  const response = await axios.get<
    TeamMember[] | ApiResponse<TeamMember[]>
  >("/team");
  return unwrapApiResponse(response.data);
};

export const getTeamMember = async (
  id: string
): Promise<TeamMember> => {
  const response = await axios.get<TeamMember>(`/team/${id}`);
  return response.data;
};

export const createTeamMember = async (
  data: CreateTeamMemberRequest
): Promise<TeamMember> => {
  const response = await axios.post<TeamMember>("/team", data);
  return response.data;
};

export const updateTeamMember = async (
  id: string,
  data: UpdateTeamMemberRequest
): Promise<TeamMember> => {
  const response = await axios.put<TeamMember>(
    `/team/${id}`,
    data
  );

  return response.data;
};

export const deleteTeamMember = async (
  id: string
): Promise<void> => {
  await axios.delete(`/team/${id}`);
};
