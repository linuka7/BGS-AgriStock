import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "../context/InventoryContext";
import "./AddProduct.css";
import { logoutUser } from "../utils/auth";

const categories = [
  {
    value: "insecticide",
    sinhala: "කෘමි නාශක",
    english: "Insecticides",
  },
  {
    value: "fungicide",
    sinhala: "දිලීර නාශක",
    english: "Fungicides",
  },
  {
    value: "herbicide",
    sinhala: "වල් නාශක",
    english: "Herbicides",
  },
  {
    value: "fertilizer",
    sinhala: "පොහොර",
    english: "Fertilizers",
  },
  {
    value: "bags",
    sinhala: "බෑග්",
    english: "Bags",
  },
];

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

    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </>
    ),

    invoice: (
      <>
        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
        <path d="M9 8h6M9 12h6M9 16h3" />
      </>
    ),

    quantity: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <path d="M8 12h8M12 8v8" />
      </>
    ),

    price: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 8h4.5a2 2 0 0 1 0 4H11a2 2 0 0 0 0 4h4" />
        <path d="M12 6v12" />
      </>
    ),

    minimum: (
      <>
        <path d="M4 18h16" />
        <path d="M7 14h10" />
        <path d="M10 10h4" />
        <path d="M12 4v6" />
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

    alert: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 17h.01" />
      </>
    ),

    history: (
      <>
        <path d="M4 12a8 8 0 1 0 3-6" />
        <path d="M4 4v5h5" />
        <path d="M12 7v5l3 2" />
      </>
    ),

    reset: (
      <>
        <path d="M4 12a8 8 0 1 0 3-6" />
        <path d="M4 4v5h5" />
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

const initialForm = {
  category: "insecticide",
  productName: "",
  size: "",
  invoiceNumber: "",
  expiryDate: "",
  receivedQuantity: "",
  minimumStock: "10",
  unitPrice: "",
};

function formatCurrency(value) {
  const amount = Number(value) || 0;

  return `LKR ${amount.toLocaleString("en-LK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function AddProduct() {
  const navigate = useNavigate();
  const handleLogout = () => {
  logoutUser();
  navigate("/login", { replace: true });
};

  const { addProduct, inventory, activities } = useInventory();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const selectedCategory =
    categories.find(
      (item) => item.value === form.category
    ) || categories[0];

  const calculatedStockValue = useMemo(() => {
    const quantity = Number(form.receivedQuantity) || 0;
    const price = Number(form.unitPrice) || 0;

    return quantity * price;
  }, [form.receivedQuantity, form.unitPrice]);

  const recentProducts = useMemo(() => {
    return activities
      .filter(
        (activity) => activity.type === "product-added"
      )
      .map((activity) => {
        const savedProduct = inventory.find(
          (item) =>
            String(item.id) ===
            String(activity.productId)
        );

        if (!savedProduct) {
          return null;
        }

        return {
          id: savedProduct.id,
          category: savedProduct.category,
          categorySinhala:
            savedProduct.categorySinhala,
          productName: savedProduct.name,
          size: savedProduct.size,
          invoiceNumber: savedProduct.invoice,
          expiryDate: savedProduct.expiry,
          receivedQuantity: savedProduct.received,
          balance: savedProduct.balance,
          minimum: savedProduct.minimum,
          unitPrice: savedProduct.unitPrice,
          stockValue:
            Number(savedProduct.balance || 0) *
            Number(savedProduct.unitPrice || 0),
          createdAt: new Date(
            activity.createdAt
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      })
      .filter(Boolean)
      .slice(0, 5);
  }, [activities, inventory]);

  const navigateTo = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setSuccessMessage("");
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.productName.trim()) {
      nextErrors.productName =
        "Enter the product name.";
    }

    if (!form.size.trim()) {
      nextErrors.size = "Enter the product size.";
    }

    if (!form.invoiceNumber.trim()) {
      nextErrors.invoiceNumber =
        "Enter the invoice number.";
    }

    if (!form.expiryDate) {
      nextErrors.expiryDate =
        "Select the expiry date.";
    }

    const receivedQuantity = Number(
      form.receivedQuantity
    );

    if (
      !Number.isInteger(receivedQuantity) ||
      receivedQuantity <= 0
    ) {
      nextErrors.receivedQuantity =
        "Received quantity must be a whole number greater than zero.";
    }

    const minimumStock = Number(form.minimumStock);

    if (
      !Number.isInteger(minimumStock) ||
      minimumStock < 0
    ) {
      nextErrors.minimumStock =
        "Minimum stock must be a whole number of zero or more.";
    }

    const unitPrice = Number(form.unitPrice);

    if (
      !Number.isFinite(unitPrice) ||
      unitPrice <= 0
    ) {
      nextErrors.unitPrice =
        "Unit price must be greater than zero.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setForm(initialForm);
    setErrors({});
    setSuccessMessage("");
  };

  const saveProduct = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const savedProduct = await addProduct({
      category: selectedCategory.english,
      categorySinhala: selectedCategory.sinhala,
      productName: form.productName,
      size: form.size,
      invoiceNumber: form.invoiceNumber,
      expiryDate: form.expiryDate,
      receivedQuantity: Number(
        form.receivedQuantity
      ),
      minimum: Number(form.minimumStock),
      unitPrice: Number(form.unitPrice),
    });

    setSuccessMessage(
      `${savedProduct.name} ${savedProduct.size} was added successfully.`
    );

    setForm((current) => ({
      ...initialForm,
      category: current.category,
    }));

    setErrors({});
  };

  return (
    <div className="add-product-page">
      <div
        className={`add-product-overlay ${
          sidebarOpen ? "show" : ""
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <aside
        className={`add-product-sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >
        <div className="add-product-brand">
          <div className="add-product-logo">
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

        <nav className="add-product-nav">
          <span className="add-product-nav-title">
            MAIN MENU
          </span>

          <button
            type="button"
            className="add-product-nav-item"
            onClick={() => navigateTo("/dashboard")}
          >
            <Icon name="dashboard" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className="add-product-nav-item"
            onClick={() =>
              navigateTo("/update-stock")
            }
          >
            <Icon name="stock" />
            <span>Update Stock</span>
          </button>

          <button
            type="button"
            className="add-product-nav-item"
            onClick={() =>
              navigateTo("/stock-report")
            }
          >
            <Icon name="report" />
            <span>Stock Report</span>
          </button>

          <button
            type="button"
            className="add-product-nav-item active"
            onClick={() => navigateTo("/add-product")}
          >
            <Icon name="add" />
            <span>Add Product</span>
          </button>

          <button
            type="button"
            className="add-product-nav-item"
            onClick={() => navigateTo("/analytics")}
          >
            <Icon name="analytics" />
            <span>Analytics</span>
          </button>
        </nav>

        <div className="add-product-sidebar-info">
          <div>
            <Icon name="package" />
          </div>

          <span>Selected category</span>
          <strong>{selectedCategory.english}</strong>
          <small>{selectedCategory.sinhala}</small>
        </div>

        <button
          type="button"
          className="add-product-logout"
          onClick={handleLogout}
        >
          <Icon name="logout" />
          <span>Sign out</span>
        </button>
      </aside>

      <main className="add-product-main">
        <header className="add-product-header">
          <div className="add-product-heading">
            <button
              type="button"
              className="add-product-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Icon name="menu" />
            </button>

            <div>
              <span>BGS AGRISTOCK</span>
              <h1>Add Product</h1>

              <p>
                Create a new inventory item with its
                opening stock balance.
              </p>
            </div>
          </div>

          <div className="add-product-date">
            <span>Today</span>

            <strong>
              {new Date().toLocaleDateString(
                "en-GB",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )}
            </strong>
          </div>
        </header>

        <section className="add-product-banner">
          <div>
            <span className="add-product-banner-tag">
              NEW INVENTORY ENTRY
            </span>

            <h2>
              Add a product.
              <br />
              Start tracking instantly.
            </h2>

            <p>
              Enter product, invoice, expiry, pricing
              and stock-level details. The received
              quantity becomes the opening balance.
            </p>
          </div>

          <div className="add-product-banner-logo">
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

        <section className="add-product-content">
          <form
            className="add-product-form-card"
            onSubmit={saveProduct}
          >
            <div className="add-product-card-header">
              <div>
                <span>PRODUCT INFORMATION</span>
                <h2>Create Inventory Item</h2>

                <p>
                  Complete all required product details
                  before saving.
                </p>
              </div>

              <div className="add-product-step">
                01
              </div>
            </div>

            <div className="add-product-form-grid">
              <div className="add-product-field add-product-full-field">
                <label htmlFor="add-category">
                  Category / වර්ගය
                </label>

                <div className="add-product-select-wrap">
                  <select
                    id="add-category"
                    name="category"
                    value={form.category}
                    onChange={updateField}
                  >
                    {categories.map((item) => (
                      <option
                        value={item.value}
                        key={item.value}
                      >
                        {item.sinhala} — {item.english}
                      </option>
                    ))}
                  </select>

                  <Icon name="chevron" size={18} />
                </div>
              </div>

              <div className="add-product-field">
                <label htmlFor="add-product-name">
                  Product Name / නිෂ්පාදනය
                </label>

                <div
                  className={`add-product-input-wrap ${
                    errors.productName
                      ? "has-error"
                      : ""
                  }`}
                >
                  <Icon name="package" size={18} />

                  <input
                    id="add-product-name"
                    name="productName"
                    type="text"
                    value={form.productName}
                    onChange={updateField}
                    placeholder="Example: Trebon"
                  />
                </div>

                {errors.productName && (
                  <span className="add-product-error">
                    {errors.productName}
                  </span>
                )}
              </div>

              <div className="add-product-field">
                <label htmlFor="add-size">
                  Size / ප්‍රමාණය
                </label>

                <div
                  className={`add-product-input-wrap ${
                    errors.size
                      ? "has-error"
                      : ""
                  }`}
                >
                  <Icon name="quantity" size={18} />

                  <input
                    id="add-size"
                    name="size"
                    type="text"
                    value={form.size}
                    onChange={updateField}
                    placeholder="Example: 400ml"
                  />
                </div>

                {errors.size && (
                  <span className="add-product-error">
                    {errors.size}
                  </span>
                )}
              </div>

              <div className="add-product-field">
                <label htmlFor="add-invoice">
                  Invoice Number / ඉන්වොයිස් අංකය
                </label>

                <div
                  className={`add-product-input-wrap ${
                    errors.invoiceNumber
                      ? "has-error"
                      : ""
                  }`}
                >
                  <Icon name="invoice" size={18} />

                  <input
                    id="add-invoice"
                    name="invoiceNumber"
                    type="text"
                    value={form.invoiceNumber}
                    onChange={updateField}
                    placeholder="Example: INV-2026-013"
                  />
                </div>

                {errors.invoiceNumber && (
                  <span className="add-product-error">
                    {errors.invoiceNumber}
                  </span>
                )}
              </div>

              <div className="add-product-field">
                <label htmlFor="add-expiry">
                  Expiry Date / කල් ඉකුත් වන දිනය
                </label>

                <div
                  className={`add-product-input-wrap ${
                    errors.expiryDate
                      ? "has-error"
                      : ""
                  }`}
                >
                  <Icon name="calendar" size={18} />

                  <input
                    id="add-expiry"
                    name="expiryDate"
                    type="date"
                    value={form.expiryDate}
                    onChange={updateField}
                  />
                </div>

                {errors.expiryDate && (
                  <span className="add-product-error">
                    {errors.expiryDate}
                  </span>
                )}
              </div>

              <div className="add-product-field">
                <label htmlFor="add-received">
                  Received Quantity / ලැබුණු ප්‍රමාණය
                </label>

                <div
                  className={`add-product-input-wrap ${
                    errors.receivedQuantity
                      ? "has-error"
                      : ""
                  }`}
                >
                  <Icon name="quantity" size={18} />

                  <input
                    id="add-received"
                    name="receivedQuantity"
                    type="number"
                    min="1"
                    step="1"
                    value={form.receivedQuantity}
                    onChange={updateField}
                    placeholder="Example: 25"
                  />
                </div>

                {errors.receivedQuantity && (
                  <span className="add-product-error">
                    {errors.receivedQuantity}
                  </span>
                )}
              </div>

              <div className="add-product-field">
                <label htmlFor="add-minimum">
                  Minimum Stock Level / අවම තොගය
                </label>

                <div
                  className={`add-product-input-wrap ${
                    errors.minimumStock
                      ? "has-error"
                      : ""
                  }`}
                >
                  <Icon name="minimum" size={18} />

                  <input
                    id="add-minimum"
                    name="minimumStock"
                    type="number"
                    min="0"
                    step="1"
                    value={form.minimumStock}
                    onChange={updateField}
                    placeholder="Example: 10"
                  />
                </div>

                {errors.minimumStock && (
                  <span className="add-product-error">
                    {errors.minimumStock}
                  </span>
                )}
              </div>

              <div className="add-product-field add-product-full-field">
                <label htmlFor="add-unit-price">
                  Unit Price — LKR / ඒකක මිල
                </label>

                <div
                  className={`add-product-input-wrap ${
                    errors.unitPrice
                      ? "has-error"
                      : ""
                  }`}
                >
                  <Icon name="price" size={18} />

                  <input
                    id="add-unit-price"
                    name="unitPrice"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.unitPrice}
                    onChange={updateField}
                    placeholder="Example: 1750"
                  />
                </div>

                {errors.unitPrice && (
                  <span className="add-product-error">
                    {errors.unitPrice}
                  </span>
                )}
              </div>
            </div>

            {successMessage && (
              <div className="add-product-success">
                <Icon name="check" />
                <span>{successMessage}</span>
              </div>
            )}

            {Object.keys(errors).length > 0 &&
              !successMessage && (
                <div className="add-product-warning">
                  <Icon name="alert" />

                  <span>
                    Please correct the highlighted
                    fields before saving.
                  </span>
                </div>
              )}

            <div className="add-product-form-actions">
              <button
                type="button"
                className="add-product-reset-button"
                onClick={resetForm}
              >
                <Icon name="reset" />
                <span>Reset Form</span>
              </button>

              <button
                type="submit"
                className="add-product-save-button"
              >
                <Icon name="save" />
                <span>Save Product</span>
              </button>
            </div>
          </form>

          <aside className="add-product-summary-card">
            <div className="add-product-card-header">
              <div>
                <span>LIVE PREVIEW</span>
                <h2>Product Summary</h2>

                <p>
                  Review the information before saving.
                </p>
              </div>

              <div className="add-product-step">
                02
              </div>
            </div>

            <div className="add-product-preview-product">
              <div className="add-product-preview-icon">
                <Icon name="package" size={28} />
              </div>

              <div>
                <span>{selectedCategory.sinhala}</span>

                <strong>
                  {form.productName || "Product name"}
                </strong>

                <small>
                  {form.size || "Product size"}
                </small>
              </div>
            </div>

            <div className="add-product-preview-grid">
              <div>
                <span>Category</span>
                <strong>
                  {selectedCategory.english}
                </strong>
              </div>

              <div>
                <span>Opening Balance</span>

                <strong>
                  {form.receivedQuantity || "0"}
                </strong>

                <small>received units</small>
              </div>
            </div>

            <div className="add-product-preview-details">
              <div>
                <span>Invoice Number</span>

                <strong>
                  {form.invoiceNumber ||
                    "Not entered"}
                </strong>
              </div>

              <div>
                <span>Expiry Date</span>

                <strong>
                  {form.expiryDate
                    ? new Date(
                        form.expiryDate
                      ).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "Not selected"}
                </strong>
              </div>

              <div>
                <span>Minimum Stock Level</span>

                <strong>
                  {form.minimumStock || "0"} units
                </strong>
              </div>

              <div>
                <span>Unit Price</span>

                <strong>
                  {formatCurrency(form.unitPrice)}
                </strong>
              </div>
            </div>

            <div className="add-product-balance-preview">
              <div>
                <span>Initial Stock Value</span>

                <small>
                  Received quantity × unit price
                </small>
              </div>

              <strong>
                {formatCurrency(
                  calculatedStockValue
                )}
              </strong>
            </div>
          </aside>
        </section>

        <section className="add-product-history-card">
          <div className="add-product-history-header">
            <div>
              <span>RECENTLY ADDED</span>
              <h2>New Inventory Products</h2>
            </div>

            <Icon name="history" size={23} />
          </div>

          {recentProducts.length === 0 ? (
            <div className="add-product-empty">
              <Icon name="package" size={29} />

              <strong>No products added yet</strong>

              <span>
                Your newly saved products will appear
                here.
              </span>
            </div>
          ) : (
            <div className="add-product-history-list">
              {recentProducts.map((item) => (
                <div
                  className="add-product-history-item"
                  key={item.id}
                >
                  <div className="add-product-history-product">
                    <div>
                      <Icon name="package" />
                    </div>

                    <span>
                      <strong>
                        {item.productName}
                      </strong>

                      <small>
                        {item.categorySinhala} ·{" "}
                        {item.category}
                      </small>
                    </span>
                  </div>

                  <div>
                    <strong>{item.size}</strong>
                    <span>Size</span>
                  </div>

                  <div>
                    <strong>
                      {item.receivedQuantity}
                    </strong>
                    <span>Received</span>
                  </div>

                  <div>
                    <strong>{item.balance}</strong>
                    <span>Balance</span>
                  </div>

                  <time>{item.createdAt}</time>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AddProduct;