import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DEMO_EMAIL, DEMO_PASSWORD } from "../utils/constants";
import { LoadingSpinner } from "../components/LoadingSpinner";

const LoginPage: React.FC = () => {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password. Try demo: hero@fingame.com / password123");
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center gradient-bg">
        <LoadingSpinner />
      </main>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <main className="min-h-screen flex items-center justify-center px-container-margin py-24 gradient-bg">
      <div className="glass-card w-full max-w-md p-8 rounded-2xl glow-indigo">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full border-2 border-secondary flex items-center justify-center bg-surface-container glow-teal mb-4">
            <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              account_balance_wallet
            </span>
          </div>
          <h1 className="font-display-lg text-headline-lg-mobile text-primary">Welcome Back</h1>
          <p className="text-on-surface-variant text-sm mt-1">Continue your financial quest</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl sunken-surface border border-outline-variant/50 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              placeholder="hero@fingame.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl sunken-surface border border-outline-variant/50 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-error text-sm bg-error-container/30 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl font-label-caps text-label-caps text-on-primary btn-grad hover:brightness-110 active:scale-[0.96] transition-all disabled:opacity-50 animate-pulse-glow"
          >
            {submitting ? "Entering..." : "Enter the Quest →"}
          </button>
        </form>

        <button
          type="button"
          onClick={fillDemo}
          className="w-full mt-3 py-2 text-sm text-secondary hover:text-secondary-fixed-dim transition-colors"
        >
          Use demo account
        </button>

        <p className="text-center text-on-surface-variant text-sm mt-6">
          New adventurer?{" "}
          <Link to="/register" className="text-primary hover:text-secondary transition-colors font-semibold">
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
