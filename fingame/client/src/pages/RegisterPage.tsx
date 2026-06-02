import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "../components/LoadingSpinner";

const RegisterPage: React.FC = () => {
  const { register, user, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      await register({ name, email, password });
      navigate("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || "Registration failed. Email may already be in use.");
    } finally {
      setSubmitting(false);
    }
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
          <div className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center bg-surface-container glow-indigo mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">person_add</span>
          </div>
          <h1 className="font-display-lg text-headline-lg-mobile text-primary">Start Your Quest</h1>
          <p className="text-on-surface-variant text-sm mt-1">Join the guild of smart savers</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: "name", label: "Name", type: "text", value: name, setter: setName },
            { id: "email", label: "Email", type: "email", value: email, setter: setEmail },
            { id: "password", label: "Password", type: "password", value: password, setter: setPassword },
            { id: "confirm", label: "Confirm Password", type: "password", value: confirm, setter: setConfirm },
          ].map((field) => (
            <div key={field.id}>
              <label htmlFor={field.id} className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
                {field.label}
              </label>
              <input
                id={field.id}
                type={field.type}
                value={field.value}
                onChange={(e) => field.setter(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl sunken-surface border border-outline-variant/50 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          ))}

          {error && (
            <p className="text-error text-sm bg-error-container/30 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl font-label-caps text-label-caps text-on-primary btn-grad active:scale-[0.96] transition-all disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Begin Adventure →"}
          </button>
        </form>

        <p className="text-center text-on-surface-variant text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:text-secondary transition-colors font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
};

export default RegisterPage;
