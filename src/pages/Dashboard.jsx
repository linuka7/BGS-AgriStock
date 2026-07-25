import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "../context/InventoryContext";
import "./Dashboard.css";
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

    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),

    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),

    chevron: <path d="m7 10 5 5 5-5" />,

    logout: (
      <>
        <path d="M10 5H5v14h5" />
        <path d="M14 8l4 4-4 4" />
        <path d="M18 12H9" />
      </>
    ),

    alert: (
      <>
        <path d="M12 3 2.8 19h18.4z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    ),

    product: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <path d="M8 9h8M8 13h5M8 17h3" />
      </>
    ),

    growth: (
      <>
        <path d="m4 16 5-5 4 4 7-8" />
        <path d="M15 7h5v5" />
      </>
    ),

    menu: <path d="M4 7h16M4 12h16M4 17h16" />,

    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
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

function formatCompactCurrency(value) {
  const amount = Number(value) || 0;

  if (amount >= 1000000) {
    return `LKR ${(amount / 1000000).toFixed(1)}M`;
  }

  if (amount >= 1000) {
    return `LKR ${(amount / 1000).toFixed(1)}K`;
  }

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

function getActivityQuantity(activity) {
  return Math.abs(Number(activity.quantity || 0));
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

    const previousStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    return {
      start: previousStart,
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

function getMovementInRange(activities, range) {
  return activities.reduce((total, activity) => {
    const activityDate = new Date(activity.createdAt);

    if (
      Number.isNaN(activityDate.getTime()) ||
      activityDate < range.start ||
      activityDate >= range.end
    ) {
      return total;
    }

    return total + getActivityQuantity(activity);
  }, 0);
}

function buildChartData(activities, period) {
  const now = new Date();
  let labels = [];
  let values = [];
  let getBucketIndex;

  if (period === "Today") {
    labels = ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM"];
    values = Array(6).fill(0);

    getBucketIndex = (date) => {
      if (
        date.getFullYear() !== now.getFullYear() ||
        date.getMonth() !== now.getMonth() ||
        date.getDate() !== now.getDate()
      ) {
        return -1;
      }

      return Math.min(Math.floor(date.getHours() / 4), 5);
    };
  } else if (period === "This Week") {
    const start = getStartOfWeek(now);

    labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
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
    labels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];
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

    const index = getBucketIndex(activityDate);

    if (index >= 0) {
      values[index] += getActivityQuantity(activity);
    }
  });

  return labels.map((label, index) => ({
    label,
    value: values[index],
  }));
}

function formatRelativeTime(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const difference = Date.now() - date.getTime();
  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function getStoredUser() {
  const storedUser =
    localStorage.getItem("bgs_user") ||
    sessionStorage.getItem("bgs_user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Unable to read stored user:", error);
    return null;
  }
}

function formatRole(role) {
  const value = String(role || "Administrator")
    .trim()
    .replace(/[-_]+/g, " ");

  return value.replace(/\b\w/g, (letter) =>
    letter.toUpperCase()
  );
}

function getInitials(name) {
  const words = String(name || "BGS Administrator")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "BG";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function Dashboard() {
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const { inventory, activities, summary } = useInventory();

  const [period, setPeriod] = useState("Today");
  const [periodOpen, setPeriodOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const storedUser = useMemo(() => getStoredUser(), []);
  const userName = storedUser?.name || "Linuka Bandara";
  const userRole = formatRole(
    storedUser?.role || "Administrator"
  );
  const userInitials = getInitials(userName);

  useEffect(() => {
    const closeProfileMenu = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    const closeWithEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", closeProfileMenu);
    document.addEventListener("keydown", closeWithEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        closeProfileMenu
      );
      document.removeEventListener(
        "keydown",
        closeWithEscape
      );
    };
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    logoutUser();
    navigate("/login", { replace: true });
  };

  const handleWebsiteHome = () => {
    setProfileOpen(false);
    navigate("/");
  };

  const periods = [
    "Today",
    "This Week",
    "This Month",
    "This Year",
  ];

  const inventoryHealth = useMemo(() => {
    if (inventory.length === 0) {
      return {
        percentage: 0,
        label: "No Data",
      };
    }

    const wellStocked = inventory.filter(
      (item) =>
        Number(item.balance || 0) >
        Number(item.minimum || 0)
    ).length;

    const percentage = Math.round(
      (wellStocked / inventory.length) * 100
    );

    let label = "Needs Attention";

    if (percentage >= 90) {
      label = "Excellent";
    } else if (percentage >= 75) {
      label = "Good";
    } else if (percentage >= 50) {
      label = "Fair";
    }

    return {
      percentage,
      label,
    };
  }, [inventory]);

  const lowStockProducts = useMemo(() => {
    return inventory
      .filter(
        (item) =>
          Number(item.balance || 0) <=
          Number(item.minimum || 0)
      )
      .sort(
        (first, second) =>
          Number(first.balance || 0) -
          Number(second.balance || 0)
      )
      .slice(0, 3);
  }, [inventory]);

  const recentActivities = useMemo(() => {
    return activities.slice(0, 3);
  }, [activities]);

  const chartData = useMemo(() => {
    return buildChartData(activities, period);
  }, [activities, period]);

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

      const y = 175 - (item.value / maximumValue) * 135;

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

  const chartArea = `${chartLine} L 700 210 L 0 210 Z`;

  const currentMovement = useMemo(() => {
    return getMovementInRange(
      activities,
      getPeriodRange(period)
    );
  }, [activities, period]);

  const previousMovement = useMemo(() => {
    return getMovementInRange(
      activities,
      getPeriodRange(period, true)
    );
  }, [activities, period]);

  const movementGrowth = useMemo(() => {
    if (previousMovement === 0) {
      return currentMovement > 0 ? 100 : 0;
    }

    return Math.round(
      ((currentMovement - previousMovement) /
        previousMovement) *
        100
    );
  }, [currentMovement, previousMovement]);

  const movementGrowthText =
    movementGrowth > 0
      ? `+${movementGrowth}%`
      : `${movementGrowth}%`;

  const goTo = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const selectPeriod = (item) => {
    setPeriod(item);
    setPeriodOpen(false);
  };

  


  return (
    <div className="dashboard-page">
      <div
        className={`dashboard-overlay ${
          sidebarOpen ? "show" : ""
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <aside
        className={`dashboard-sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >
        <div className="dashboard-brand">
          <div className="dashboard-logo">
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

        <nav className="dashboard-nav">
          <span className="dashboard-nav-title">
            MAIN MENU
          </span>

          <button
            className="dashboard-nav-item active"
            type="button"
            onClick={() => goTo("/dashboard")}
          >
            <Icon name="dashboard" />
            <span>Dashboard</span>
          </button>

          <button
            className="dashboard-nav-item"
            type="button"
            onClick={() => goTo("/update-stock")}
          >
            <Icon name="stock" />
            <span>Update Stock</span>
          </button>

          <button
            className="dashboard-nav-item"
            type="button"
            onClick={() => goTo("/stock-report")}
          >
            <Icon name="report" />
            <span>Stock Report</span>
          </button>

          <button
            className="dashboard-nav-item"
            type="button"
            onClick={() => goTo("/add-product")}
          >
            <Icon name="add" />
            <span>Add Product</span>
          </button>

          <button
            className="dashboard-nav-item"
            type="button"
            onClick={() => goTo("/analytics")}
          >
            <Icon name="analytics" />
            <span>Analytics</span>
          </button>
        </nav>

        <div className="dashboard-sidebar-card">
          <div className="sidebar-card-icon">
            <Icon name="growth" />
          </div>

          <span>Inventory health</span>
          <strong>{inventoryHealth.label}</strong>

          <div className="sidebar-progress">
            <span
              style={{
                width: `${inventoryHealth.percentage}%`,
              }}
            ></span>
          </div>

          <small>
            {inventoryHealth.percentage}% of products are well
            stocked.
          </small>
        </div>

        <div className="dashboard-sidebar-actions">
          <button
            className="dashboard-home-link"
            type="button"
            onClick={() => goTo("/")}
          >
            <Icon name="home" />
            <span>Website Home</span>
          </button>

          <button
            className="dashboard-logout"
            type="button"
            onClick={handleLogout}
          >
            <Icon name="logout" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <button
              type="button"
              className="dashboard-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Icon name="menu" />
            </button>

            <div>
              <span className="dashboard-eyebrow">
                BGS AGRISTOCK
              </span>

              <h1>Inventory Dashboard</h1>

              <p>
                Welcome back. Here is your latest inventory
                overview.
              </p>
            </div>
          </div>

          <div className="dashboard-header-actions">
            <button
              type="button"
              className="dashboard-icon-button"
              aria-label="View low-stock notifications"
              onClick={() => goTo("/stock-report")}
            >
              <Icon name="bell" />

              {summary.lowStockItems > 0 && (
                <span className="notification-dot"></span>
              )}
            </button>

            <div
              className="dashboard-profile-wrap"
              ref={profileRef}
            >
              <button
                type="button"
                className={`dashboard-profile ${
                  profileOpen ? "is-open" : ""
                }`}
                onClick={() =>
                  setProfileOpen((current) => !current)
                }
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <div className="dashboard-avatar">
                  {userInitials}
                </div>

                <div className="dashboard-profile-copy">
                  <strong>{userName}</strong>
                  <span>{userRole}</span>
                </div>

                <span
                  className={`dashboard-profile-chevron ${
                    profileOpen ? "rotate" : ""
                  }`}
                >
                  <Icon name="chevron" size={17} />
                </span>
              </button>

              {profileOpen && (
                <div
                  className="dashboard-profile-menu"
                  role="menu"
                >
                  <div className="dashboard-profile-menu-header">
                    <div className="dashboard-profile-menu-avatar">
                      {userInitials}
                    </div>

                    <div>
                      <strong>{userName}</strong>
                      <span>{userRole}</span>
                    </div>
                  </div>

                  <div className="dashboard-profile-menu-divider"></div>

                  <button
                    type="button"
                    className="dashboard-profile-menu-item"
                    onClick={handleWebsiteHome}
                    role="menuitem"
                  >
                    <Icon name="home" size={18} />

                    <span>
                      <strong>Website Home</strong>
                      <small>Return to the landing page</small>
                    </span>
                  </button>

                  <button
                    type="button"
                    className="dashboard-profile-menu-item danger"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <Icon name="logout" size={18} />

                    <span>
                      <strong>Sign out</strong>
                      <small>End your current session</small>
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="dashboard-welcome">
          <div className="dashboard-welcome-copy">
            <span className="dashboard-welcome-tag">
              SMART INVENTORY MANAGEMENT
            </span>

            <h2>
              Monitor every product.
              <br />
              Make better decisions.
            </h2>

            <p>
              Track stock levels, identify low inventory and
              manage your agricultural products from one modern
              workspace.
            </p>

            <button
              className="dashboard-primary-button"
              type="button"
              onClick={() => goTo("/update-stock")}
            >
              <span>Update today&apos;s stock</span>
              <Icon name="arrow" />
            </button>
          </div>

          <div className="dashboard-welcome-visual">
            <div className="welcome-logo-showcase">
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
          </div>
        </section>

        <section className="dashboard-toolbar">
          <div>
            <h2>Overview</h2>
            <p>
              Inventory performance for the selected period.
            </p>
          </div>

          <div className="dashboard-period">
            <button
              type="button"
              className={`dashboard-period-trigger ${
                periodOpen ? "is-open" : ""
              }`}
              onClick={() =>
                setPeriodOpen((current) => !current)
              }
            >
              <span>{period}</span>

              <span
                className={`dashboard-period-chevron ${
                  periodOpen ? "rotate" : ""
                }`}
              >
                <Icon name="chevron" size={18} />
              </span>
            </button>

            {periodOpen && (
              <div className="dashboard-period-menu">
                {periods.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={
                      item === period
                        ? "dashboard-period-option selected"
                        : "dashboard-period-option"
                    }
                    onClick={() => selectPeriod(item)}
                  >
                    <span>{item}</span>

                    {item === period && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-stats">
          <article className="dashboard-stat-card">
            <div className="stat-card-top">
              <div className="stat-icon product-icon">
                <Icon name="product" />
              </div>

              <span className="stat-change positive">
                Live
              </span>
            </div>

            <span className="stat-label">Total Products</span>
            <strong>{summary.totalProducts}</strong>
            <small>Across all categories and sizes</small>
          </article>

          <article className="dashboard-stat-card">
            <div className="stat-card-top">
              <div className="stat-icon value-icon">
                <span className="lkr-symbol">LKR</span>
              </div>

              <span className="stat-change positive">
                Current
              </span>
            </div>

            <span className="stat-label">Stock Value</span>

            <strong>
              {formatCompactCurrency(summary.stockValue)}
            </strong>

            <small>Current inventory value</small>
          </article>

          <article className="dashboard-stat-card">
            <div className="stat-card-top">
              <div className="stat-icon alert-icon">
                <Icon name="alert" />
              </div>

              <span className="stat-change warning">
                {summary.lowStockItems > 0
                  ? "Needs attention"
                  : "Healthy"}
              </span>
            </div>

            <span className="stat-label">Low Stock Items</span>
            <strong>{summary.lowStockItems}</strong>
            <small>Products below minimum level</small>
          </article>

          <article className="dashboard-stat-card">
            <div className="stat-card-top">
              <div className="stat-icon growth-icon">
                <Icon name="growth" />
              </div>

              <span
                className={`stat-change ${
                  movementGrowth >= 0
                    ? "positive"
                    : "warning"
                }`}
              >
                {movementGrowthText}
              </span>
            </div>

            <span className="stat-label">
              Movement Growth
            </span>

            <strong>{movementGrowthText}</strong>

            <small>
              Compared with the previous {period.toLowerCase()}
            </small>
          </article>
        </section>

        <section className="dashboard-content-grid">
          <article className="dashboard-panel dashboard-chart-panel">
            <div className="dashboard-panel-header">
              <div>
                <span className="dashboard-panel-tag">
                  PERFORMANCE
                </span>

                <h3>Inventory Analytics</h3>

                <p>
                  Stock movement for {period.toLowerCase()}.
                </p>
              </div>

              <button
                type="button"
                className="dashboard-text-button"
                onClick={() => goTo("/analytics")}
              >
                View report
                <Icon name="arrow" size={17} />
              </button>
            </div>

            <div className="dashboard-chart-summary">
              <div>
                <span>Total movement</span>

                <strong>
                  {currentMovement.toLocaleString("en-LK")} units
                </strong>
              </div>

              <span className="chart-growth">
                {movementGrowthText}
              </span>
            </div>

            <div className="dashboard-chart-area">
              <div className="chart-grid-line line-one"></div>
              <div className="chart-grid-line line-two"></div>
              <div className="chart-grid-line line-three"></div>

              <svg
                viewBox="0 0 700 210"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="dashboardArea"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#34D399"
                      stopOpacity=".3"
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
                  fill="url(#dashboardArea)"
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
                    r="5"
                    fill="#ffffff"
                    stroke="#0B8A63"
                    strokeWidth="4"
                  />
                ))}
              </svg>

              <div className="dashboard-chart-labels">
                {chartData.map((item) => (
                  <span key={item.label}>{item.label}</span>
                ))}
              </div>
            </div>
          </article>

          <article className="dashboard-panel dashboard-actions-panel">
            <div className="dashboard-panel-header">
              <div>
                <span className="dashboard-panel-tag">
                  SHORTCUTS
                </span>

                <h3>Quick Actions</h3>
                <p>Manage your inventory faster.</p>
              </div>
            </div>

            <div className="dashboard-quick-actions">
              <button
                type="button"
                className="quick-action-card"
                onClick={() => goTo("/update-stock")}
              >
                <div className="quick-action-icon">
                  <Icon name="stock" />
                </div>

                <div>
                  <strong>Update Stock</strong>
                  <span>Record sold quantities</span>
                </div>

                <Icon name="arrow" size={18} />
              </button>

              <button
                type="button"
                className="quick-action-card"
                onClick={() => goTo("/stock-report")}
              >
                <div className="quick-action-icon">
                  <Icon name="report" />
                </div>

                <div>
                  <strong>Stock Report</strong>
                  <span>View complete inventory</span>
                </div>

                <Icon name="arrow" size={18} />
              </button>

              <button
                type="button"
                className="quick-action-card"
                onClick={() => goTo("/add-product")}
              >
                <div className="quick-action-icon">
                  <Icon name="add" />
                </div>

                <div>
                  <strong>Add Product</strong>
                  <span>Create a new product</span>
                </div>

                <Icon name="arrow" size={18} />
              </button>
            </div>
          </article>
        </section>

        <section className="dashboard-bottom-grid">
          <article className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <span className="dashboard-panel-tag">
                  ATTENTION REQUIRED
                </span>

                <h3>Low Stock Products</h3>
              </div>

              <button
                type="button"
                className="dashboard-text-button"
                onClick={() => goTo("/stock-report")}
              >
                View all
                <Icon name="arrow" size={17} />
              </button>
            </div>

            <div className="dashboard-stock-list">
              {lowStockProducts.length === 0 ? (
                <div className="stock-list-item">
                  <div>
                    <strong>Inventory is healthy</strong>
                    <span>
                      No products are below the minimum level.
                    </span>
                  </div>

                  <div className="stock-level">
                    <strong>✓</strong>
                    <span>healthy</span>
                  </div>
                </div>
              ) : (
                lowStockProducts.map((item) => {
                  const balance = Number(item.balance || 0);
                  const minimum = Number(item.minimum || 0);

                  const levelClass =
                    balance === 0 ||
                    balance <= Math.max(minimum / 2, 1)
                      ? "danger"
                      : "warning";

                  return (
                    <div
                      className="stock-list-item"
                      key={item.id}
                    >
                      <div>
                        <strong>{item.name}</strong>

                        <span>
                          {item.category} · {item.size}
                        </span>
                      </div>

                      <div
                        className={`stock-level ${levelClass}`}
                      >
                        <strong>{balance}</strong>
                        <span>remaining</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </article>

          <article className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <span className="dashboard-panel-tag">
                  LATEST UPDATES
                </span>

                <h3>Recent Activity</h3>
              </div>
            </div>

            <div className="dashboard-activity-list">
              {recentActivities.length === 0 ? (
                <div className="activity-item">
                  <span className="activity-marker"></span>

                  <div>
                    <strong>No activity recorded yet</strong>

                    <span>
                      Product additions and stock updates will
                      appear here.
                    </span>
                  </div>
                </div>
              ) : (
                recentActivities.map((activity) => {
                  const isStockUpdate =
                    activity.type === "stock-updated";

                  return (
                    <div
                      className="activity-item"
                      key={activity.id}
                    >
                      <span className="activity-marker"></span>

                      <div>
                        <strong>
                          {isStockUpdate
                            ? `Stock updated for ${activity.productName}`
                            : `New product added: ${activity.productName}`}
                        </strong>

                        <span>
                          {isStockUpdate
                            ? `${activity.quantity} units sold`
                            : `${activity.productName} ${activity.size}`}{" "}
                          · {formatRelativeTime(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;