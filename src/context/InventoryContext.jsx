import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createProduct,
  getActivities,
  getProducts,
  restockProduct,
  sellProduct,
} from "../services/api";

const InventoryContext = createContext(null);

function hasAuthToken() {
  return Boolean(
    localStorage.getItem("bgs_token") ||
      sessionStorage.getItem("bgs_token")
  );
}

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================================================
     LOAD MYSQL DATA
  ========================================================= */

  const loadInventoryData = useCallback(async () => {
    /*
     * Don't request protected inventory APIs before login.
     */
    if (!hasAuthToken()) {
      setInventory([]);
      setActivities([]);
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [
        productsResponse,
        activitiesResponse,
      ] = await Promise.all([
        getProducts(),
        getActivities(),
      ]);

      setInventory(
        Array.isArray(productsResponse?.products)
          ? productsResponse.products
          : []
      );

      setActivities(
        Array.isArray(activitiesResponse?.activities)
          ? activitiesResponse.activities
          : []
      );
    } catch (requestError) {
      console.error(
        "Unable to load inventory data:",
        requestError
      );

      setError(
        requestError.message ||
          "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================================================
     INITIAL LOAD + AUTH CHANGE REFRESH
  ========================================================= */

  useEffect(() => {
    loadInventoryData();

    /*
     * Fired after login/logout in the same browser tab.
     */
    const handleAuthChange = () => {
      loadInventoryData();
    };

    /*
     * Helpful when returning to the application after
     * switching tabs/apps or restoring a mobile browser page.
     */
    const handleFocus = () => {
      if (hasAuthToken()) {
        loadInventoryData();
      }
    };

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        hasAuthToken()
      ) {
        loadInventoryData();
      }
    };

    /*
     * Handles authentication changes from another tab.
     */
    const handleStorage = (event) => {
      if (
        event.key === "bgs_token" ||
        event.key === "bgs_user"
      ) {
        loadInventoryData();
      }
    };

    window.addEventListener(
      "bgs-auth-changed",
      handleAuthChange
    );

    window.addEventListener(
      "focus",
      handleFocus
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.removeEventListener(
        "bgs-auth-changed",
        handleAuthChange
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [loadInventoryData]);

  /* =========================================================
     ADD PRODUCT
  ========================================================= */

  const addProduct = async (productData) => {
    const result = await createProduct(productData);

    if (!result.success || !result.product) {
      throw new Error(
        result.message ||
          "Unable to add product."
      );
    }

    setInventory((current) => [
      result.product,
      ...current,
    ]);

    try {
      const activitiesResponse =
        await getActivities();

      setActivities(
        Array.isArray(
          activitiesResponse?.activities
        )
          ? activitiesResponse.activities
          : []
      );
    } catch (activityError) {
      console.error(
        "Product saved, but activities could not be refreshed:",
        activityError
      );
    }

    return result.product;
  };

  /* =========================================================
     SELL PRODUCT / UPDATE STOCK
  ========================================================= */

  const updateStock = async ({
    productId,
    soldQuantity,
  }) => {
    const result = await sellProduct(
      productId,
      soldQuantity
    );

    if (!result.success) {
      throw new Error(
        result.message ||
          "Unable to update stock."
      );
    }

    setInventory((current) =>
      current.map((item) =>
        String(item.id) ===
        String(productId)
          ? {
              ...item,
              balance: Number(
                result.newBalance
              ),
            }
          : item
      )
    );

    if (result.activity) {
      setActivities((current) =>
        [
          result.activity,
          ...current,
        ].slice(0, 100)
      );
    } else {
      try {
        const activitiesResponse =
          await getActivities();

        setActivities(
          Array.isArray(
            activitiesResponse?.activities
          )
            ? activitiesResponse.activities
            : []
        );
      } catch (activityError) {
        console.error(
          "Stock updated, but activities could not be refreshed:",
          activityError
        );
      }
    }

    return result;
  };

  /* =========================================================
     RESTOCK PRODUCT
  ========================================================= */

  const restockInventoryProduct = async ({
    productId,
    restockQuantity,
    invoiceNumber,
    expiryDate,
    unitPrice,
  }) => {
    const result = await restockProduct(
      productId,
      {
        restockQuantity,
        invoiceNumber,
        expiryDate,
        unitPrice,
      }
    );

    if (!result.success || !result.product) {
      throw new Error(
        result.message ||
          "Unable to restock product."
      );
    }

    setInventory((current) =>
      current.map((item) =>
        String(item.id) ===
        String(productId)
          ? {
              ...item,
              received: Number(
                result.product.received
              ),
              balance: Number(
                result.product.balance
              ),
              invoice:
                result.product.invoice,
              expiry:
                result.product.expiry,
              unitPrice: Number(
                result.product.unitPrice
              ),
            }
          : item
      )
    );

    if (result.activity) {
      setActivities((current) =>
        [
          result.activity,
          ...current,
        ].slice(0, 100)
      );
    } else {
      try {
        const activitiesResponse =
          await getActivities();

        setActivities(
          Array.isArray(
            activitiesResponse?.activities
          )
            ? activitiesResponse.activities
            : []
        );
      } catch (activityError) {
        console.error(
          "Product restocked, but activities could not be refreshed:",
          activityError
        );
      }
    }

    return result;
  };

  /* =========================================================
     REFRESH
  ========================================================= */

  const resetInventory = async () => {
    await loadInventoryData();

    return {
      success: true,
      message:
        "Inventory refreshed successfully.",
    };
  };

  /* =========================================================
     SUMMARY
  ========================================================= */

  const summary = useMemo(() => {
    const totalProducts =
      inventory.length;

    const totalUnits =
      inventory.reduce(
        (total, item) =>
          total +
          Number(item.balance || 0),
        0
      );

    const stockValue =
      inventory.reduce(
        (total, item) =>
          total +
          Number(item.balance || 0) *
            Number(item.unitPrice || 0),
        0
      );

    const lowStockItems =
      inventory.filter((item) => {
        const balance = Number(
          item.balance || 0
        );

        const minimum = Number(
          item.minimum || 0
        );

        return (
          balance > 0 &&
          balance <= minimum
        );
      }).length;

    const outOfStockItems =
      inventory.filter(
        (item) =>
          Number(item.balance || 0) === 0
      ).length;

    return {
      totalProducts,
      totalUnits,
      stockValue,
      lowStockItems,
      outOfStockItems,
    };
  }, [inventory]);

  const value = {
    inventory,
    activities,
    summary,
    loading,
    error,
    addProduct,
    updateStock,
    restockProduct:
      restockInventoryProduct,
    resetInventory,
    refreshInventory:
      loadInventoryData,
  };

  return (
    <InventoryContext.Provider
      value={value}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context =
    useContext(InventoryContext);

  if (!context) {
    throw new Error(
      "useInventory must be used inside InventoryProvider."
    );
  }

  return context;
}