import api from "../../../lib/axios";
import type { ApiResponse } from "../../../types/Api";

import type {
  WorkSubmission,
  ReviewWorkSubmissionRequest,
} from "../types/workSubmission.types";

export interface CreateWorkSubmissionRequest {
  taskId: string;
  notes: string;
  attachmentUrl?: string;
}

export const getMySubmissions =
  async (): Promise<WorkSubmission[]> => {
    const response =
      await api.get<
        ApiResponse<WorkSubmission[]>
      >("/work-submissions/my");

    return response.data.data ?? [];
  };

export const getWorkSubmissions =
  async (): Promise<WorkSubmission[]> => {
    const response =
      await api.get<
        ApiResponse<WorkSubmission[]>
      >("/work-submissions");

    return response.data.data ?? [];
  };

export const reviewSubmission =
  async (
    submissionId: string,
    data: ReviewWorkSubmissionRequest,
  ): Promise<WorkSubmission> => {
    const response =
      await api.patch<
        ApiResponse<WorkSubmission>
      >(
        `/work-submissions/${submissionId}/review`,
        data,
      );

    if (!response.data.data) {
      throw new Error(
        "Reviewed submission was not returned by the API.",
      );
    }

    return response.data.data;
  };

export const getTaskSubmission =
  async (
    taskId: string,
  ): Promise<WorkSubmission | null> => {
    const response =
      await api.get<
        ApiResponse<WorkSubmission | null>
      >(
        `/work-submissions/task/${taskId}`,
      );

    return response.data.data ?? null;
  };

export const submitWork =
  async (
    data: CreateWorkSubmissionRequest,
  ): Promise<WorkSubmission> => {
    const response =
      await api.post<
        ApiResponse<WorkSubmission>
      >(
        "/work-submissions",
        data,
      );

    if (!response.data.data) {
      throw new Error(
        "Work submission was not returned by the API.",
      );
    }

    return response.data.data;
  };