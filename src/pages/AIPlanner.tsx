import { useState } from "react";
import {
Sparkles,
CalendarDays,
Clock3,
Flag,
Users,
Rocket,
CheckCircle2,
Circle,
ArrowRight,
Loader2,
AlertCircle,
} from "lucide-react";
import api from "../lib/axios";

interface PlannerTask {
title: string;
description: string;
phase: string;
priority: string;
estimatedDays: number;
startDate: string;
dueDate: string;
}

interface PlannerMilestone {
name: string;
description: string;
dueDate: string;
tasks: PlannerTask[];
}

interface PlannerResponse {
projectName: string;
summary: string;
startDate: string;
deliveryDate: string;
totalDays: number;
milestones: PlannerMilestone[];
}

const AIPlanner = () => {
const [projectName, setProjectName] = useState("");
const [description, setDescription] = useState("");
const [deadline, setDeadline] = useState("");
const [teamSize, setTeamSize] = useState("3");
const [priority, setPriority] = useState("Medium");

const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [plan, setPlan] = useState<PlannerResponse | null>(null);

const generatePlan = async () => {
if (!projectName.trim()) {
setError("Please enter a project name.");
return;
}

if (!description.trim()) {
  setError("Please describe what you want to build.");
  return;
}

if (!deadline) {
  setError("Please select a delivery deadline.");
  return;
}

setError("");
setLoading(true);

try {
  const response = await api.post<PlannerResponse>(
    "/ai-planner/generate",
    {
      projectName,
      description,
      deadline,
      teamSize: Number(teamSize),
      priority,
    }
  );

  setPlan(response.data);
} catch (err: any) {
  console.error(err);

  setError(
    err?.response?.data?.message ||
      "Unable to generate the project plan."
  );
} finally {
  setLoading(false);
}


};

const resetPlanner = () => {
setPlan(null);
setError("");
};

return ( <div className="min-h-screen bg-slate-50 p-4 sm:p-6"> <div className="mx-auto max-w-7xl">

    {/* Header */}
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
          <Sparkles size={24} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            AI Project Planner
          </h1>

          <p className="text-sm text-slate-500">
            Turn your project idea into a realistic timeline, milestones,
            tasks and delivery plan.
          </p>
        </div>
      </div>
    </div>

    {/* Planner Form */}
    {!plan && (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Main form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Plan your project
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Give the planner enough context to create a useful delivery
              roadmap.
            </p>
          </div>

          <div className="space-y-5">

            {/* Project Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Project name
              </label>

              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Doctor Appointment SaaS"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                What are you building?
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Describe the product, important features, users and expected outcome..."
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Target delivery date
              </label>

              <div className="relative">
                <CalendarDays
                  size={18}
                  className="absolute left-4 top-3.5 text-slate-400"
                />

                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Team + Priority */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Team size
                </label>

                <div className="relative">
                  <Users
                    size={18}
                    className="absolute left-4 top-3.5 text-slate-400"
                  />

                  <select
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="1">1 person</option>
                    <option value="2">2 people</option>
                    <option value="3">3 people</option>
                    <option value="5">5 people</option>
                    <option value="10">10 people</option>
                    <option value="20">20+ people</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Priority
                </label>

                <div className="relative">
                  <Flag
                    size={18}
                    className="absolute left-4 top-3.5 text-slate-400"
                  />

                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {/* Generate */}
            <button
              onClick={generatePlan}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating project plan...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate AI Project Plan
                </>
              )}
            </button>

          </div>
        </div>

        {/* Right information panel */}
        <div className="rounded-2xl bg-slate-900 p-6 text-white">

          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500">
            <Rocket size={23} />
          </div>

          <h3 className="text-xl font-semibold">
            What AI Planner creates
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            Your project idea becomes a structured execution roadmap.
          </p>

          <div className="mt-8 space-y-5">

            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-indigo-400" size={19} />

              <div>
                <p className="font-medium">Project timeline</p>
                <p className="mt-1 text-xs text-slate-400">
                  Calculate the time available until delivery.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-indigo-400" size={19} />

              <div>
                <p className="font-medium">Milestones</p>
                <p className="mt-1 text-xs text-slate-400">
                  Break the project into meaningful phases.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-indigo-400" size={19} />

              <div>
                <p className="font-medium">Tasks</p>
                <p className="mt-1 text-xs text-slate-400">
                  Generate actionable tasks for every phase.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-indigo-400" size={19} />

              <div>
                <p className="font-medium">Delivery prediction</p>
                <p className="mt-1 text-xs text-slate-400">
                  See whether the deadline is realistic.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    )}

    {/* Generated Plan */}
    {plan && (
      <div className="space-y-6">

        {/* Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div>
              <div className="mb-2 flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-600" />

                <span className="text-sm font-medium text-indigo-600">
                  AI Generated Plan
                </span>
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                {plan.projectName}
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                {plan.summary}
              </p>
            </div>

            <button
              onClick={resetPlanner}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Create another plan
            </button>

          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <CalendarDays size={17} />
                <span className="text-xs font-medium">
                  Start date
                </span>
              </div>

              <p className="mt-2 font-semibold text-slate-900">
                {new Date(plan.startDate).toLocaleDateString()}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock3 size={17} />
                <span className="text-xs font-medium">
                  Timeline
                </span>
              </div>

              <p className="mt-2 font-semibold text-slate-900">
                {plan.totalDays} days
              </p>
            </div>

            <div className="rounded-xl bg-indigo-50 p-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <Rocket size={17} />
                <span className="text-xs font-medium">
                  Delivery
                </span>
              </div>

              <p className="mt-2 font-semibold text-indigo-700">
                {new Date(plan.deliveryDate).toLocaleDateString()}
              </p>
            </div>

          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900">
              Project Timeline
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Recommended execution roadmap.
            </p>
          </div>

          <div className="relative">

            <div className="absolute bottom-0 left-5 top-0 w-px bg-slate-200" />

            <div className="space-y-8">

              {plan.milestones.map((milestone, index) => (
                <div
                  key={`${milestone.name}-${index}`}
                  className="relative pl-14"
                >

                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-indigo-600 text-white shadow-sm">
                    {index + 1}
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-5">

                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                          Phase {index + 1}
                        </p>

                        <h3 className="mt-1 text-lg font-semibold text-slate-900">
                          {milestone.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {milestone.description}
                        </p>
                      </div>

                      <div className="shrink-0 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                        Due{" "}
                        {new Date(
                          milestone.dueDate
                        ).toLocaleDateString()}
                      </div>

                    </div>

                    <div className="mt-5 space-y-3">

                      {milestone.tasks.map((task, taskIndex) => (
                        <div
                          key={`${task.title}-${taskIndex}`}
                          className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                        >

                          <div className="flex gap-3">

                            <Circle
                              size={18}
                              className="mt-0.5 shrink-0 text-slate-400"
                            />

                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {task.title}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {task.description}
                              </p>
                            </div>

                          </div>

                          <div className="flex items-center gap-3 text-xs">

                            <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-600">
                              {task.priority}
                            </span>

                            <span className="text-slate-500">
                              {task.estimatedDays}d
                            </span>

                            <ArrowRight
                              size={15}
                              className="text-slate-400"
                            />

                            <span className="font-medium text-slate-700">
                              {new Date(
                                task.dueDate
                              ).toLocaleDateString()}
                            </span>

                          </div>

                        </div>
                      ))}

                    </div>

                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>

      </div>
    )}

  </div>
</div>
)}
export default AIPlanner;
