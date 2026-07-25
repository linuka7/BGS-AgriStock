import { useNavigate } from "react-router-dom";
import "./ModulePage.css";

function ModulePage({ title, description }) {
  const navigate = useNavigate();

  return (
    <main className="module-page">
      <section className="module-card">
        <div className="module-logo">
          <svg viewBox="0 0 48 48" aria-hidden="true">
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

        <span>BGS AGRISTOCK</span>
        <h1>{title}</h1>
        <p>{description}</p>

        <button type="button" onClick={() => navigate("/dashboard")}>
          Return to Dashboard
        </button>
      </section>
    </main>
  );
}

export default ModulePage;