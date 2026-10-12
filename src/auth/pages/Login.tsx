
import { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import {
  loginSchema,
  type LoginFormData,
} from "../../schemas/auth.schema";
import { validateWithZod } from "../../utils/formikZod";
import { useAuthContext } from "../../context/useAuthContext";
import { Eye, EyeOff,Loader2,LockKeyhole,ShieldCheck, Sparkles, } from "lucide-react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  login,
  type LoginResponse,
} from "../api/authApi";
import { AUTH_COOKIE_NAMES, setCookie } from "../../utils/cookies";

const initialValues: LoginFormData = { email: "",password: ""};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuthContext();

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");
  const errorRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    if (error) {
      errorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [error]);

  const completeLogin = async (response: LoginResponse) => {
    const backendRole = response.user.role;
    if (
      backendRole !== "Admin" &&
      backendRole !== "Manager" &&
      backendRole !== "Developer" &&
      backendRole !== "Employee"
    ) {
      setError("Your account has an unsupported role.");
      return;
    }

    if (response.accessToken) {
      setCookie(AUTH_COOKIE_NAMES.accessToken, response.accessToken);
    }
    if (response.refreshToken) {
      setCookie(AUTH_COOKIE_NAMES.refreshToken, response.refreshToken);
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.setItem("user", JSON.stringify(response.user));
    localStorage.setItem("userRole", backendRole);
    loginUser(response.user);

    const from =
      (location.state as { from?: { pathname?: string } })?.from?.pathname ||
      "/dashboard";
    navigate(from, { replace: true });
  };

  const handleLogin = async (data: LoginFormData) => {
    setError("");
    try {
      const response = await login(data);
      await completeLogin(response);
    } catch (err: unknown) {
      const apiError = isAxiosError<{ message?: string }>(err)
        ? err
        : undefined;

      if (apiError?.response?.status === 401) {
        setError("Invalid email or password.");
      } else if (apiError?.response?.status === 403) {
        setError("You don't have permission to access ProjectFlow.");
      } else if (apiError?.response?.data?.message) {
        setError(apiError.response.data.message);
      } else if (apiError?.code === "ERR_NETWORK") {
        setError("Unable to connect to ProjectFlow server.");
      } else {
        setError(
          (err instanceof Error && err.message) ||
            "Something went wrong. Please try again.",
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="flex min-h-screen">

        {/* 
            LEFT BRAND PANEL
         */}

        <div className="hidden w-[46%] flex-col justify-between bg-slate-900 p-10 text-white lg:flex">

          {/* Logo */}

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-slate-900">
              P
            </div>

            <div>
              <p className="font-bold">
                ProjectFlow
              </p>

              <p className="text-xs text-slate-400">
                Project Management
              </p>
            </div>

          </div>

          {/* Main message */}

          <div className="max-w-lg">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
              <Sparkles size={13} />
              Workspace built for teams
            </div>

            <h2 className="text-5xl font-bold leading-[1.08] tracking-tight">
              Move your
              <br />
              <span className="text-slate-400">
                projects forward.
              </span>
            </h2>

            <p className="mt-6 max-w-md text-sm leading-6 text-slate-400">
              Plan projects, manage tasks,
              collaborate with your team and
              use AI to turn ideas into execution.
            </p>

            {/* Role cards */}


          </div>

          {/* Footer */}

          <p className="text-xs text-slate-500">
            ProjectFlow · Secure workspace
          </p>

        </div>


        {/* RIGHT LOGIN AREA */}

        <div className="flex w-full items-center justify-center px-5 py-10 lg:w-[54%] lg:px-12">

          <div className="w-full max-w-md">

            {/* Mobile logo */}

            <div className="mb-8 text-center lg:hidden">

              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">
                P
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                ProjectFlow
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Project Management
              </p>

            </div>

            {/* 
                HEADER
             */}

            <div className="mb-7">

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Sign in to continue to your workspace.
              </p>

            </div>



            {/* 
                LOGIN CARD
                 */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
                  <Formik<LoginFormData>
                    initialValues={initialValues}
                    validate={(values) => validateWithZod(loginSchema, values)}
                    onSubmit={handleLogin}
                  >
                    {({ isSubmitting }) => (
                      <Form className="space-y-5">

                    {/* Error */}

                    {error && (
                      <div
                        ref={errorRef}
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                      >
                        {error}
                      </div>
                    )}


                    {/* Email */}

                    <div>

                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Email
                      </label>

                      <Field
                        name="email"
                        innerRef={emailRef}
                        id="email"
                        type="email"
                        placeholder="you@projectflow.com"
                        autoComplete="email"
                        disabled={isSubmitting}
                        onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            passwordRef.current?.focus();
                          }
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                      />

                      <ErrorMessage
                        name="email"
                        component="p"
                        className="mt-1 text-xs text-red-600"
                      />

                    </div>


                    {/* Password */}

                    <div>

                      <div className="mb-2 flex items-center justify-between">
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium text-slate-700"
                        >
                          Password
                        </label>

                        <Link
                          to="/forget-password"
                          className="rounded-md px-2 py-2 text-xs font-medium text-slate-500 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
                        >
                          Forgot password?
                        </Link>
                      </div>

                      <div className="relative">

                        <LockKeyhole
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <Field
                          name="password"
                          innerRef={passwordRef}
                          id="password"
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          disabled={isSubmitting}
                          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              (value) =>
                                !value
                            )
                          }
                          disabled={isSubmitting}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>

                      </div>

                      <ErrorMessage
                        name="password"
                        component="p"
                        className="mt-1 text-xs text-red-600"
                      />

                    </div>


                    {/* Login button */}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      {isSubmitting ? (
                        <>
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                          Signing in...
                        </>
                      ) : (
                        "Sign in"
                      )}

                    </button>

                  </Form>
                )}
              </Formik>


            </div>


            {/* 
                SECURITY MESSAGE
             */}

            <div className="mt-5 flex items-center justify-center gap-2 text-center">

              <ShieldCheck
                size={14}
                className="text-slate-400"
              />

            </div>


            {/* Footer */}

            <p className="mt-7 text-center text-xs text-slate-400">
              ProjectFlow · Project Management
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}
