import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "../context/InventoryContext";
import "./Analytics.css";
import { logoutUser } from "../utils/auth";

const periods = [
  "Today",
  "This Week",
  "This Month",
  "This Year",
];

const chartColors = [
  "#065F46",
  "#0B8A63",
  "#34D399",
  "#A7F3D0",
  "#6EE7B7",
  "#047857",
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

    movement: (
      <>
        <path d="M4 17 9 12l4 4 7-9" />
        <path d="M15 7h5v5" />
      </>
    ),

    package: (
      <>
        <path d="M4 7 12 3l8 4-8 4z" />
        <path d="M4 7v10l8 4 8-4V7" />
        <path d="M12 11v10" />
      </>
    ),

    cart: (
      <>
        <path d="M3 4h2l2 11h10l3-8H6" />
        <circle cx="9" cy="19" r="1" />
        <circle cx="17" cy="19" r="1" />
      </>
    ),

    alert: (
      <>
        <path d="M12 3 2.8 19h18.4z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    ),

    download: (
      <>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M4 20h16" />
      </>
    ),

    trend: (
      <>
        <path d="m4 16 5-5 4 4 7-8" />
        <path d="M15 7h5v5" />
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

function formatCurrency(value) {
  const amount = Number(value) || 0;

  return `LKR ${amount.toLocaleString("en-LK")}`;
}

function getStartOfWeek(date) {
  const result = new Date(date);
  const day = result.getDay();
  const difference = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + difference);
  result.setHours(0, 0, 0, 0);

  return result;
}

function getPeriodRange(period, previous = false) {
  const now = new Date();

  if (period === "Today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    if (!previous) {
      return {
        start,
        end: now,
      };
    }

    const previousStart = new Date(start);
    previousStart.setDate(previousStart.getDate() - 1);

    return {
      start: previousStart,
      end: start,
    };
  }

  if (period === "This Week") {
    const start = getStartOfWeek(now);

    if (!previous) {
      return {
        start,
        end: now,
      };
    }

    const previousStart = new Date(start);
    previousStart.setDate(previousStart.getDate() - 7);

    return {
      start: previousStart,
      end: start,
    };
  }

  if (period === "This Month") {
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    if (!previous) {
      return {
        start,
        end: now,
      };
    }

    return {
      start: new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      ),
      end: start,
    };
  }

  const start = new Date(now.getFullYear(), 0, 1);

  if (!previous) {
    return {
      start,
      end: now,
    };
  }

  return {
    start: new Date(now.getFullYear() - 1, 0, 1),
    end: start,
  };
}

function isWithinRange(dateValue, range) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date >= range.start && date < range.end;
}

function calculateGrowth(currentValue, previousValue) {
  const current = Number(currentValue) || 0;
  const previous = Number(previousValue) || 0;

  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Math.round(
    ((current - previous) / previous) * 100
  );
}

function formatGrowth(value) {
  const number = Number(value) || 0;

  if (number > 0) {
    return `+${number}%`;
  }

  return `${number}%`;
}

function buildChartData(activities, period) {
  const now = new Date();

  let labels = [];
  let values = [];
  let getBucketIndex;

  if (period === "Today") {
    labels = [
      "12 AM",
      "4 AM",
      "8 AM",
      "12 PM",
      "4 PM",
      "8 PM",
    ];

    values = Array(6).fill(0);

    getBucketIndex = (date) => {
      if (
        date.getFullYear() !== now.getFullYear() ||
        date.getMonth() !== now.getMonth() ||
        date.getDate() !== now.getDate()
      ) {
        return -1;
      }

      return Math.min(
        Math.floor(date.getHours() / 4),
        5
      );
    };
  } else if (period === "This Week") {
    const start = getStartOfWeek(now);

    labels = [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ];

    values = Array(7).fill(0);

    getBucketIndex = (date) => {
      const difference = Math.floor(
        (date.getTime() - start.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      return difference >= 0 && difference < 7
        ? difference
        : -1;
    };
  } else if (period === "This Month") {
    labels = [
      "Week 1",
      "Week 2",
      "Week 3",
      "Week 4",
      "Week 5",
    ];

    values = Array(5).fill(0);

    getBucketIndex = (date) => {
      if (
        date.getFullYear() !== now.getFullYear() ||
        date.getMonth() !== now.getMonth()
      ) {
        return -1;
      }

      return Math.min(
        Math.floor((date.getDate() - 1) / 7),
        4
      );
    };
  } else {
    labels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    values = Array(12).fill(0);

    getBucketIndex = (date) => {
      if (date.getFullYear() !== now.getFullYear()) {
        return -1;
      }

      return date.getMonth();
    };
  }

  activities.forEach((activity) => {
    const activityDate = new Date(activity.createdAt);

    if (Number.isNaN(activityDate.getTime())) {
      return;
    }

    const bucketIndex = getBucketIndex(activityDate);

    if (bucketIndex < 0) {
      return;
    }

    values[bucketIndex] += Math.abs(
      Number(activity.quantity || 0)
    );
  });

  return labels.map((label, index) => ({
    label,
    value: values[index],
  }));
}

function buildSixMonthTrend(
  activities,
  inventoryMap,
  selectedCategory
) {
  const now = new Date();
  const months = [];

  for (let index = 5; index >= 0; index -= 1) {
    const start = new Date(
      now.getFullYear(),
      now.getMonth() - index,
      1
    );

    const end = new Date(
      start.getFullYear(),
      start.getMonth() + 1,
      1
    );

    const monthActivities = activities.filter((activity) => {
      if (!isWithinRange(activity.createdAt, { start, end })) {
        return false;
      }

      const product = inventoryMap.get(
        String(activity.productId)
      );

      if (
        selectedCategory !== "All Categories" &&
        product?.category !== selectedCategory
      ) {
        return false;
      }

      return true;
    });

    const lowStockEvents = monthActivities.filter(
      (activity) => {
        if (activity.type !== "stock-updated") {
          return false;
        }

        const product = inventoryMap.get(
          String(activity.productId)
        );

        if (!product) {
          return false;
        }

        return (
          Number(activity.balance || 0) <=
          Number(product.minimum || 0)
        );
      }
    ).length;

    const productsAdded = monthActivities.filter(
      (activity) => activity.type === "product-added"
    ).length;

    months.push({
      month: start.toLocaleDateString("en-US", {
        month: "long",
      }),
      lowStockEvents,
      productsAdded,
    });
  }

  return months;
}

function Analytics() {
  const navigate = useNavigate();

  const handleLogout = () => {
  logoutUser();
  navigate("/login", { replace: true });
};

  const {
    inventory,
    activities,
  } = useInventory();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState("This Month");

  const [category, setCategory] =
    useState("All Categories");

  const inventoryMap = useMemo(() => {
    return new Map(
      inventory.map((item) => [
        String(item.id),
        item,
      ])
    );
  }, [inventory]);

  const categoryOptions = useMemo(() => {
    return [
      "All Categories",
      ...new Set(
        inventory
          .map((item) => item.category)
          .filter(Boolean)
      ),
    ];
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    if (category === "All Categories") {
      return inventory;
    }

    return inventory.filter(
      (item) => item.category === category
    );
  }, [inventory, category]);

  const currentRange = useMemo(
    () => getPeriodRange(period),
    [period]
  );

  const previousRange = useMemo(
    () => getPeriodRange(period, true),
    [period]
  );

  const activityMatchesCategory = (activity) => {
    if (category === "All Categories") {
      return true;
    }

    const product = inventoryMap.get(
      String(activity.productId)
    );

    return product?.category === category;
  };

  const currentActivities = useMemo(() => {
    return activities.filter(
      (activity) =>
        isWithinRange(activity.createdAt, currentRange) &&
        activityMatchesCategory(activity)
    );
  }, [
    activities,
    currentRange,
    category,
    inventoryMap,
  ]);

  const previousActivities = useMemo(() => {
    return activities.filter(
      (activity) =>
        isWithinRange(activity.createdAt, previousRange) &&
        activityMatchesCategory(activity)
    );
  }, [
    activities,
    previousRange,
    category,
    inventoryMap,
  ]);

  const summary = useMemo(() => {
    const movement = currentActivities.reduce(
      (total, activity) =>
        total +
        Math.abs(Number(activity.quantity || 0)),
      0
    );

    const sold = currentActivities
      .filter(
        (activity) =>
          activity.type === "stock-updated"
      )
      .reduce(
        (total, activity) =>
          total +
          Math.abs(Number(activity.quantity || 0)),
        0
      );

    const stockValue = filteredInventory.reduce(
      (total, item) =>
        total +
        Number(item.balance || 0) *
          Number(item.unitPrice || 0),
      0
    );

    const lowStock = filteredInventory.filter(
      (item) =>
        Number(item.balance || 0) <=
        Number(item.minimum || 0)
    ).length;

    return {
      movement,
      sold,
      stockValue,
      lowStock,
    };
  }, [currentActivities, filteredInventory]);

  const previousMovement = useMemo(() => {
    return previousActivities.reduce(
      (total, activity) =>
        total +
        Math.abs(Number(activity.quantity || 0)),
      0
    );
  }, [previousActivities]);

  const movementGrowth = useMemo(() => {
    return calculateGrowth(
      summary.movement,
      previousMovement
    );
  }, [summary.movement, previousMovement]);

  const chartData = useMemo(() => {
    return buildChartData(currentActivities, period);
  }, [currentActivities, period]);

  const chartPoints = useMemo(() => {
    const maximumValue = Math.max(
      ...chartData.map((item) => item.value),
      1
    );

    return chartData.map((item, index) => {
      const x =
        chartData.length === 1
          ? 350
          : (index / (chartData.length - 1)) * 700;

      const y =
        190 - (item.value / maximumValue) * 150;

      return {
        ...item,
        x,
        y,
      };
    });
  }, [chartData]);

  const chartLine = useMemo(() => {
    return chartPoints
      .map((point, index) =>
        index === 0
          ? `M ${point.x} ${point.y}`
          : `L ${point.x} ${point.y}`
      )
      .join(" ");
  }, [chartPoints]);

  const chartArea =
    `${chartLine} L 700 210 L 0 210 Z`;

  const categoryData = useMemo(() => {
    const groupedCategories = new Map();

    filteredInventory.forEach((item) => {
      const current =
        groupedCategories.get(item.category) || {
          name: item.category,
          sinhala:
            item.categorySinhala || item.category,
          products: 0,
          units: 0,
          value: 0,
        };

      current.products += 1;

      current.units += Number(
        item.balance || 0
      );

      current.value +=
        Number(item.balance || 0) *
        Number(item.unitPrice || 0);

      groupedCategories.set(
        item.category,
        current
      );
    });

    const rawCategories = Array.from(
      groupedCategories.values()
    );

    const totalValue = rawCategories.reduce(
      (total, item) => total + item.value,
      0
    );

    const totalUnits = rawCategories.reduce(
      (total, item) => total + item.units,
      0
    );

    const totalProducts = rawCategories.reduce(
      (total, item) => total + item.products,
      0
    );

    const currentSalesByCategory = new Map();
    const previousSalesByCategory = new Map();

    currentActivities
      .filter(
        (activity) =>
          activity.type === "stock-updated"
      )
      .forEach((activity) => {
        const product = inventoryMap.get(
          String(activity.productId)
        );

        if (!product) {
          return;
        }

        currentSalesByCategory.set(
          product.category,
          (currentSalesByCategory.get(
            product.category
          ) || 0) +
            Number(activity.quantity || 0)
        );
      });

    previousActivities
      .filter(
        (activity) =>
          activity.type === "stock-updated"
      )
      .forEach((activity) => {
        const product = inventoryMap.get(
          String(activity.productId)
        );

        if (!product) {
          return;
        }

        previousSalesByCategory.set(
          product.category,
          (previousSalesByCategory.get(
            product.category
          ) || 0) +
            Number(activity.quantity || 0)
        );
      });

    return rawCategories
      .map((item, index) => {
        let weight = 0;
        let totalWeight = 0;

        if (totalValue > 0) {
          weight = item.value;
          totalWeight = totalValue;
        } else if (totalUnits > 0) {
          weight = item.units;
          totalWeight = totalUnits;
        } else {
          weight = item.products;
          totalWeight = totalProducts;
        }

        const share =
          totalWeight > 0
            ? (weight / totalWeight) * 100
            : rawCategories.length > 0
              ? 100 / rawCategories.length
              : 0;

        const currentSold =
          currentSalesByCategory.get(item.name) || 0;

        const previousSold =
          previousSalesByCategory.get(item.name) || 0;

        return {
          ...item,
          share,
          percentage: Math.round(share),
          growth: calculateGrowth(
            currentSold,
            previousSold
          ),
          color:
            chartColors[index % chartColors.length],
        };
      })
      .sort((first, second) => {
        if (totalValue > 0) {
          return second.value - first.value;
        }

        return second.units - first.units;
      });
  }, [
    filteredInventory,
    currentActivities,
    previousActivities,
    inventoryMap,
  ]);

  const donutBackground = useMemo(() => {
    if (categoryData.length === 0) {
      return "#E7EFEB";
    }

    let start = 0;

    const sections = categoryData.map(
      (item, index) => {
        const end =
          index === categoryData.length - 1
            ? 100
            : start + item.share;

        const section =
          `${item.color} ${start}% ${end}%`;

        start = end;

        return section;
      }
    );

    return `conic-gradient(${sections.join(", ")})`;
  }, [categoryData]);

  const filteredPerformance = useMemo(() => {
    const currentPerformance = new Map();
    const previousPerformance = new Map();

    currentActivities
      .filter(
        (activity) =>
          activity.type === "stock-updated"
      )
      .forEach((activity) => {
        const product = inventoryMap.get(
          String(activity.productId)
        );

        if (!product) {
          return;
        }

        const key =
          `${product.category}::${product.name}`;

        const current =
          currentPerformance.get(key) || {
            name: product.name,
            category: product.category,
            sold: 0,
            revenue: 0,
          };

        const quantity = Number(
          activity.quantity || 0
        );

        current.sold += quantity;

        current.revenue +=
          quantity * Number(product.unitPrice || 0);

        currentPerformance.set(key, current);
      });

    previousActivities
      .filter(
        (activity) =>
          activity.type === "stock-updated"
      )
      .forEach((activity) => {
        const product = inventoryMap.get(
          String(activity.productId)
        );

        if (!product) {
          return;
        }

        const key =
          `${product.category}::${product.name}`;

        previousPerformance.set(
          key,
          (previousPerformance.get(key) || 0) +
            Number(activity.quantity || 0)
        );
      });

    return Array.from(
      currentPerformance.entries()
    )
      .map(([key, item]) => ({
        ...item,
        growth: calculateGrowth(
          item.sold,
          previousPerformance.get(key) || 0
        ),
      }))
      .sort(
        (first, second) =>
          second.sold - first.sold
      )
      .slice(0, 5);
  }, [
    currentActivities,
    previousActivities,
    inventoryMap,
  ]);

  const lowStockTrend = useMemo(() => {
    return buildSixMonthTrend(
      activities,
      inventoryMap,
      category
    );
  }, [activities, inventoryMap, category]);

  const maximumTrendValue = useMemo(() => {
    return Math.max(
      ...lowStockTrend.flatMap((item) => [
        item.lowStockEvents,
        item.productsAdded,
      ]),
      1
    );
  }, [lowStockTrend]);

  const stockHealthLabel =
    summary.lowStock === 0
      ? "Healthy"
      : summary.lowStock <= 2
        ? "Stable"
        : "Needs Attention";

  const navigateTo = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const downloadAnalytics = () => {
    const rows = [
      ["BGS AgriStock Analytics Report"],
      ["Period", period],
      ["Category", category],
      [],
      ["Metric", "Value"],
      ["Inventory Movement", summary.movement],
      ["Stock Value", summary.stockValue],
      ["Units Sold", summary.sold],
      ["Low Stock Items", summary.lowStock],
      ["Movement Growth", formatGrowth(movementGrowth)],
      [],
      [
        "Product",
        "Category",
        "Units Sold",
        "Revenue",
        "Growth",
      ],
      ...filteredPerformance.map((item) => [
        item.name,
        item.category,
        item.sold,
        item.revenue,
        formatGrowth(item.growth),
      ]),
      [],
      [
        "Category",
        "Products",
        "Units",
        "Stock Value",
        "Share",
        "Sales Growth",
      ],
      ...categoryData.map((item) => [
        item.name,
        item.products,
        item.units,
        item.value,
        `${item.percentage}%`,
        formatGrowth(item.growth),
      ]),
    ];

    const csv = rows
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
    link.download =
      "bgs-agristock-analytics.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(fileUrl);
  };

  return (
    <div className="analytics-page">
      <div
        className={`analytics-overlay ${
          sidebarOpen ? "show" : ""
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <aside
        className={`analytics-sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >
        <div className="analytics-brand">
          <div className="analytics-logo">
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

        <nav className="analytics-nav">
          <span className="analytics-nav-title">
            MAIN MENU
          </span>

          <button
            type="button"
            className="analytics-nav-item"
            onClick={() => navigateTo("/dashboard")}
          >
            <Icon name="dashboard" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className="analytics-nav-item"
            onClick={() => navigateTo("/update-stock")}
          >
            <Icon name="stock" />
            <span>Update Stock</span>
          </button>

          <button
            type="button"
            className="analytics-nav-item"
            onClick={() => navigateTo("/stock-report")}
          >
            <Icon name="report" />
            <span>Stock Report</span>
          </button>

          <button
            type="button"
            className="analytics-nav-item"
            onClick={() => navigateTo("/add-product")}
          >
            <Icon name="add" />
            <span>Add Product</span>
          </button>

          <button
            type="button"
            className="analytics-nav-item active"
            onClick={() => navigateTo("/analytics")}
          >
            <Icon name="analytics" />
            <span>Analytics</span>
          </button>
        </nav>

        <div className="analytics-sidebar-info">
          <div>
            <Icon name="trend" />
          </div>

          <span>Selected period</span>
          <strong>{period}</strong>
          <small>{category}</small>
        </div>

        <button
          type="button"
          className="analytics-logout"
          onClick={handleLogout}
        >
          <Icon name="logout" />
          <span>Sign out</span>
        </button>
      </aside>

      <main className="analytics-main">
        <header className="analytics-header">
          <div className="analytics-heading">
            <button
              type="button"
              className="analytics-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Icon name="menu" />
            </button>

            <div>
              <span>BGS AGRISTOCK</span>
              <h1>Inventory Analytics</h1>

              <p>
                Review stock movement, value and product
                performance.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="analytics-download"
            onClick={downloadAnalytics}
          >
            <Icon name="download" />
            <span>Download Analytics</span>
          </button>
        </header>

        <section className="analytics-banner">
          <div>
            <span className="analytics-banner-tag">
              INVENTORY INTELLIGENCE
            </span>

            <h2>
              Understand performance.
              <br />
              Improve every decision.
            </h2>

            <p>
              Analyse real stock movement, category
              distribution, sales activity and low-stock
              performance from one intelligent workspace.
            </p>
          </div>

          <div className="analytics-banner-logo">
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

        <section className="analytics-toolbar">
          <div>
            <span>ANALYTICS FILTERS</span>
            <h2>Performance Overview</h2>

            <p>
              Change the period or category to update the
              report.
            </p>
          </div>

          <div className="analytics-filters">
            <div className="analytics-select-wrap">
              <select
                value={period}
                onChange={(event) =>
                  setPeriod(event.target.value)
                }
              >
                {periods.map((item) => (
                  <option value={item} key={item}>
                    {item}
                  </option>
                ))}
              </select>

              <Icon name="chevron" size={18} />
            </div>

            <div className="analytics-select-wrap">
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
              >
                {categoryOptions.map((item) => (
                  <option value={item} key={item}>
                    {item}
                  </option>
                ))}
              </select>

              <Icon name="chevron" size={18} />
            </div>
          </div>
        </section>

        <section className="analytics-stats">
          <article>
            <div className="analytics-stat-icon movement">
              <Icon name="movement" />
            </div>

            <span>Inventory Movement</span>

            <strong>
              {summary.movement.toLocaleString("en-LK")}
            </strong>

            <small>
              Units moved during {period.toLowerCase()}
            </small>
          </article>

          <article>
            <div className="analytics-stat-icon value">
              <span>LKR</span>
            </div>

            <span>Inventory Value</span>

            <strong>
              {formatCurrency(summary.stockValue)}
            </strong>

            <small>Current estimated stock value</small>
          </article>

          <article>
            <div className="analytics-stat-icon sold">
              <Icon name="cart" />
            </div>

            <span>Units Sold</span>

            <strong>
              {summary.sold.toLocaleString("en-LK")}
            </strong>

            <small>
              Sold during {period.toLowerCase()}
            </small>
          </article>

          <article>
            <div className="analytics-stat-icon low">
              <Icon name="alert" />
            </div>

            <span>Low Stock Items</span>
            <strong>{summary.lowStock}</strong>

            <small>Products requiring attention</small>
          </article>
        </section>

        <section className="analytics-main-grid">
          <article className="analytics-panel analytics-chart-panel">
            <div className="analytics-panel-header">
              <div>
                <span>STOCK MOVEMENT</span>
                <h2>Inventory Activity</h2>

                <p>
                  Movement trend for {period.toLowerCase()}.
                </p>
              </div>

              <div className="analytics-growth-badge">
                <Icon name="trend" size={16} />

                <span>
                  {formatGrowth(movementGrowth)}
                </span>
              </div>
            </div>

            <div className="analytics-chart-summary">
              <div>
                <span>Total movement</span>

                <strong>
                  {summary.movement.toLocaleString("en-LK")}{" "}
                  units
                </strong>
              </div>

              <small>
                Compared with the previous period
              </small>
            </div>

            <div className="analytics-line-chart">
              <div className="analytics-grid-line line-one"></div>
              <div className="analytics-grid-line line-two"></div>
              <div className="analytics-grid-line line-three"></div>

              <svg
                viewBox="0 0 700 220"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="analyticsArea"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#34D399"
                      stopOpacity=".32"
                    />

                    <stop
                      offset="100%"
                      stopColor="#34D399"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                <path
                  d={chartArea}
                  fill="url(#analyticsArea)"
                />

                <path
                  d={chartLine}
                  fill="none"
                  stroke="#0B8A63"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {chartPoints.map((point) => (
                  <circle
                    key={point.label}
                    cx={point.x}
                    cy={point.y}
                    r="6"
                    fill="#ffffff"
                    stroke="#0B8A63"
                    strokeWidth="4"
                  />
                ))}
              </svg>

              <div className="analytics-chart-labels">
                {chartData.map((item) => (
                  <span key={item.label}>
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </article>

          <article className="analytics-panel analytics-distribution-panel">
            <div className="analytics-panel-header">
              <div>
                <span>CATEGORY DISTRIBUTION</span>
                <h2>Stock Value Share</h2>

                <p>
                  Contribution from each category.
                </p>
              </div>
            </div>

            <div className="analytics-donut-area">
              <div
                className="analytics-donut"
                style={{
                  background: donutBackground,
                }}
              >
                <div>
                  <strong>
                    {filteredInventory.length}
                  </strong>

                  <span>Products</span>
                </div>
              </div>
            </div>

            <div className="analytics-category-legend">
              {categoryData.length === 0 ? (
                <div className="analytics-empty">
                  <Icon name="package" size={28} />
                  <strong>No inventory data</strong>

                  <span>
                    Add products to view distribution.
                  </span>
                </div>
              ) : (
                categoryData.map((item) => (
                  <div key={item.name}>
                    <span
                      className="analytics-legend-dot"
                      style={{
                        background: item.color,
                      }}
                    ></span>

                    <div>
                      <strong>{item.name}</strong>

                      <small>
                        {item.products} products
                      </small>
                    </div>

                    <span>
                      {item.percentage}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        <section className="analytics-secondary-grid">
          <article className="analytics-panel">
            <div className="analytics-panel-header">
              <div>
                <span>TOP PERFORMANCE</span>
                <h2>Best-Selling Products</h2>

                <p>
                  Products with the highest real movement and
                  revenue.
                </p>
              </div>
            </div>

            <div className="analytics-product-list">
              {filteredPerformance.length === 0 ? (
                <div className="analytics-empty">
                  <Icon name="analytics" size={28} />

                  <strong>
                    No sales recorded
                  </strong>

                  <span>
                    Stock updates for this period will appear
                    here.
                  </span>
                </div>
              ) : (
                filteredPerformance.map(
                  (item, index) => (
                    <div
                      className="analytics-product-row"
                      key={`${item.category}-${item.name}`}
                    >
                      <div className="analytics-product-rank">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <div className="analytics-product-name">
                        <strong>{item.name}</strong>
                        <span>{item.category}</span>
                      </div>

                      <div>
                        <strong>{item.sold}</strong>
                        <span>Units sold</span>
                      </div>

                      <div>
                        <strong>
                          {formatCurrency(item.revenue)}
                        </strong>

                        <span>Revenue</span>
                      </div>

                      <span className="analytics-product-growth">
                        {formatGrowth(item.growth)}
                      </span>
                    </div>
                  )
                )
              )}
            </div>
          </article>

          <article className="analytics-panel">
            <div className="analytics-panel-header">
              <div>
                <span>CATEGORY PERFORMANCE</span>
                <h2>Inventory by Category</h2>

                <p>
                  Compare real category values and sales
                  growth.
                </p>
              </div>
            </div>

            <div className="analytics-category-bars">
              {categoryData.length === 0 ? (
                <div className="analytics-empty">
                  <Icon name="package" size={28} />
                  <strong>No category data</strong>

                  <span>
                    Add products to view performance.
                  </span>
                </div>
              ) : (
                categoryData.map((item) => (
                  <div
                    className="analytics-category-bar"
                    key={item.name}
                  >
                    <div>
                      <span>
                        <strong>{item.name}</strong>
                        <small>{item.sinhala}</small>
                      </span>

                      <span>
                        <strong>
                          {formatCurrency(item.value)}
                        </strong>

                        <small>
                          {formatGrowth(item.growth)}
                        </small>
                      </span>
                    </div>

                    <div className="analytics-bar-track">
                      <span
                        style={{
                          width: `${item.percentage}%`,
                        }}
                      ></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        <section className="analytics-panel analytics-low-stock-panel">
          <div className="analytics-panel-header">
            <div>
              <span>STOCK HEALTH</span>
              <h2>Stock Activity Trend</h2>

              <p>
                Compare low-stock events and newly added
                inventory products.
              </p>
            </div>

            <div className="analytics-health-badge">
              {stockHealthLabel}
            </div>
          </div>

          <div className="analytics-low-stock-chart">
            {lowStockTrend.map((item) => {
              const lowStockHeight =
                item.lowStockEvents > 0
                  ? Math.max(
                      (item.lowStockEvents /
                        maximumTrendValue) *
                        150,
                      8
                    )
                  : 0;

              const addedHeight =
                item.productsAdded > 0
                  ? Math.max(
                      (item.productsAdded /
                        maximumTrendValue) *
                        150,
                      8
                    )
                  : 0;

              return (
                <div
                  className="analytics-low-stock-column"
                  key={item.month}
                >
                  <div className="analytics-low-stock-bars">
                    <span
                      className="alert-bar"
                      style={{
                        height: `${lowStockHeight}px`,
                      }}
                      title={`${item.lowStockEvents} low-stock events`}
                    ></span>

                    <span
                      className="restock-bar"
                      style={{
                        height: `${addedHeight}px`,
                      }}
                      title={`${item.productsAdded} products added`}
                    ></span>
                  </div>

                  <strong>
                    {item.month.slice(0, 3)}
                  </strong>
                </div>
              );
            })}
          </div>

          <div className="analytics-low-stock-legend">
            <span>
              <i className="alert-key"></i>
              Low-stock events
            </span>

            <span>
              <i className="restock-key"></i>
              Products added
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Analytics;