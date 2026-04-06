import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { authMode, register, signInWithGoogle, user, loading } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    targetExam: "SAT"
  });
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
      await register(form);
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
        <p className="eyebrow">Create your account</p>
        <h1>Start an SAT or PSAT study track</h1>

        <label>
          <span>Name</span>
          <input name="name" value={form.name} onChange={updateField} required />
        </label>

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
            minLength="6"
            required
          />
        </label>

        <label>
          <span>Target exam</span>
          <select name="targetExam" value={form.targetExam} onChange={updateField}>
            <option value="SAT">SAT</option>
            <option value="PSAT">PSAT</option>
          </select>
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </button>
        {authMode === "firebase" ? (
          <button className="secondary-button" type="button" onClick={handleGoogle} disabled={submitting}>
            Sign up with Google
          </button>
        ) : null}

        <p className="muted-text">
          Already registered? <Link to="/login">Log in here</Link>.
        </p>
      </form>
    </section>
  );
}
