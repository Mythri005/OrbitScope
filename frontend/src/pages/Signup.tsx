import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Orbit, Lock, Mail, ArrowRight } from "lucide-react";

import { register } from "../services/authService";

import "./Auth.css";

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register(email, password);

      navigate("/login");
    } catch {
      setError(
        "Unable to create account. The email may already be registered."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">

      <div className="auth-stars" />

      <div className="auth-brand">
        <Orbit size={30} strokeWidth={1.8} />

        <span>
          ORBIT<span className="brand-accent">SCOPE</span>
        </span>
      </div>

      <section className="auth-card">

        <div className="auth-icon">
          <Orbit size={28} />
        </div>

        <div className="auth-heading">
          <h1>Create your account</h1>

          <p>
            Start tracking satellites and exploring the night sky.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >

          <div className="input-group">
            <label htmlFor="signup-email">
              Email
            </label>

            <div className="input-wrapper">
              <Mail size={18} />

              <input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="signup-password">
              Password
            </label>

            <div className="input-wrapper">
              <Lock size={18} />

              <input
                id="signup-password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                minLength={6}
                required
              />
            </div>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? (
              "Creating account..."
            ) : (
              <>
                Create account
                <ArrowRight size={18} />
              </>
            )}
          </button>

        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <p className="auth-switch">
          Already have an account?

          <Link to="/login">
            Sign in
          </Link>
        </p>

      </section>

      <div className="auth-footer">
        <span className="status-dot" />
        LIVE SATELLITE NETWORK
      </div>

    </main>
  );
}