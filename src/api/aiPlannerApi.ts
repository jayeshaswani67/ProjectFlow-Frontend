import api from "../lib/axios";

export interface GeneratePlannerRequest {
projectName: string;
description: string;
deadline: string;
teamSize: number;
priority: string;
}

export interface PlannerTask {
title: string;
description: string;
phase: string;
priority: string;
estimatedDays: number;
startDate: string;
dueDate: string;
dependsOn: string[];
}

export interface PlannerMilestone {
name: string;
description: string;
dueDate: string;
tasks: PlannerTask[];
}

export interface PlannerRisk {
risk: string;
severity: string;
mitigation: string;
}

export interface PlannerResponse {
projectName: string;
summary: string;
deliveryAssessment: string;
startDate: string;
deliveryDate: string;
totalDays: number;
estimatedWorkDays: number;
milestones: PlannerMilestone[];
risks: PlannerRisk[];
recommendations: string[];
}

export const generateAIPlan = async (
request: GeneratePlannerRequest
): Promise<PlannerResponse> => {
const response = await api.post<PlannerResponse>(
"/aiplanner/generate",
request
);

return response.data;
};
