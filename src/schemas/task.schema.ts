import { z } from "zod";

export const taskSchema = z.object({
	projectId: z
		.string()
		.trim()
		.min(1, "Project is required"),

	title: z
		.string()
		.trim()
		.min(1, "Task title is required")
		.max(150, "Task title cannot exceed 150 characters"),

	description: z
		.string()
		.trim()
		.max(1000, "Description cannot exceed 1000 characters"),

	status: z.enum([
		"Pending",
		"In Progress",
		"Completed",
	]),

	priority: z.enum([
		"Low",
		"Medium",
		"High",
	]),

	assignedTo: z
		.string()
		.trim()
		.max(100, "Assigned user ID cannot exceed 100 characters"),

	dueDate: z
		.string()
		.min(1, "Due date is required")
		.refine((value) => !Number.isNaN(Date.parse(value)), {
			message: "Please enter a valid due date",
		}),
});

export type TaskFormData = z.infer<typeof taskSchema>;
