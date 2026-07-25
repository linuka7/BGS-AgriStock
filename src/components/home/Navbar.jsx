import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const scrollToSection = (event, sectionId) => {
    event.preventDefault();

    const section =
      document.getElementById(sectionId);

    section?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <header className="navbar">
      <button
        type="button"
        className="brand"
        onClick={scrollToTop}
        aria-label="Go to the top of the page"
      >
        <div className="logo-mark">
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

        <div className="brand-text">
          <h2>BGS AgriStock</h2>
          <span>Inventory Intelligence</span>
        </div>
      </button>

      <nav aria-label="Landing page navigation">
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
      </nav>

      <div className="nav-actions">
        <Link
          className="login"
          to="/login"
        >
          Login
        </Link>

        <button
          type="button"
          onClick={() => navigate("/login")}
        >
          Get Started →
        </button>
      </div>
    </header>
  );
}

export default Navbar;