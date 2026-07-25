import { useNavigate } from "react-router-dom";

function CTASection() {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    document
      .getElementById("features")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  return (
    <section className="cta-section">
      <div className="cta-box">
        <h2>
          Ready To Transform
          <br />
          Your Agriculture Business?
        </h2>

        <p>
          Start managing inventory smarter with
          BGS AgriStock and take control of your
          daily operations.
        </p>

        <div className="cta-buttons">
          <button
            type="button"
            className="cta-primary"
            onClick={() => navigate("/login")}
          >
            Get Started →
          </button>

          <button
            type="button"
            className="cta-secondary"
            onClick={scrollToFeatures}
          >
            Explore Platform
          </button>
        </div>
      </div>
    </section>
  );
}

export default CTASection;