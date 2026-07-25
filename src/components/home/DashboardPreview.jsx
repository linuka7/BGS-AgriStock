function DashboardPreview() {
  return (
    <div className="glass-system">
      <div className="glass-back"></div>

      <div className="glass-dashboard">
        <div className="glass-top">
          <div className="brand-mini">
            <span></span>
            BGS AgriStock
          </div>

          <div className="hero-dashboard-trigger hero-dashboard-static-period">
            Today
          </div>
        </div>

        <h4>Inventory Overview</h4>

        <div className="glass-stats">
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

        <div className="glass-chart">
          <div className="chart-title">
            <span>Stock Movement</span>
            <span>+24%</span>
          </div>

          <div className="graph">
            <svg
              viewBox="0 0 400 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="
                  M0 90
                  C50 80 70 55 120 65
                  C170 75 190 35 240 45
                  C290 55 330 15 400 25
                "
                stroke="#A7F3D0"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPreview;