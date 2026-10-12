import { useState } from "react";
import { isAxiosError } from "axios";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, KeyRound, LoaderCircle, LockKeyhole, ShieldCheck, XCircle } from "lucide-react";
import { resetPassword } from "../api/authApi";
import { resetPasswordSchema, type ResetPasswordFormData } from "../../schemas/auth.schema";
import { validateWithZod } from "../../utils/formikZod";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const hashParams = new URLSearchParams(
    window.location.hash.replace(/^#/, ""),
  );
  const token = (
    searchParams.get("token") ??
    hashParams.get("token") ??
    ""
  ).trim();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-8 text-slate-900 sm:py-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="mb-2 grid size-12 place-items-center rounded-xl bg-indigo-600 text-xl font-bold text-white">P</div>
          <h1 className="text-2xl font-semibold">ProjectFlow</h1>
          <p className="text-sm text-slate-500">Project management workspace</p>
        </div>

        <section className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <Formik<ResetPasswordFormData>
            initialValues={{ token, newPassword: "", confirmPassword: "" }}
            enableReinitialize
            validate={(values) => validateWithZod(resetPasswordSchema, values)}
            onSubmit={async (values, { resetForm }) => {
              setError("");
              try {
                await resetPassword(values);
                setSuccess(true);
                resetForm({ values: { token, newPassword: "", confirmPassword: "" } });
              } catch (err: unknown) {
                console.error("RESET PASSWORD ERROR:", err);
                const message = isAxiosError<{ message?: string }>(err)
                  ? err.response?.data?.message
                  : undefined;
                setError(message || "Unable to reset your password. The reset link may have expired.");
              }
            }}
          >
          {({ values, isSubmitting }) => !token ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold">Open your reset link</h2>
                <p className="text-sm leading-6 text-slate-500">
                  To securely reset your password, open the link sent to your email. The link contains the reset token required to continue.
                </p>
              </div>
              <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                No reset token was found in this link. If you have not received an email, request a new reset link.
              </div>
              <Link
                to="/forget-password"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30"
              >
                Request a reset link
              </Link>
              <Link
                to="/login"
                className="w-fit rounded-md px-2 py-1 text-sm font-medium text-slate-600 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Back to login
              </Link>
            </div>
          ) : !success ? (
            <>
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold">Reset your password</h2>
                <p className="text-sm leading-6 text-slate-500">Create a new password for your ProjectFlow account.</p>
              </div>
              {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              <Form className="flex flex-col gap-4">
                <label htmlFor="new-password" className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  New password
                  <span className="flex h-11 items-center gap-3 rounded-lg border border-slate-300 px-3 text-slate-400 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                    <LockKeyhole size={17} aria-hidden="true" />
                    <Field
                      name="newPassword"
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      disabled={isSubmitting || !token}
                      className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                    />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="grid size-8 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </span>
                </label>

                <ErrorMessage name="newPassword" component="p" className="-mt-2 text-xs text-red-600" />

                {values.newPassword && (
                  <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3">
                    <p className="col-span-full text-xs font-semibold text-slate-700">Password requirements</p>
                    <PasswordCheck valid={values.newPassword.length >= 8} label="8+ characters" />
                    <PasswordCheck valid={/[A-Z]/.test(values.newPassword)} label="Uppercase" />
                    <PasswordCheck valid={/[a-z]/.test(values.newPassword)} label="Lowercase" />
                    <PasswordCheck valid={/\d/.test(values.newPassword)} label="Number" />
                  </div>
                )}

                <label htmlFor="confirm-password" className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  Confirm password
                  <span className="flex h-11 items-center gap-3 rounded-lg border border-slate-300 px-3 text-slate-400 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                    <LockKeyhole size={17} aria-hidden="true" />
                    <Field
                      name="confirmPassword"
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      disabled={isSubmitting || !token}
                      className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? "Hide password" : "Show password"} aria-pressed={showConfirmPassword} className="grid size-8 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </span>
                </label>

                <ErrorMessage name="confirmPassword" component="p" className="-mt-2 text-xs text-red-600" />
                <button type="submit" disabled={isSubmitting || !token} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60">
                  {isSubmitting ? <LoaderCircle size={17} className="animate-spin" /> : <KeyRound size={17} />}
                  {isSubmitting ? "Resetting password..." : "Reset password"}
                </button>
              </Form>
              <Link to="/login" className="w-fit rounded-md px-2 py-1 text-sm font-medium text-slate-600 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">Back to login</Link>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle2 size={36} className="text-emerald-600" />
              <h2 className="text-xl font-semibold">Password reset successful</h2>
              <p className="text-sm leading-6 text-slate-500">Your password has been changed. You can now sign in with your new password.</p>
              <div className="flex w-full items-start gap-3 rounded-lg bg-slate-50 p-4 text-left">
                <ShieldCheck size={19} className="mt-0.5 shrink-0 text-indigo-600" />
                <p className="text-sm text-slate-600">Your password reset link can no longer be used.</p>
              </div>
              <Link to="/login" className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30">Continue to login</Link>
            </div>
          )}
          </Formik>
        </section>
        <p className="text-center text-xs text-slate-400">ProjectFlow · Secure account recovery</p>
      </div>
    </main>
  );
}

function PasswordCheck({ valid, label }: { valid: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${valid ? "text-emerald-700" : "text-slate-500"}`}>
      {valid ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
      {label}
    </span>
  );
}