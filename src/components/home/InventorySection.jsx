function InventorySection() {
  return (
    <section
      id="platform"
      className="inventory-section"
    >
      <div className="inventory-content">
        <h2>
          From Manual Records
          <br />
          To Intelligent Control
        </h2>

        <p>
          Replace manual stock records with a smarter
          system built for fertilizer and agrochemical
          businesses.
        </p>

        <div className="inventory-points">
          <div>
            <span>✓</span>
            Product Organization
          </div>

          <div>
            <span>✓</span>
            Category Management
          </div>

          <div>
            <span>✓</span>
            Stock Movement Tracking
          </div>
        </div>
      </div>

      <div className="inventory-visual">
        <div className="inventory-card">
          <div className="inventory-header">
            <h3>Inventory Flow</h3>
            <span>Active</span>
          </div>

          <div className="category-item">
            <div className="category-name">
              Insecticides
            </div>

            <div className="progress">
              <div className="progress-fill insect"></div>
            </div>
          </div>

          <div className="category-item">
            <div className="category-name">
              Herbicides
            </div>

            <div className="progress">
              <div className="progress-fill herb"></div>
            </div>
          </div>

          <div className="category-item">
            <div className="category-name">
              Fungicides
            </div>

            <div className="progress">
              <div className="progress-fill fungi"></div>
            </div>
          </div>

          <div className="category-item">
            <div className="category-name">
              Fertilizers
            </div>

            <div className="progress">
              <div className="progress-fill fert"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default InventorySection;