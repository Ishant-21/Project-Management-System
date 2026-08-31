import { useState } from "react";
import api from "../configs/api";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, LayoutDashboardIcon, AlertCircle } from "lucide-react";
import { Button, inputClass, labelClass } from "../ui";

const SignUp = () => {
  const [name, setName] = useState("");
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
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      // After successful signup, redirect to sign-in (do not auto-login)
      if (data) {
        navigate("/signin");
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
            Create your account
          </h1>
          <p className="mt-1 text-[13px] text-slate-500">
            Start organising your work in minutes
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
              <label htmlFor="signup-name" className={labelClass}>
                Full name
              </label>
              <input
                id="signup-name"
                className={inputClass}
                autoComplete="name"
                placeholder="Ada Lovelace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="signup-email" className={labelClass}>
                Email
              </label>
              <input
                id="signup-email"
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
              <label htmlFor="signup-password" className={labelClass}>
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  className={`${inputClass} pr-10`}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
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
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-[13px] text-slate-500">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="font-semibold text-sky-600 hover:text-sky-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
