import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useInventory } from "../context/InventoryContext";
import "./UpdateStock.css";
import { logoutUser } from "../utils/auth";

function Icon({ name, size = 20 }) {
  const icons = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),

    stock: (
      <>
        <path d="M4 7 12 3l8 4-8 4z" />
        <path d="M4 7v10l8 4 8-4V7" />
        <path d="M12 11v10" />
      </>
    ),

    report: (
      <>
        <path d="M5 3h10l4 4v14H5z" />
        <path d="M15 3v5h5" />
        <path d="M8 13h8M8 17h8M8 9h3" />
      </>
    ),

    add: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </>
    ),

    analytics: (
      <>
        <path d="M4 19V9M10 19V5M16 19v-7M22 19V3" />
        <path d="M2 19h22" />
      </>
    ),

    logout: (
      <>
        <path d="M10 5H5v14h5" />
        <path d="M14 8l4 4-4 4" />
        <path d="M18 12H9" />
      </>
    ),

    menu: <path d="M4 7h16M4 12h16M4 17h16" />,

    chevron: <path d="m7 10 5 5 5-5" />,

    package: (
      <>
        <path d="M4 7 12 3l8 4-8 4z" />
        <path d="M4 7v10l8 4 8-4V7" />
        <path d="M12 11v10" />
      </>
    ),

    save: (
      <>
        <path d="M5 4h12l2 2v14H5z" />
        <path d="M8 4v6h8V4" />
        <path d="M8 20v-6h8v6" />
      </>
    ),

    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),

    history: (
      <>
        <path d="M4 12a8 8 0 1 0 3-6" />
        <path d="M4 4v5h5" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function UpdateStock() {
  const navigate = useNavigate();

  const handleLogout = () => {
  logoutUser();
  navigate("/login", { replace: true });
};

  const location = useLocation();

  const { inventory, activities, updateStock } = useInventory();

  const firstInventoryItem = inventory[0] || null;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [category, setCategory] = useState(
    firstInventoryItem?.category || ""
  );

  const [product, setProduct] = useState(
    firstInventoryItem?.name || ""
  );

  const [size, setSize] = useState(
    firstInventoryItem?.size || ""
  );

  const [soldQuantity, setSoldQuantity] = useState(
    firstInventoryItem?.balance > 0 ? 1 : 0
  );

  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
  const requestedProductId = location.state?.productId;

  if (!requestedProductId || inventory.length === 0) {
    return;
  }

  const requestedProduct = inventory.find(
    (item) => String(item.id) === String(requestedProductId)
  );

  if (!requestedProduct) {
    return;
  }

  setCategory(requestedProduct.category);
  setProduct(requestedProduct.name);
  setSize(requestedProduct.size);

  setSoldQuantity(
    Number(requestedProduct.balance || 0) > 0 ? 1 : 0
  );

  setSuccessMessage("");

  navigate(location.pathname, {
    replace: true,
    state: null,
  });
}, [
  inventory,
  location.pathname,
  location.state,
  navigate,
]);

  const categoryOptions = useMemo(() => {
    const categoryMap = new Map();

    inventory.forEach((item) => {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, {
          english: item.category,
          sinhala: item.categorySinhala || item.category,
        });
      }
    });

    return Array.from(categoryMap.values());
  }, [inventory]);

  const selectedCategory =
    categoryOptions.find((item) => item.english === category) || {
      english: category,
      sinhala: category,
    };

  const productsInCategory = useMemo(() => {
    return inventory.filter((item) => item.category === category);
  }, [inventory, category]);

  const productNames = useMemo(() => {
    return [
      ...new Set(productsInCategory.map((item) => item.name)),
    ];
  }, [productsInCategory]);

  const sizes = useMemo(() => {
    return [
      ...new Set(
        productsInCategory
          .filter((item) => item.name === product)
          .map((item) => item.size)
      ),
    ];
  }, [productsInCategory, product]);

  const selectedInventoryItem = useMemo(() => {
    return (
      inventory.find(
        (item) =>
          item.category === category &&
          item.name === product &&
          item.size === size
      ) || null
    );
  }, [inventory, category, product, size]);

  const currentBalance = Number(
    selectedInventoryItem?.balance || 0
  );

  const safeSoldQuantity = Math.min(
    Number(soldQuantity) || 0,
    currentBalance
  );

  const newBalance = Math.max(
    currentBalance - safeSoldQuantity,
    0
  );

  const recentUpdates = useMemo(() => {
    return activities
      .filter((activity) => activity.type === "stock-updated")
      .map((activity) => {
        const relatedProduct = inventory.find(
          (item) =>
            String(item.id) === String(activity.productId)
        );

        return {
          id: activity.id,
          product: activity.productName,
          size: activity.size,
          category: relatedProduct?.category || "Inventory",
          sold: activity.quantity,
          balance: activity.balance,
          time: new Date(activity.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      })
      .slice(0, 4);
  }, [activities, inventory]);

  const navigateTo = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const changeCategory = (event) => {
    const nextCategory = event.target.value;

    const categoryProducts = inventory.filter(
      (item) => item.category === nextCategory
    );

    const firstProduct = categoryProducts[0]?.name || "";

    const firstSize =
      categoryProducts.find(
        (item) => item.name === firstProduct
      )?.size || "";

    const firstSelectedItem = categoryProducts.find(
      (item) =>
        item.name === firstProduct && item.size === firstSize
    );

    setCategory(nextCategory);
    setProduct(firstProduct);
    setSize(firstSize);

    setSoldQuantity(
      Number(firstSelectedItem?.balance || 0) > 0 ? 1 : 0
    );

    setSuccessMessage("");
  };

  const changeProduct = (event) => {
    const nextProduct = event.target.value;

    const productItems = inventory.filter(
      (item) =>
        item.category === category &&
        item.name === nextProduct
    );

    const firstSize = productItems[0]?.size || "";

    const firstSelectedItem = productItems.find(
      (item) => item.size === firstSize
    );

    setProduct(nextProduct);
    setSize(firstSize);

    setSoldQuantity(
      Number(firstSelectedItem?.balance || 0) > 0 ? 1 : 0
    );

    setSuccessMessage("");
  };

  const changeSize = (event) => {
    const nextSize = event.target.value;

    const nextSelectedItem = inventory.find(
      (item) =>
        item.category === category &&
        item.name === product &&
        item.size === nextSize
    );

    setSize(nextSize);

    setSoldQuantity(
      Number(nextSelectedItem?.balance || 0) > 0 ? 1 : 0
    );

    setSuccessMessage("");
  };

  const decreaseQuantity = () => {
    setSoldQuantity((current) =>
      Math.max(Number(current) - 1, 1)
    );

    setSuccessMessage("");
  };

  const increaseQuantity = () => {
    if (currentBalance <= 0) {
      return;
    }

    setSoldQuantity((current) =>
      Math.min(Number(current) + 1, currentBalance)
    );

    setSuccessMessage("");
  };

  const handleQuantityInput = (event) => {
    const rawValue = event.target.value;

    if (rawValue === "") {
      setSoldQuantity("");
      setSuccessMessage("");
      return;
    }

    const value = Number(rawValue);

    if (!Number.isFinite(value)) {
      return;
    }

    if (currentBalance <= 0) {
      setSoldQuantity(0);
      return;
    }

    const wholeNumber = Math.floor(value);

    setSoldQuantity(
      Math.min(Math.max(wholeNumber, 1), currentBalance)
    );

    setSuccessMessage("");
  };

  const saveStockUpdate = async () => {
  if (!selectedInventoryItem) {
    setSuccessMessage("Please select a valid product.");
    return;
  }

  if (currentBalance <= 0) {
    setSuccessMessage(
      "This product is already out of stock."
    );
    return;
  }

  const quantity = Number(soldQuantity);

  if (!Number.isInteger(quantity) || quantity <= 0) {
    setSuccessMessage(
      "Enter a valid sold quantity greater than zero."
    );
    return;
  }

  try {
    const result = await updateStock({
      productId: selectedInventoryItem.id,
      soldQuantity: quantity,
    });

    setSuccessMessage(result.message);

    if (result.success) {
      setSoldQuantity(
        result.newBalance > 0 ? 1 : 0
      );
    }
  } catch (error) {
    setSuccessMessage(
      error.message || "Unable to update stock."
    );
  }
};

  if (inventory.length === 0) {
    return (
      <div className="update-stock-page">
        <main
          className="update-stock-main"
          style={{
            width: "100%",
            marginLeft: 0,
            display: "grid",
            placeItems: "center",
          }}
        >
          <section
            className="update-stock-form-card"
            style={{ maxWidth: 560, textAlign: "center" }}
          >
            <Icon name="package" size={40} />

            <h2>No products available</h2>

            <p>
              Add your first product before recording stock
              sales.
            </p>

            <button
              type="button"
              className="update-stock-save-button"
              onClick={() => navigate("/add-product")}
            >
              <Icon name="add" />
              <span>Add Product</span>
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="update-stock-page">
      <div
        className={`update-stock-overlay ${
          sidebarOpen ? "show" : ""
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <aside
        className={`update-stock-sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >
        <div className="update-stock-brand">
          <div className="update-stock-logo">
            <svg viewBox="0 0 48 48" aria-hidden="true">
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
            <strong>BGS AgriStock</strong>
            <span>Inventory Intelligence</span>
          </div>
        </div>

        <nav className="update-stock-nav">
          <span className="update-stock-nav-title">
            MAIN MENU
          </span>

          <button
            type="button"
            className="update-stock-nav-item"
            onClick={() => navigateTo("/dashboard")}
          >
            <Icon name="dashboard" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className="update-stock-nav-item active"
            onClick={() => navigateTo("/update-stock")}
          >
            <Icon name="stock" />
            <span>Update Stock</span>
          </button>

          <button
            type="button"
            className="update-stock-nav-item"
            onClick={() => navigateTo("/stock-report")}
          >
            <Icon name="report" />
            <span>Stock Report</span>
          </button>

          <button
            type="button"
            className="update-stock-nav-item"
            onClick={() => navigateTo("/add-product")}
          >
            <Icon name="add" />
            <span>Add Product</span>
          </button>

          <button
            type="button"
            className="update-stock-nav-item"
            onClick={() => navigateTo("/analytics")}
          >
            <Icon name="analytics" />
            <span>Analytics</span>
          </button>
        </nav>

        <div className="update-stock-sidebar-info">
          <div>
            <Icon name="package" />
          </div>

          <span>Selected balance</span>
          <strong>{currentBalance} units</strong>

          <small>
            {product} · {size}
          </small>
        </div>

        <button
          type="button"
          className="update-stock-logout"
          onClick={handleLogout}
        >
          <Icon name="logout" />
          <span>Sign out</span>
        </button>
      </aside>

      <main className="update-stock-main">
        <header className="update-stock-header">
          <div className="update-stock-heading">
            <button
              type="button"
              className="update-stock-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Icon name="menu" />
            </button>

            <div>
              <span>BGS AGRISTOCK</span>
              <h1>Update Stock</h1>

              <p>
                Record products sold and automatically update
                the balance.
              </p>
            </div>
          </div>

          <div className="update-stock-date">
            <span>Today</span>

            <strong>
              {new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </strong>
          </div>
        </header>

        <section className="update-stock-banner">
          <div>
            <span className="update-stock-banner-tag">
              DAILY STOCK MANAGEMENT
            </span>

            <h2>
              Select the product.
              <br />
              Enter today&apos;s sold quantity.
            </h2>

            <p>
              The remaining stock balance will be calculated
              automatically before saving.
            </p>
          </div>

          <div className="update-stock-banner-logo">
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <path
                d="M78 16C47 17 24 34 20 68c21 1 39-8 51-27-8 21-23 34-48 42"
                fill="none"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M23 82c18-1 32 5 43 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </section>

        <section className="update-stock-content">
          <article className="update-stock-form-card">
            <div className="update-stock-card-header">
              <div>
                <span>STOCK ENTRY</span>
                <h2>Product Selection</h2>

                <p>
                  Select each option before entering the sold
                  quantity.
                </p>
              </div>

              <div className="update-stock-step">01</div>
            </div>

            <div className="update-stock-form-grid">
              <div className="update-stock-field">
                <label htmlFor="stock-category">
                  Category / වර්ගය
                </label>

                <div className="update-stock-select-wrap">
                  <select
                    id="stock-category"
                    value={category}
                    onChange={changeCategory}
                  >
                    {categoryOptions.map((item) => (
                      <option
                        key={item.english}
                        value={item.english}
                      >
                        {item.sinhala} — {item.english}
                      </option>
                    ))}
                  </select>

                  <Icon name="chevron" size={18} />
                </div>
              </div>

              <div className="update-stock-field">
                <label htmlFor="stock-product">
                  Product Name / නිෂ්පාදනය
                </label>

                <div className="update-stock-select-wrap">
                  <select
                    id="stock-product"
                    value={product}
                    onChange={changeProduct}
                  >
                    {productNames.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <Icon name="chevron" size={18} />
                </div>
              </div>

              <div className="update-stock-field">
                <label htmlFor="stock-size">
                  Size / ප්‍රමාණය
                </label>

                <div className="update-stock-select-wrap">
                  <select
                    id="stock-size"
                    value={size}
                    onChange={changeSize}
                  >
                    {sizes.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <Icon name="chevron" size={18} />
                </div>
              </div>
            </div>

            <div className="update-stock-quantity-section">
              <div>
                <span>SOLD QUANTITY</span>
                <h3>අද විකිණූ ප්‍රමාණය</h3>

                <p>
                  Use the buttons or type the quantity manually.
                </p>
              </div>

              <div className="update-stock-stepper">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={
                    soldQuantity <= 1 || currentBalance <= 0
                  }
                  aria-label="Decrease sold quantity"
                >
                  −
                </button>

                <input
                  type="number"
                  min={currentBalance > 0 ? 1 : 0}
                  max={currentBalance}
                  value={soldQuantity}
                  onChange={handleQuantityInput}
                  disabled={currentBalance <= 0}
                />

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={
                    soldQuantity >= currentBalance ||
                    currentBalance <= 0
                  }
                  aria-label="Increase sold quantity"
                >
                  +
                </button>
              </div>
            </div>

            {successMessage && (
              <div className="update-stock-message">
                <Icon name="check" />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="button"
              className="update-stock-save-button"
              onClick={saveStockUpdate}
              disabled={
                currentBalance <= 0 || !selectedInventoryItem
              }
            >
              <Icon name="save" />
              <span>Save Stock Update</span>
            </button>
          </article>

          <aside className="update-stock-summary-card">
            <div className="update-stock-card-header">
              <div>
                <span>LIVE SUMMARY</span>
                <h2>Balance Preview</h2>

                <p>
                  Check the stock figures before saving.
                </p>
              </div>

              <div className="update-stock-step">02</div>
            </div>

            <div className="update-stock-product-summary">
              <div className="update-stock-product-icon">
                <Icon name="package" size={28} />
              </div>

              <div>
                <span>{selectedCategory.sinhala}</span>
                <strong>{product}</strong>
                <small>{size}</small>
              </div>
            </div>

            <div className="update-stock-balance-grid">
              <div>
                <span>Current Balance</span>
                <strong>{currentBalance}</strong>
                <small>units available</small>
              </div>

              <div>
                <span>Sold Today</span>
                <strong>{safeSoldQuantity}</strong>
                <small>units selected</small>
              </div>
            </div>

            <div className="update-stock-new-balance">
              <div>
                <span>New Balance</span>
                <small>After saving this update</small>
              </div>

              <strong>{newBalance}</strong>
            </div>

            <div className="update-stock-progress">
              <div>
                <span>Remaining stock</span>

                <strong>
                  {currentBalance > 0
                    ? Math.round(
                        (newBalance / currentBalance) * 100
                      )
                    : 0}
                  %
                </strong>
              </div>

              <div className="update-stock-progress-track">
                <span
                  style={{
                    width: `${
                      currentBalance > 0
                        ? (newBalance / currentBalance) * 100
                        : 0
                    }%`,
                  }}
                ></span>
              </div>
            </div>
          </aside>
        </section>

        <section className="update-stock-history-card">
          <div className="update-stock-history-header">
            <div>
              <span>RECENT UPDATES</span>
              <h2>Today&apos;s Stock Activity</h2>
            </div>

            <Icon name="history" size={23} />
          </div>

          {recentUpdates.length === 0 ? (
            <div className="update-stock-empty">
              <Icon name="history" size={28} />
              <strong>No stock updates yet</strong>

              <span>
                Your saved updates will appear here.
              </span>
            </div>
          ) : (
            <div className="update-stock-history-list">
              {recentUpdates.map((item) => (
                <div
                  className="update-stock-history-item"
                  key={item.id}
                >
                  <div>
                    <strong>{item.product}</strong>

                    <span>
                      {item.category} · {item.size}
                    </span>
                  </div>

                  <div>
                    <strong>-{item.sold}</strong>
                    <span>Sold</span>
                  </div>

                  <div>
                    <strong>{item.balance}</strong>
                    <span>Balance</span>
                  </div>

                  <time>{item.time}</time>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default UpdateStock;