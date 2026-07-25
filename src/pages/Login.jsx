import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [rememberMe, setRememberMe] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setErrorMessage(
        "Enter your email and password."
      );
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const result = await loginUser(
        email.trim(),
        password
      );

      localStorage.removeItem("bgs_token");
      localStorage.removeItem("bgs_user");

      sessionStorage.removeItem("bgs_token");
      sessionStorage.removeItem("bgs_user");

      const storage = rememberMe
        ? localStorage
        : sessionStorage;

      storage.setItem(
        "bgs_token",
        result.token
      );

      storage.setItem(
        "bgs_user",
        JSON.stringify(result.user)
      );

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(
        error.message ||
          "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-glow login-glow-one"></div>
        <div className="login-glow login-glow-two"></div>

        <div className="login-visual-content">
          <div className="login-brand">
            <div className="login-logo">
              <svg
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M35.5 8.5C24 9 15 15.5 12.5 27c7.5.5 14-2.5 18.5-8.5-3 7-8.5 11.5-17 13.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M12 32c7 0 12.5 2.5 17 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <strong>BGS AgriStock</strong>
              <span>Inventory Intelligence</span>
            </div>
          </div>

          <div className="login-copy">
            <span className="login-eyebrow">
              SMART AGRICULTURAL MANAGEMENT
            </span>

            <h1>
              Control your stock.
              <br />
              Grow with confidence.
            </h1>

            <p>
              Track products, monitor inventory
              levels, manage sales and view accurate
              reports from one modern workspace.
            </p>
          </div>

          <div className="login-dashboard-card">
            <div className="dashboard-card-top">
              <div>
                <span>Inventory Overview</span>
                <strong>Today</strong>
              </div>

              <span className="dashboard-status">
                Live
              </span>
            </div>

            <div className="dashboard-metrics">
              <div>
                <span>Total Products</span>
                <strong>126</strong>
                <small>+8 this month</small>
              </div>

              <div>
                <span>Stock Value</span>
                <strong>Rs. 2.5M</strong>
                <small>+24% growth</small>
              </div>
            </div>

            <div className="dashboard-chart">
              <div className="dashboard-bars">
                <span
                  style={{ height: "38%" }}
                ></span>

                <span
                  style={{ height: "58%" }}
                ></span>

                <span
                  style={{ height: "46%" }}
                ></span>

                <span
                  style={{ height: "78%" }}
                ></span>

                <span
                  style={{ height: "62%" }}
                ></span>

                <span
                  style={{ height: "91%" }}
                ></span>

                <span
                  style={{ height: "72%" }}
                ></span>
              </div>
            </div>
          </div>

          <p className="login-copyright">
            © 2026 BGS AgriStock. Built for
            Balangoda Gowi Sewa.
          </p>
        </div>
      </section>

      <section className="login-form-side">
        <div className="login-mobile-brand">
          <div className="login-logo">
            <svg
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M35.5 8.5C24 9 15 15.5 12.5 27c7.5.5 14-2.5 18.5-8.5-3 7-8.5 11.5-17 13.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <strong>BGS AgriStock</strong>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <span className="login-card-tag">
              SECURE ACCESS
            </span>

            <h2>Welcome back</h2>

            <p>
              Enter your details to access your
              inventory dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="email">
                Email address
              </label>

              <div className="login-input-wrap">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M4 6h16v12H4z" />
                  <path d="m4 7 8 6 8-6" />
                </svg>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="Enter your email"
                  autoComplete="email"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">
                Password
              </label>

              <div className="login-input-wrap">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="10"
                    rx="2"
                  />

                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) => {
                    setPassword(
                      event.target.value
                    );

                    setErrorMessage("");
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M3 3l18 18" />

                      <path d="M10.7 10.7a2 2 0 0 0 2.6 2.6" />

                      <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5.5 0 9 6 9 6a15 15 0 0 1-2.2 2.8" />

                      <path d="M6.6 6.6C4.3 8.1 3 10 3 10s3.5 6 9 6a9.9 9.9 0 0 0 3-.5" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" />

                      <circle
                        cx="12"
                        cy="12"
                        r="2.5"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="remember-option">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(
                      event.target.checked
                    )
                  }
                  disabled={loading}
                />

                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="forgot-password"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            {errorMessage && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#B91C1C",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? "Signing in..."
                  : "Sign in to dashboard"}
              </span>

              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </button>
          </form>

          <div className="login-security">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6z" />
              <path d="m9 12 2 2 4-4" />
            </svg>

            <span>
              Your connection is protected and
              encrypted.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;