import { useState } from "react";
import api from "../configs/api";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, LayoutDashboardIcon, AlertCircle } from "lucide-react";
import { Button, inputClass, labelClass } from "../ui";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (data?.token) {
        localStorage.setItem("token", data.token);
        // Notify AuthProvider that auth state changed so it reloads the user.
        window.dispatchEvent(new Event("auth:change"));
        navigate("/");
      } else {
        // No token in a 200 response: surface the server wording.
        setError(data?.message || "");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-slate-50">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center mb-7">
          <span className="w-11 h-11 rounded-2xl bg-chrome flex items-center justify-center mb-3">
            <LayoutDashboardIcon size={20} className="text-sky-400" strokeWidth={2.2} />
          </span>
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1 text-[13px] text-slate-500">
            Sign in to continue to your projects
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          {error && (
            <div
              className="flex items-start gap-2 mb-4 px-3.5 py-3 rounded-xl bg-rose-50 border border-rose-100 text-[12px] font-medium text-rose-700"
              role="alert"
            >
              <AlertCircle size={14} strokeWidth={2.2} className="shrink-0 mt-px" />
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="signin-email" className={labelClass}>
                Email
              </label>
              <input
                id="signin-email"
                className={inputClass}
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="signin-password" className={labelClass}>
                Password
              </label>
              <div className="relative">
                <input
                  id="signin-password"
                  className={`${inputClass} pr-10`}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={15} strokeWidth={2} />
                  ) : (
                    <Eye size={15} strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-[13px] text-slate-500">
          Do not have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-sky-600 hover:text-sky-700"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
