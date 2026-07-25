function Features() {
  const features = [
    {
      number: "01",
      title: "Product Intelligence",
      text: "Manage fertilizers, chemicals, and agricultural products with structured digital records.",
    },
    {
      number: "02",
      title: "Smart Stock Control",
      text: "Track available quantities, updates, and stock movement without manual calculations.",
    },
    {
      number: "03",
      title: "Sales Insights",
      text: "Understand sales patterns and make better business decisions with organized data.",
    },
    {
      number: "04",
      title: "Digital Reports",
      text: "Generate clear reports and monitor business performance anytime.",
    },
  ];

  const scrollToAnalytics = () => {
    document
      .getElementById("analytics")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const handleExploreKeyDown = (event) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      scrollToAnalytics();
    }
  };

  return (
    <section
      id="solutions"
      className="features-section"
    >
      {/* Keeps old Hero/CTA scrolling functional */}
      <div
        id="features"
        aria-hidden="true"
      ></div>

      <div className="features-header">
        <h2>
          Everything You Need
          <br />
          To Run Your Agro Business
        </h2>

        <p>
          A complete digital platform designed to simplify
          inventory, sales, and daily operations.
        </p>
      </div>

      <div className="features-grid">
        {features.map((item) => (
          <div
            className="feature-card"
            key={item.number}
          >
            <div className="feature-top">
              <div className="feature-number">
                {item.number}
              </div>
            </div>

            <h3>{item.title}</h3>

            <p>{item.text}</p>

            <div
              className="feature-arrow"
              role="button"
              tabIndex="0"
              onClick={scrollToAnalytics}
              onKeyDown={handleExploreKeyDown}
              aria-label={`Explore ${item.title}`}
            >
              Explore →
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;