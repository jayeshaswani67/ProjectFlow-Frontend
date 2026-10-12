import { z } from "zod";

export const projectSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Project name is required")
		.max(100, "Project name cannot exceed 100 characters"),

	description: z
		.string()
		.trim()
		.max(1000, "Description cannot exceed 1000 characters"),

	category: z.enum([
		"Software",
		"Marketing",
		"Design",
		"Research",
		"Business",
		"General",
	]),

	status: z.enum([
		"Planning",
		"In Progress",
		"Completed",
		"On Hold",
	]),

	priority: z.enum([
		"Low",
		"Medium",
		"High",
		"Critical",
	]),

	dueDate: z
		.string()
		.min(1, "Due date is required")
		.refine((value) => !Number.isNaN(Date.parse(value)), {
			message: "Please enter a valid due date",
		}),

	teamMembers: z.array(z.string().trim().min(1)).default([]),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
