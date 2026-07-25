import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useInventory } from "../context/InventoryContext";
import "./StockReport.css";
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

    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),

    chevron: <path d="m7 10 5 5 5-5" />,

    package: (
      <>
        <path d="M4 7 12 3l8 4-8 4z" />
        <path d="M4 7v10l8 4 8-4V7" />
        <path d="M12 11v10" />
      </>
    ),

    alert: (
      <>
        <path d="M12 3 2.8 19h18.4z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    ),

    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </>
    ),

    filter: <path d="M4 5h16l-6 7v6l-4 2v-8z" />,

    eye: (
      <>
        <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),

    download: (
      <>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M4 20h16" />
      </>
    ),

    close: <path d="M6 6l12 12M18 6 6 18" />,
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

function getStockStatus(item) {
  const balance = Number(item.balance || 0);
  const minimum = Number(item.minimum || 0);

  if (balance === 0) {
    return {
      label: "Out of Stock",
      className: "out",
    };
  }

  if (balance <= minimum) {
    return {
      label: "Low Stock",
      className: "low",
    };
  }

  return {
    label: "In Stock",
    className: "available",
  };
}

function getExpiryStatus(expiryDate) {
  if (!expiryDate) {
    return {
      label: "Not Set",
      className: "valid",
    };
  }

  const today = new Date();
  const expiry = new Date(expiryDate);

  if (Number.isNaN(expiry.getTime())) {
    return {
      label: "Not Set",
      className: "valid",
    };
  }

  const difference = expiry.getTime() - today.getTime();

  const daysRemaining = Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );

  if (daysRemaining < 0) {
    return {
      label: "Expired",
      className: "expired",
    };
  }

  if (daysRemaining <= 90) {
    return {
      label: "Expiring Soon",
      className: "soon",
    };
  }

  return {
    label: "Valid",
    className: "valid",
  };
}

function formatCurrency(value) {
  const amount = Number(value) || 0;

  return `LKR ${amount.toLocaleString("en-LK")}`;
}

function formatDate(date) {
  if (!date) {
    return "Not set";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not set";
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StockReport() {
  const navigate = useNavigate();

  const handleLogout = () => {
  logoutUser();
  navigate("/login", { replace: true });
};

  const [searchParams] = useSearchParams();
  const { inventory, restockProduct } = useInventory();

  const searchQuery = searchParams.get("search") || "";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchText, setSearchText] = useState(searchQuery);

  const [categoryFilter, setCategoryFilter] =
    useState("All Categories");

  const [statusFilter, setStatusFilter] =
    useState("All Statuses");

  const [selectedProductId, setSelectedProductId] =
    useState(null);

  const [restockOpen, setRestockOpen] =
    useState(false);

  const [restockForm, setRestockForm] =
    useState({
      restockQuantity: "",
      invoiceNumber: "",
      expiryDate: "",
      unitPrice: "",
    });

  const [restockSubmitting, setRestockSubmitting] =
    useState(false);

  const [restockMessage, setRestockMessage] =
    useState({
      type: "",
      text: "",
    });

  useEffect(() => {
    setSearchText(searchQuery);
  }, [searchQuery]);

  const stockData = useMemo(() => {
    return inventory.map((item) => {
      const received = Number(item.received || 0);
      const balance = Number(item.balance || 0);
      const unitPrice = Number(item.unitPrice || 0);

      return {
        ...item,
        received,
        balance,
        minimum: Number(item.minimum || 0),
        sold: Math.max(received - balance, 0),
        value: balance * unitPrice,
      };
    });
  }, [inventory]);

  const selectedProduct = useMemo(() => {
    return (
      stockData.find(
        (item) =>
          String(item.id) === String(selectedProductId)
      ) || null
    );
  }, [stockData, selectedProductId]);

  useEffect(() => {
    if (!selectedProduct) {
      setRestockOpen(false);
      setRestockMessage({
        type: "",
        text: "",
      });

      return;
    }

    setRestockForm({
      restockQuantity: "",
      invoiceNumber:
        selectedProduct.invoice || "",
      expiryDate:
        selectedProduct.expiry || "",
      unitPrice: String(
        selectedProduct.unitPrice ?? ""
      ),
    });

    setRestockOpen(false);
    setRestockMessage({
      type: "",
      text: "",
    });
  }, [selectedProduct?.id]);

  const categories = useMemo(() => {
    return [
      "All Categories",
      ...new Set(
        stockData
          .map((item) => item.category)
          .filter(Boolean)
      ),
    ];
  }, [stockData]);

  const filteredProducts = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return stockData.filter((item) => {
      const stockStatus = getStockStatus(item).label;

      const name = String(item.name || "").toLowerCase();
      const size = String(item.size || "").toLowerCase();
      const invoice = String(item.invoice || "").toLowerCase();
      const category = String(
        item.category || ""
      ).toLowerCase();

      const matchesSearch =
        !search ||
        name.includes(search) ||
        size.includes(search) ||
        invoice.includes(search) ||
        category.includes(search);

      const matchesCategory =
        categoryFilter === "All Categories" ||
        item.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All Statuses" ||
        stockStatus === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    stockData,
    searchText,
    categoryFilter,
    statusFilter,
  ]);

  const reportSummary = useMemo(() => {
    const totalBalance = filteredProducts.reduce(
      (total, item) =>
        total + Number(item.balance || 0),
      0
    );

    const totalValue = filteredProducts.reduce(
      (total, item) =>
        total + Number(item.value || 0),
      0
    );

    const lowStock = filteredProducts.filter(
      (item) =>
        getStockStatus(item).className === "low"
    ).length;

    const expiringSoon = filteredProducts.filter(
      (item) =>
        getExpiryStatus(item.expiry).className === "soon"
    ).length;

    return {
      totalBalance,
      totalValue,
      lowStock,
      expiringSoon,
    };
  }, [filteredProducts]);

  const navigateTo = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const clearFilters = () => {
    setSearchText("");
    setCategoryFilter("All Categories");
    setStatusFilter("All Statuses");

    navigate("/stock-report", {
      replace: true,
    });
  };

  const closeProductModal = () => {
    if (restockSubmitting) {
      return;
    }

    setSelectedProductId(null);
    setRestockOpen(false);
    setRestockMessage({
      type: "",
      text: "",
    });
  };

  const handleRestockFieldChange = (event) => {
    const { name, value } = event.target;

    setRestockForm((current) => ({
      ...current,
      [name]: value,
    }));

    setRestockMessage({
      type: "",
      text: "",
    });
  };

  const handleRestockSubmit = async (event) => {
    event.preventDefault();

    if (!selectedProduct) {
      return;
    }

    const quantity = Number(
      restockForm.restockQuantity
    );

    const price = Number(restockForm.unitPrice);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setRestockMessage({
        type: "error",
        text:
          "Restock quantity must be a whole number greater than zero.",
      });

      return;
    }

    if (!restockForm.invoiceNumber.trim()) {
      setRestockMessage({
        type: "error",
        text: "Enter the invoice number.",
      });

      return;
    }

    if (!restockForm.expiryDate) {
      setRestockMessage({
        type: "error",
        text: "Select the expiry date.",
      });

      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setRestockMessage({
        type: "error",
        text: "Unit price cannot be negative.",
      });

      return;
    }

    setRestockSubmitting(true);
    setRestockMessage({
      type: "",
      text: "",
    });

    try {
      const result = await restockProduct({
        productId: selectedProduct.id,
        restockQuantity: quantity,
        invoiceNumber:
          restockForm.invoiceNumber.trim(),
        expiryDate: restockForm.expiryDate,
        unitPrice: price,
      });

      setRestockForm((current) => ({
        ...current,
        restockQuantity: "",
      }));

      setRestockMessage({
        type: "success",
        text:
          result.message ||
          "Product restocked successfully.",
      });
    } catch (requestError) {
      setRestockMessage({
        type: "error",
        text:
          requestError.message ||
          "Unable to restock the product.",
      });
    } finally {
      setRestockSubmitting(false);
    }
  };

  const downloadReport = () => {
    if (filteredProducts.length === 0) {
      return;
    }

    const headings = [
      "Product",
      "Category",
      "Size",
      "Balance",
      "Minimum",
      "Received",
      "Sold",
      "Invoice",
      "Expiry",
      "Unit Price",
      "Stock Value",
      "Stock Status",
    ];

    const rows = filteredProducts.map((item) => [
      item.name,
      item.category,
      item.size,
      item.balance,
      item.minimum,
      item.received,
      item.sold,
      item.invoice,
      item.expiry,
      item.unitPrice,
      item.value,
      getStockStatus(item).label,
    ]);

    const csv = [headings, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value ?? "").replaceAll(
                '"',
                '""'
              )}"`
          )
          .join(",")
      )
      .join("\n");

    const file = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const fileUrl = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = fileUrl;
    link.download = "bgs-agristock-stock-report.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(fileUrl);
  };

  return (
    <div className="stock-report-page">
      <div
        className={`stock-report-overlay ${
          sidebarOpen ? "show" : ""
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <aside
        className={`stock-report-sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >
        <div className="stock-report-brand">
          <div className="stock-report-logo">
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

        <nav className="stock-report-nav">
          <span className="stock-report-nav-title">
            MAIN MENU
          </span>

          <button
            type="button"
            className="stock-report-nav-item"
            onClick={() => navigateTo("/dashboard")}
          >
            <Icon name="dashboard" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className="stock-report-nav-item"
            onClick={() => navigateTo("/update-stock")}
          >
            <Icon name="stock" />
            <span>Update Stock</span>
          </button>

          <button
            type="button"
            className="stock-report-nav-item active"
            onClick={() => navigateTo("/stock-report")}
          >
            <Icon name="report" />
            <span>Stock Report</span>
          </button>

          <button
            type="button"
            className="stock-report-nav-item"
            onClick={() => navigateTo("/add-product")}
          >
            <Icon name="add" />
            <span>Add Product</span>
          </button>

          <button
            type="button"
            className="stock-report-nav-item"
            onClick={() => navigateTo("/analytics")}
          >
            <Icon name="analytics" />
            <span>Analytics</span>
          </button>
        </nav>

        <div className="stock-report-sidebar-info">
          <div>
            <Icon name="report" />
          </div>

          <span>Products displayed</span>
          <strong>{filteredProducts.length}</strong>

          <small>
            {reportSummary.totalBalance} units available
          </small>
        </div>

        <button
          type="button"
          className="stock-report-logout"
          onClick={handleLogout}
        >
          <Icon name="logout" />
          <span>Sign out</span>
        </button>
      </aside>

      <main className="stock-report-main">
        <header className="stock-report-header">
          <div className="stock-report-heading">
            <button
              type="button"
              className="stock-report-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Icon name="menu" />
            </button>

            <div>
              <span>BGS AGRISTOCK</span>
              <h1>Stock Report</h1>

              <p>
                Review balances, invoice details and expiry
                information.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="stock-report-download"
            onClick={downloadReport}
            disabled={filteredProducts.length === 0}
          >
            <Icon name="download" />
            <span>Download CSV</span>
          </button>
        </header>

        <section className="stock-report-banner">
          <div>
            <span className="stock-report-banner-tag">
              COMPLETE INVENTORY REPORT
            </span>

            <h2>
              Every product.
              <br />
              Every important detail.
            </h2>

            <p>
              Search and filter inventory records to quickly
              identify available, low-stock and expiring
              products.
            </p>
          </div>

          <div className="stock-report-banner-logo">
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

        <section className="stock-report-stats">
          <article>
            <div className="stock-report-stat-icon products">
              <Icon name="package" />
            </div>

            <span>Total Units</span>
            <strong>{reportSummary.totalBalance}</strong>
            <small>Across filtered products</small>
          </article>

          <article>
            <div className="stock-report-stat-icon value">
              <span>LKR</span>
            </div>

            <span>Stock Value</span>

            <strong>
              {formatCurrency(reportSummary.totalValue)}
            </strong>

            <small>Current inventory value</small>
          </article>

          <article>
            <div className="stock-report-stat-icon warning">
              <Icon name="alert" />
            </div>

            <span>Low Stock</span>
            <strong>{reportSummary.lowStock}</strong>
            <small>Products requiring attention</small>
          </article>

          <article>
            <div className="stock-report-stat-icon expiry">
              <Icon name="calendar" />
            </div>

            <span>Expiring Soon</span>
            <strong>{reportSummary.expiringSoon}</strong>
            <small>Within the next 90 days</small>
          </article>
        </section>

        <section className="stock-report-card">
          <div className="stock-report-card-header">
            <div>
              <span>INVENTORY RECORDS</span>
              <h2>Product Stock Details</h2>

              <p>
                Showing {filteredProducts.length} of{" "}
                {stockData.length} records.
              </p>
            </div>

            <div className="stock-report-filter-label">
              <Icon name="filter" />
              <span>Filters</span>
            </div>
          </div>

          <div className="stock-report-filters">
            <div className="stock-report-search">
              <Icon name="search" />

              <input
                type="search"
                value={searchText}
                onChange={(event) =>
                  setSearchText(event.target.value)
                }
                placeholder="Search product, size or invoice..."
              />
            </div>

            <div className="stock-report-select-wrap">
              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
              >
                {categories.map((item) => (
                  <option value={item} key={item}>
                    {item}
                  </option>
                ))}
              </select>

              <Icon name="chevron" size={18} />
            </div>

            <div className="stock-report-select-wrap">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option>All Statuses</option>
                <option>In Stock</option>
                <option>Low Stock</option>
                <option>Out of Stock</option>
              </select>

              <Icon name="chevron" size={18} />
            </div>

            <button
              type="button"
              className="stock-report-clear"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          </div>

          <div className="stock-report-table-wrap">
            <table className="stock-report-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Size</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Invoice</th>
                  <th>Expiry</th>
                  <th>Value</th>
                  <th aria-label="Actions"></th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((item) => {
                  const stockStatus =
                    getStockStatus(item);

                  const expiryStatus =
                    getExpiryStatus(item.expiry);

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="stock-report-product">
                          <div>
                            <Icon name="package" />
                          </div>

                          <span>
                            <strong>{item.name}</strong>

                            <small>
                              {item.categorySinhala}
                            </small>
                          </span>
                        </div>
                      </td>

                      <td>{item.category}</td>

                      <td>
                        <span className="stock-report-size">
                          {item.size}
                        </span>
                      </td>

                      <td>
                        <div className="stock-report-balance">
                          <strong>{item.balance}</strong>
                          <small>Min. {item.minimum}</small>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`stock-report-status ${stockStatus.className}`}
                        >
                          {stockStatus.label}
                        </span>
                      </td>

                      <td>
                        <span className="stock-report-invoice">
                          {item.invoice}
                        </span>
                      </td>

                      <td>
                        <div className="stock-report-expiry">
                          <strong>
                            {formatDate(item.expiry)}
                          </strong>

                          <span
                            className={
                              expiryStatus.className
                            }
                          >
                            {expiryStatus.label}
                          </span>
                        </div>
                      </td>

                      <td>
                        <strong className="stock-report-value">
                          {formatCurrency(item.value)}
                        </strong>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="stock-report-view"
                          onClick={() =>
                            setSelectedProductId(item.id)
                          }
                          aria-label={`View ${item.name} details`}
                        >
                          <Icon name="eye" size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="stock-report-empty">
                <Icon name="search" size={30} />

                <strong>
                  No matching products found
                </strong>

                <span>
                  Try changing or clearing your filters.
                </span>

                <button
                  type="button"
                  onClick={clearFilters}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {selectedProduct && (
        <div
          className="stock-report-modal-backdrop"
          onClick={closeProductModal}
        >
          <article
            className="stock-report-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="stock-report-modal-header">
              <div>
                <span>PRODUCT DETAILS</span>
                <h2>{selectedProduct.name}</h2>

                <p>
                  {selectedProduct.categorySinhala} ·{" "}
                  {selectedProduct.category}
                </p>
              </div>

              <button
                type="button"
                onClick={closeProductModal}
                aria-label="Close details"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="stock-report-modal-product">
              <div>
                <Icon name="package" size={30} />
              </div>

              <span>
                <small>Selected package</small>
                <strong>{selectedProduct.size}</strong>
              </span>

              <span
                className={`stock-report-status ${
                  getStockStatus(selectedProduct)
                    .className
                }`}
              >
                {
                  getStockStatus(selectedProduct)
                    .label
                }
              </span>
            </div>

            <div className="stock-report-modal-grid">
              <div>
                <span>Current Balance</span>
                <strong>
                  {selectedProduct.balance}
                </strong>
                <small>units available</small>
              </div>

              <div>
                <span>Minimum Level</span>
                <strong>
                  {selectedProduct.minimum}
                </strong>
                <small>reorder threshold</small>
              </div>

              <div>
                <span>Received Quantity</span>
                <strong>
                  {selectedProduct.received}
                </strong>
                <small>units received</small>
              </div>

              <div>
                <span>Sold Quantity</span>
                <strong>
                  {selectedProduct.sold}
                </strong>
                <small>units sold</small>
              </div>
            </div>

            <div className="stock-report-modal-details">
              <div>
                <span>Invoice Number</span>
                <strong>
                  {selectedProduct.invoice}
                </strong>
              </div>

              <div>
                <span>Expiry Date</span>

                <strong>
                  {formatDate(selectedProduct.expiry)}
                </strong>
              </div>

              <div>
                <span>Unit Price</span>

                <strong>
                  {formatCurrency(
                    selectedProduct.unitPrice
                  )}
                </strong>
              </div>

              <div>
                <span>Current Stock Value</span>

                <strong>
                  {formatCurrency(
                    selectedProduct.value
                  )}
                </strong>
              </div>
            </div>

            {restockOpen && (
              <form
                className="stock-report-restock-form"
                onSubmit={handleRestockSubmit}
              >
                <div className="stock-report-restock-heading">
                  <div>
                    <span>NEW STOCK DELIVERY</span>
                    <h3>Restock this product</h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setRestockOpen(false);
                      setRestockMessage({
                        type: "",
                        text: "",
                      });
                    }}
                    disabled={restockSubmitting}
                    aria-label="Close restock form"
                  >
                    <Icon name="close" size={18} />
                  </button>
                </div>

                <div className="stock-report-restock-grid">
                  <label>
                    <span>Received Quantity</span>

                    <input
                      type="number"
                      name="restockQuantity"
                      min="1"
                      step="1"
                      value={
                        restockForm.restockQuantity
                      }
                      onChange={
                        handleRestockFieldChange
                      }
                      placeholder="Enter quantity"
                      disabled={restockSubmitting}
                      required
                    />
                  </label>

                  <label>
                    <span>Invoice Number</span>

                    <input
                      type="text"
                      name="invoiceNumber"
                      value={
                        restockForm.invoiceNumber
                      }
                      onChange={
                        handleRestockFieldChange
                      }
                      placeholder="Enter invoice number"
                      disabled={restockSubmitting}
                      required
                    />
                  </label>

                  <label>
                    <span>Expiry Date</span>

                    <input
                      type="date"
                      name="expiryDate"
                      value={
                        restockForm.expiryDate
                      }
                      onChange={
                        handleRestockFieldChange
                      }
                      disabled={restockSubmitting}
                      required
                    />
                  </label>

                  <label>
                    <span>Unit Price (LKR)</span>

                    <input
                      type="number"
                      name="unitPrice"
                      min="0"
                      step="0.01"
                      value={
                        restockForm.unitPrice
                      }
                      onChange={
                        handleRestockFieldChange
                      }
                      placeholder="Enter unit price"
                      disabled={restockSubmitting}
                      required
                    />
                  </label>
                </div>

                {restockMessage.text && (
                  <div
                    className={`stock-report-restock-message ${restockMessage.type}`}
                  >
                    {restockMessage.text}
                  </div>
                )}

                <button
                  type="submit"
                  className="stock-report-restock-submit"
                  disabled={restockSubmitting}
                >
                  <Icon name="add" size={18} />

                  <span>
                    {restockSubmitting
                      ? "Saving restock..."
                      : "Confirm restock"}
                  </span>
                </button>
              </form>
            )}

            <div className="stock-report-modal-actions">
              <button
                type="button"
                className="stock-report-modal-restock"
                onClick={() => {
                  setRestockOpen((current) => !current);
                  setRestockMessage({
                    type: "",
                    text: "",
                  });
                }}
                disabled={restockSubmitting}
              >
                <Icon name="add" size={18} />
                <span>Restock product</span>
              </button>

              <button
                type="button"
                className="stock-report-modal-action"
                onClick={() => {
                  closeProductModal();

                  navigate("/update-stock", {
                    state: {
                      productId:
                        selectedProduct.id,
                    },
                  });
                }}
                disabled={restockSubmitting}
              >
                Update sold stock
              </button>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}

export default StockReport;