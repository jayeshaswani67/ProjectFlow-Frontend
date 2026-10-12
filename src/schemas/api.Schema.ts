import { z } from "zod";

export const apiResponseSchema =
  <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
      success: z.boolean(),

      message: z.string(),

      data: dataSchema,

      meta: z
        .unknown()
        .nullable()
        .optional(),
    });