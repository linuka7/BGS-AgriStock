import { useState } from "react";

function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const subject = encodeURIComponent(
      `BGS AgriStock enquiry from ${formData.name}`
    );

    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    );

    window.location.href =
      `mailto:hello@bgsagristock.lk?subject=${subject}&body=${body}`;
  };

  return (
    <section
      id="contact"
      className="contact-section"
    >
      <div className="contact-content">
        <span className="contact-label">
          CONTACT US
        </span>

        <h2>
          Let&apos;s Build A Smarter
          <br />
          Agriculture Business
        </h2>

        <p>
          Contact BGS AgriStock for inventory support,
          system information, or assistance with managing
          your agricultural products.
        </p>

        <div className="contact-details">
          <a
            className="contact-detail-card"
            href="tel:+94712345678"
          >
            <span className="contact-detail-icon">
              ☎
            </span>

            <div>
              <small>Phone</small>
              <strong>+94 71 234 5678</strong>
            </div>
          </a>

          <a
            className="contact-detail-card"
            href="mailto:hello@bgsagristock.lk"
          >
            <span className="contact-detail-icon">
              ✉
            </span>

            <div>
              <small>Email</small>
              <strong>
                hello@bgsagristock.lk
              </strong>
            </div>
          </a>

          <div className="contact-detail-card">
            <span className="contact-detail-icon">
              ⌖
            </span>

            <div>
              <small>Location</small>
              <strong>
                Balangoda, Sri Lanka
              </strong>
            </div>
          </div>

          <div className="contact-detail-card">
            <span className="contact-detail-icon">
              ◷
            </span>

            <div>
              <small>Business Hours</small>
              <strong>
                Mon–Sat, 8:00 AM–5:30 PM
              </strong>
            </div>
          </div>
        </div>
      </div>

      <form
        className="contact-form"
        onSubmit={handleSubmit}
      >
        <span className="contact-form-label">
          SEND A MESSAGE
        </span>

        <h3>How Can We Help?</h3>

        <div className="contact-field">
          <label htmlFor="contact-name">
            Full Name
          </label>

          <input
            id="contact-name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="contact-field">
          <label htmlFor="contact-email">
            Email Address
          </label>

          <input
            id="contact-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="contact-field">
          <label htmlFor="contact-message">
            Message
          </label>

          <textarea
            id="contact-message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us how we can help..."
            rows="5"
            required
          ></textarea>
        </div>

        <button
          type="submit"
          className="contact-submit-button"
        >
          Send Message →
        </button>
      </form>
    </section>
  );
}

export default ContactSection;