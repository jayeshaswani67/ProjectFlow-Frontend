import { useState } from "react";
import { isAxiosError } from "axios";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { ArrowLeft, CheckCircle2, KeyRound, LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import { forgetPassword } from "../api/authApi";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "../../schemas/auth.schema";
import { validateWithZod } from "../../utils/formikZod";

export default function ForgotPassword() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10 text-slate-900">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="mb-2 grid size-12 place-items-center rounded-2xl bg-indigo-600 text-xl font-bold text-white shadow-lg shadow-indigo-600/20">P</div>
          <h1 className="text-2xl font-semibold tracking-tight">ProjectFlow</h1>
          <p className="text-sm text-slate-500">Project management workspace</p>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
          <Formik<ForgotPasswordFormData>
            initialValues={{ email: "" }}
            validate={(values) => validateWithZod(forgotPasswordSchema, values)}
            onSubmit={async ({ email }) => {
              setError("");
              setSuccess(false);

              try {
                const response = await forgetPassword(email.trim().toLowerCase());
                setSuccess(true);
                if (response?.message) console.log(response.message);
              } catch (err: unknown) {
                console.error("FORGOT PASSWORD ERROR:", err);
                const message = isAxiosError<{ message?: string }>(err)
                  ? err.response?.data?.message
                  : undefined;
                setError(message || "Unable to process your request. Please try again.");
              }
            }}
          >
            {({ isSubmitting, values, resetForm }) => (
              !success ? (
                <div className="flex flex-col gap-5">
                  <div className="grid size-11 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><KeyRound size={22} /></div>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-semibold tracking-tight">Forgot your password?</h2>
                    <p className="text-sm leading-6 text-slate-500">Enter your work email and we will send you a secure reset link.</p>
                  </div>
                  {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                  <Form className="flex flex-col gap-4">
                    <label htmlFor="email" className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                      Work email
                      <span className="flex h-11 items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 text-slate-400 transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                        <Mail size={17} aria-hidden="true" />
                        <Field
                          id="email"
                          name="email"
                          type="email"
                          placeholder="you@company.com"
                          autoComplete="email"
                          disabled={isSubmitting}
                          className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                        />
                      </span>
                    </label>
                    <ErrorMessage name="email" component="p" className="-mt-2 text-xs text-red-600" />
                    <button type="submit" disabled={isSubmitting} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-70">
                      {isSubmitting ? <LoaderCircle size={17} className="animate-spin" /> : <Mail size={17} />}
                      {isSubmitting ? "Sending reset link..." : "Send reset link"}
                    </button>
                  </Form>
                  <div className="flex justify-center border-t border-slate-100 pt-4">
                    <a href="/login" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20"><ArrowLeft size={16} />Back to login</a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center">
                  <CheckCircle2 size={36} className="text-emerald-600" />
                  <h2 className="text-xl font-semibold tracking-tight">Check your email</h2>
                  <p className="text-sm leading-6 text-slate-500">
                    If an account exists for <strong className="font-semibold text-slate-700">{values.email}</strong>, you will receive a password reset link shortly.
                  </p>
                  <p className="text-sm leading-6 text-slate-500">
                    Open the link in that email to go directly to the reset-password page. If you do not see it, check your spam folder.
                  </p>
                  <div className="flex w-full items-start gap-3 rounded-xl bg-slate-50 p-4 text-left">
                    <ShieldCheck size={19} className="mt-0.5 shrink-0 text-indigo-600" />
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-slate-800">Secure password recovery</p>
                      <p className="text-xs leading-5 text-slate-500">The reset link is time-limited and can only be used to create a new password.</p>
                    </div>
                  </div>
                  <a href="/login" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30"><ArrowLeft size={16} />Back to login</a>
                  <button type="button" onClick={() => { setSuccess(false); setError(""); resetForm(); }} className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20">Try another email</button>
                </div>
              )
            )}
          </Formik>
        </section>
        <p className="text-center text-xs text-slate-400">ProjectFlow · Secure account recovery</p>
      </div>
    </main>
  );
}