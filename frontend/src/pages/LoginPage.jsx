import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import SocialAuthButton from "../components/SocialAuthButton";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginAsDemo, signInWithGoogle, socialAuthEnabled, user, loading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(form);
      navigate("/dashboard");
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = async () => {
    setSubmitting(true);
    setError("");

    try {
      await loginAsDemo();
      navigate("/dashboard");
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    setError("");

    try {
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <section className="auth-shell">
      <form className="panel auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Welcome back</p>
        <h1>Log in to continue training</h1>

        <label>
          <span>Email</span>
          <input name="email" type="email" value={form.email} onChange={updateField} required />
        </label>

        <label>
          <span>Password</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            required
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Log in"}
        </button>

        {socialAuthEnabled ? (
          <>
            <div className="auth-divider">
              <span>or use a one-click sign-in</span>
            </div>

            <div className="social-auth-stack">
              <SocialAuthButton
                provider="google"
                title="Continue with Google"
                description="Open a Google popup and jump straight back into your study plan."
                onClick={handleGoogle}
                disabled={submitting}
              />
            </div>
          </>
        ) : null}

        <button className="ghost-button" type="button" onClick={handleDemo} disabled={submitting}>
          Use demo account
        </button>

        <p className="muted-text">
          Need an account? <Link to="/register">Create one here</Link>.
        </p>
      </form>
    </section>
  );
}
