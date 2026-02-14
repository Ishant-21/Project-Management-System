import { useState } from "react";
import api from "../configs/api";
import { useNavigate, Link } from "react-router-dom";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (data?.token) {
        localStorage.setItem("token", data.token);
        // Notify the app that auth state changed so hooks can reload user data
        try {
          window.dispatchEvent(new Event("auth:change"));
        } catch (e) {}
        // navigate to app root - Layout's useUser will pick up the token and load user
        navigate("/");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Sign In</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={submit}>
        <input
          className="w-full mb-3 p-2 border"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full mb-3 p-2 border"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full bg-blue-600 text-white p-2 rounded"
          disabled={loading}
          type="submit"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p className="text-sm text-center mt-4">
        Don't have an account?{' '}
        <Link to="/signup" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default SignIn;
