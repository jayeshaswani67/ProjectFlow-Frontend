import type { FormikErrors } from "formik";
import type { ZodType } from "zod";

export function validateWithZod<T>(
  schema: ZodType<T>,
  values: T,
): FormikErrors<T> {
  const result = schema.safeParse(values);

  if (result.success) {
    return {};
  }

  const errors: FormikErrors<T> = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof T;

    if (field && !errors[field]) {
      errors[field] = issue.message as FormikErrors<T>[keyof T];
    }
  }

  return errors;
}