import { Link } from "react-router-dom";

function Footer() {
  const scrollToSection = (event, sectionId) => {
    event.preventDefault();

    document
      .getElementById(sectionId)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-brand-header">
            <div className="footer-logo">
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
              <h2>BGS AgriStock</h2>
              <span>Inventory Intelligence</span>
            </div>
          </div>

          <p>
            A smarter way to manage agricultural inventory,
            products, stock movement and daily operations.
          </p>

          <Link
            className="footer-login"
            to="/login"
          >
            Administrator Login →
          </Link>
        </div>

        <div className="footer-links">
          <div>
            <h4>Platform</h4>

            <a
              href="#platform"
              onClick={(event) =>
                scrollToSection(event, "platform")
              }
            >
              Platform
            </a>

            <a
              href="#solutions"
              onClick={(event) =>
                scrollToSection(event, "solutions")
              }
            >
              Solutions
            </a>

            <a
              href="#analytics"
              onClick={(event) =>
                scrollToSection(event, "analytics")
              }
            >
              Analytics
            </a>
          </div>

          <div>
            <h4>Company</h4>

            <a
              href="#about"
              onClick={(event) =>
                scrollToSection(event, "about")
              }
            >
              About
            </a>

            <a
              href="#contact"
              onClick={(event) =>
                scrollToSection(event, "contact")
              }
            >
              Contact
            </a>

            <Link to="/login">
              Login
            </Link>
          </div>

          <div>
            <h4>Contact</h4>

            <a href="tel:+94712345678">
              +94 71 234 5678
            </a>

            <a href="mailto:hello@bgsagristock.lk">
              hello@bgsagristock.lk
            </a>

            <span>
              Balangoda, Sri Lanka
            </span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © 2026 BGS AgriStock. All rights reserved.
        </p>

        <p>
          Designed &amp; Developed by{" "}
          <strong>Linuka Bandara</strong>
        </p>
      </div>
    </footer>
  );
}

export default Footer;