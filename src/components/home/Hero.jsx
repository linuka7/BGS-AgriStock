import { useNavigate } from "react-router-dom";
import DashboardPreview from "./DashboardPreview";

function Hero() {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    document
      .getElementById("features")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <h1>
          Intelligent Technology
          <br />
          For The Future Of
          <br />
          Agriculture
        </h1>

        <p>
          BGS AgriStock transforms traditional
          fertilizer and agrochemical businesses
          into smart, data-driven operations with
          powerful inventory intelligence.
        </p>

        <div className="hero-buttons">
          <button
            type="button"
            className="hero-primary-btn"
            onClick={() => navigate("/login")}
          >
            Start Managing Stock →
          </button>

          <button
            type="button"
            className="hero-secondary-btn"
            onClick={scrollToFeatures}
          >
            Explore Platform
          </button>
        </div>
      </div>

      <div className="hero-visual">
        <div className="abstract-glow"></div>

        <DashboardPreview />
      </div>
    </section>
  );
}

export default Hero;