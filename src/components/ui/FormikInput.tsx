import type { InputHTMLAttributes } from "react";
import { useField } from "formik";

interface FormikInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
}

export default function FormikInput({
  label,
  name,
  ...props
}: FormikInputProps) {
  const [field, meta] = useField(name);

  const hasError =
    meta.touched && Boolean(meta.error);

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <input
        id={name}
        {...field}
        {...props}
        className={`
          w-full rounded-xl border px-3 py-2.5
          text-sm outline-none transition
          ${
            hasError
              ? "border-red-400 focus:border-red-500"
              : "border-slate-200 focus:border-slate-900"
          }
        `}
      />

      {hasError && (
        <p className="text-xs text-red-500">
          {meta.error}
        </p>
      )}
    </div>
  );
}