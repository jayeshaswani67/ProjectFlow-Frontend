
import axios from "../../lib/axios";

/* 
   TYPES
 */

export interface MonthlyCompletedTasks {
  month: string;
  completed: number;
}

export interface ProjectPerformance {
  name: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
}

export interface TeamPerformance {
  name: string;
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
}

export interface AnalyticsData {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  planningProjects: number;

  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;

  teamMembers: number;
  activeMembers: number;

  completionRate: number;

  monthlyCompletedTasks: MonthlyCompletedTasks[];

  projectPerformance: ProjectPerformance[];

  teamPerformance: TeamPerformance[];
}

/* 
   GET ANALYTICS
 */

export const getAnalytics = async (): Promise<AnalyticsData> => {
  const response = await axios.get<AnalyticsData>("/analytics");

  return response.data;
};

