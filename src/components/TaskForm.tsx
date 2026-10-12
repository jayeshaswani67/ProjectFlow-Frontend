import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export interface TaskFormRef {
  focusTitle: () => void;
  reset: () => void;
  submit: () => void;
}

interface TaskFormProps {
  onSubmit: (title: string) => void;
}

const TaskForm = forwardRef<
  TaskFormRef,
  TaskFormProps
>(function TaskForm(
  { onSubmit },
  ref,
) {
  const titleInputRef =
    useRef<HTMLInputElement>(null);

  const [title, setTitle] =
    useState("");

  useImperativeHandle(
    ref,
    () => ({
      focusTitle() {
        titleInputRef.current?.focus();
      },

      reset() {
        setTitle("");
      },

      submit() {
        const trimmedTitle =
          title.trim();

        if (!trimmedTitle) {
          titleInputRef.current?.focus();
          return;
        }

        onSubmit(trimmedTitle);
      },
    }),
    [title, onSubmit],
  );

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">

      <div>
        <label className="text-sm font-medium text-slate-700">
          Task title
        </label>

        <input
          ref={titleInputRef}
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          placeholder="Enter task title"
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </div>

    </div>
  );
});

export default TaskForm;