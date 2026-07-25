function DashboardShowcase() {
  return (
    <section
      className="dashboard-showcase"
      id="analytics"
    >
      <div className="showcase-header">
        <h2>
          Powerful Insights
          <br />
          At Your Fingertips
        </h2>

        <p>
          Monitor inventory, analyze stock movement, and make
          smarter decisions with real-time business data.
        </p>
      </div>

      <div className="showcase-dashboard">
        <div className="showcase-top">
          <div className="showcase-brand">
            <span aria-hidden="true"></span>
            BGS AgriStock
          </div>

          <div
            className="showcase-dropdown-trigger showcase-static-period"
            aria-label="Analytics period: This Year"
          >
            <span>This Year</span>
          </div>
        </div>

        <div className="showcase-stats">
          <div>
            <strong>126</strong>
            <small>Products</small>
          </div>

          <div>
            <strong>Rs. 2.5M</strong>
            <small>Stock Value</small>
          </div>

          <div>
            <strong>+24%</strong>
            <small>Growth</small>
          </div>
        </div>

        <div className="showcase-chart">
          <div className="chart-head">
            <strong>Stock Movement Overview</strong>
            <span>+24%</span>
          </div>

          <div className="showcase-line">
            <svg
              viewBox="0 0 800 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="
                  M10 145
                  C100 130 135 95 220 105
                  C300 115 340 65 430 75
                  C510 85 575 35 680 45
                  C730 50 760 30 790 36
                "
                stroke="#A7F3D0"
                strokeWidth="7"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="showcase-points">
        <div>
          <h3>Real-Time Inventory</h3>
          <p>Track available stock instantly.</p>
        </div>

        <div>
          <h3>Smart Analytics</h3>
          <p>Understand product movement.</p>
        </div>

        <div>
          <h3>Business Reports</h3>
          <p>Make decisions using accurate data.</p>
        </div>
      </div>
    </section>
  );
}

export default DashboardShowcase;