export type WorkSubmissionStatus =
  | "PendingReview"
  | "Approved"
  | "ChangesRequested";
  export type ReviewStatus =
  | "Approved"
  | "ChangesRequested";

export interface WorkSubmission {
  id: string;
  taskId: string;
  employeeId: string;
  notes: string;
  attachmentUrl?: string | null;
  status: WorkSubmissionStatus;
  managerFeedback?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
}
export interface ReviewWorkSubmissionRequest {
  status: ReviewStatus;
  managerFeedback?: string | null;
}