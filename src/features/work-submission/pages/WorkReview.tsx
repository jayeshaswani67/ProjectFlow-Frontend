import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  User,
  X,
  XCircle,
} from "lucide-react";

import {
  getWorkSubmissions,
  reviewSubmission,
} from "../api/workSubmissionApi";

import type {
  ReviewStatus,
  WorkSubmission,
} from "../types/workSubmission.types";

type Filter =
  | "All"
  | "PendingReview"
  | "Approved"
  | "ChangesRequested";

type ToastState = {
  type: "success" | "error";
  message: string;
};

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusLabel(status: string) {
  switch (status) {
    case "PendingReview":
      return "Pending Review";

    case "Approved":
      return "Approved";

    case "ChangesRequested":
      return "Changes Requested";

    default:
      return status;
  }
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  if (status === "Approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 size={13} />
        Approved
      </span>
    );
  }

  if (status === "ChangesRequested") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        <AlertCircle size={13} />
        Changes Requested
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
      <Clock3 size={13} />
      Pending Review
    </span>
  );
}

function Toast({
  toast,
  onClose,
}: {
  toast: ToastState;
  onClose: () => void;
}) {
  return (
    <div className="fixed right-5 top-5 z-[100] w-[360px] max-w-[calc(100vw-40px)]">
      <div
        className={`flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl ${
          toast.type === "success"
            ? "border-emerald-200"
            : "border-red-200"
        }`}
      >
        <div
          className={`mt-0.5 rounded-full p-1.5 ${
            toast.type === "success"
              ? "bg-emerald-100 text-emerald-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <Check size={17} />
          ) : (
            <AlertCircle size={17} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">
            {toast.type === "success"
              ? "Success"
              : "Error"}
          </p>

          <p className="mt-0.5 text-sm text-slate-500">
            {toast.message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export default function WorkReview() {
  const [submissions, setSubmissions] = useState<
    WorkSubmission[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<Filter>("PendingReview");

  const [selectedSubmission, setSelectedSubmission] =
    useState<WorkSubmission | null>(null);

  const [reviewStatus, setReviewStatus] =
    useState<ReviewStatus>("Approved");

  const [feedback, setFeedback] =
    useState("");

  const [reviewing, setReviewing] =
    useState(false);

  const [toast, setToast] =
    useState<ToastState | null>(null);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getWorkSubmissions();

      setSubmissions(data);
    } catch (err: any) {
      console.error(
        "WORK REVIEW LOAD ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to load work submissions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const filteredSubmissions =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return submissions.filter(
        (submission) => {
          const matchesFilter =
            filter === "All" ||
            submission.status === filter;

          if (!matchesFilter) {
            return false;
          }

          if (!query) {
            return true;
          }

          return (
            submission.taskId
              ?.toLowerCase()
              .includes(query) ||
            submission.employeeId
              ?.toLowerCase()
              .includes(query) ||
            submission.notes
              ?.toLowerCase()
              .includes(query)
          );
        }
      );
    }, [
      submissions,
      filter,
      search,
    ]);

  const stats = useMemo(() => {
    return {
      total: submissions.length,

      pending: submissions.filter(
        (item) =>
          item.status === "PendingReview"
      ).length,

      approved: submissions.filter(
        (item) =>
          item.status === "Approved"
      ).length,

      changesRequested:
        submissions.filter(
          (item) =>
            item.status ===
            "ChangesRequested"
        ).length,
    };
  }, [submissions]);

  const openReview = (
    submission: WorkSubmission
  ) => {
    setSelectedSubmission(
      submission
    );

    setReviewStatus(
      "Approved"
    );

    setFeedback("");

    setToast(null);
  };

  const closeReview = () => {
    if (reviewing) return;

    setSelectedSubmission(null);
    setFeedback("");
  };

  const handleReview = async () => {
    if (!selectedSubmission) {
      return;
    }

    if (
      reviewStatus ===
        "ChangesRequested" &&
      !feedback.trim()
    ) {
      setToast({
        type: "error",
        message:
          "Please provide feedback when requesting changes.",
      });

      return;
    }

    try {
      setReviewing(true);

      await reviewSubmission(
        selectedSubmission.id,
        {
          status: reviewStatus,
          managerFeedback:
            feedback.trim() || null,
        }
      );

      setSubmissions(
        (previous) =>
          previous.map((item) =>
            item.id ===
            selectedSubmission.id
              ? {
                  ...item,
                  status:
                    reviewStatus,
                  managerFeedback:
                    feedback.trim() ||
                    null,
                  reviewedAt:
                    new Date().toISOString(),
                }
              : item
          )
      );

      setToast({
        type: "success",
        message:
          reviewStatus === "Approved"
            ? "Work approved successfully."
            : "Changes requested successfully.",
      });

      closeReview();
    } catch (err: any) {
      console.error(
        "WORK REVIEW ERROR:",
        err
      );

      setToast({
        type: "error",
        message:
          err?.message ||
          "Unable to review this submission.",
      });
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          toast={toast}
          onClose={() =>
            setToast(null)
          }
        />
      )}

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Work Review
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review employee submissions and
            provide feedback.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSubmissions}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* STAT CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Submissions"
          value={stats.total}
          icon={
            <FileText size={18} />
          }
        />

        <StatCard
          label="Pending Review"
          value={stats.pending}
          icon={
            <Clock3 size={18} />
          }
        />

        <StatCard
          label="Approved"
          value={stats.approved}
          icon={
            <CheckCircle2 size={18} />
          }
        />

        <StatCard
          label="Changes Requested"
          value={stats.changesRequested}
          icon={
            <AlertCircle size={18} />
          }
        />
      </div>

      {/* ERROR */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <div className="min-w-0 flex-1">
            <p className="font-semibold">
              Unable to load submissions
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={loadSubmissions}
            className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold shadow-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* FILTERS */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search task, employee or submission..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                "PendingReview",
                "All",
                "Approved",
                "ChangesRequested",
              ] as Filter[]
            ).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setFilter(item)
                }
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  filter === item
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {getStatusLabel(item)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                  Employee
                </th>

                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                  Task
                </th>

                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                  Submitted
                </th>

                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-16 text-center"
                  >
                    <Loader2
                      size={24}
                      className="mx-auto animate-spin text-slate-400"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      Loading submissions...
                    </p>
                  </td>
                </tr>
              ) : filteredSubmissions.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-16 text-center"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <FileText
                        size={21}
                      />
                    </div>

                    <p className="mt-3 font-semibold text-slate-800">
                      No submissions found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      There are no submissions matching
                      your current filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map(
                  (submission) => (
                    <tr
                      key={
                        submission.id
                      }
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                            <User
                              size={17}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {submission.employeeId}
                            </p>

                            <p className="text-xs text-slate-400">
                              Employee
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          Task #{submission.taskId}
                        </p>

                        <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                          {submission.notes ||
                            "No submission notes"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(
                          submission.submittedAt
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={
                            submission.status
                          }
                        />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            openReview(
                              submission
                            )
                          }
                          className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REVIEW MODAL */}

      {selectedSubmission && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                    <FileText
                      size={19}
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Review Work
                    </h2>

                    <p className="text-xs text-slate-400">
                      Task #
                      {
                        selectedSubmission.taskId
                      }
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={closeReview}
                disabled={reviewing}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="space-y-5 p-6">
              {/* Employee */}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                    <User size={18} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Submitted by
                    </p>

                    <p className="text-sm font-semibold text-slate-900">
                      {
                        selectedSubmission.employeeId
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <MessageSquare
                    size={16}
                    className="text-slate-400"
                  />

                  <h3 className="text-sm font-semibold text-slate-900">
                    Employee Notes
                  </h3>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                  {selectedSubmission.notes ||
                    "No notes provided."}
                </div>
              </div>

              {/* Attachment */}

              {selectedSubmission.attachmentUrl && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <ExternalLink
                      size={16}
                      className="text-slate-400"
                    />

                    <h3 className="text-sm font-semibold text-slate-900">
                      Work Link
                    </h3>
                  </div>

                  <a
                    href={
                      selectedSubmission.attachmentUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                  >
                    Open submitted work
                    <ExternalLink
                      size={15}
                    />
                  </a>
                </div>
              )}

              {/* Decision */}

              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Review Decision
                </h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      setReviewStatus(
                        "Approved"
                      )
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      reviewStatus ===
                      "Approved"
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        size={18}
                        className="text-emerald-600"
                      />

                      <span className="text-sm font-bold text-slate-900">
                        Approve
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Mark the submitted work as
                      approved.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setReviewStatus(
                        "ChangesRequested"
                      )
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      reviewStatus ===
                      "ChangesRequested"
                        ? "border-amber-300 bg-amber-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <XCircle
                        size={18}
                        className="text-amber-600"
                      />

                      <span className="text-sm font-bold text-slate-900">
                        Request Changes
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Send the employee back for
                      additional work.
                    </p>
                  </button>
                </div>
              </div>

              {/* Feedback */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Manager Feedback
                  {reviewStatus ===
                    "ChangesRequested" && (
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  )}
                </label>

                <textarea
                  value={feedback}
                  onChange={(event) =>
                    setFeedback(
                      event.target.value
                    )
                  }
                  rows={5}
                  placeholder={
                    reviewStatus ===
                    "ChangesRequested"
                      ? "Explain what needs to be changed..."
                      : "Add optional feedback..."
                  }
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                />
              </div>
            </div>

            {/* FOOTER */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 p-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeReview}
                disabled={reviewing}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReview}
                disabled={reviewing}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  reviewStatus ===
                  "Approved"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {reviewing && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                {reviewStatus ===
                "Approved"
                  ? "Approve Work"
                  : "Request Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
          {icon}
        </div>
      </div>
    </div>
  );
}