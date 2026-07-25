const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

/* =========================================================
   TOKEN HELPERS
========================================================= */

function getStoredToken() {
  return (
    localStorage.getItem("bgs_token") ||
    sessionStorage.getItem("bgs_token")
  );
}

function clearStoredSession() {
  localStorage.removeItem("bgs_token");
  localStorage.removeItem("bgs_user");

  sessionStorage.removeItem("bgs_token");
  sessionStorage.removeItem("bgs_user");
}

function getAuthHeaders(includeContentType = false) {
  const token = getStoredToken();
  const headers = {};

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/* =========================================================
   RESPONSE HANDLING
========================================================= */

async function handleResponse(response) {
  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "The server returned an invalid response."
    );
  }

  if (response.status === 401) {
    clearStoredSession();

    throw new Error(
      data.message ||
        "Your session has expired. Please sign in again."
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong."
    );
  }

  return data;
}

/* =========================================================
   AUTHENTICATION
========================================================= */

export async function loginUser(email, password) {
  const response = await fetch(
    `${API_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  return handleResponse(response);
}

/* =========================================================
   PRODUCTS
========================================================= */

export async function getProducts() {
  const response = await fetch(
    `${API_URL}/products`,
    {
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
}

export async function createProduct(productData) {
  const response = await fetch(
    `${API_URL}/products`,
    {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(productData),
    }
  );

  return handleResponse(response);
}

export async function sellProduct(
  productId,
  soldQuantity
) {
  const response = await fetch(
    `${API_URL}/products/${productId}/sell`,
    {
      method: "PATCH",
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        soldQuantity,
      }),
    }
  );

  return handleResponse(response);
}

export async function restockProduct(
  productId,
  restockData
) {
  const response = await fetch(
    `${API_URL}/products/${productId}/restock`,
    {
      method: "PATCH",
      headers: getAuthHeaders(true),
      body: JSON.stringify(restockData),
    }
  );

  return handleResponse(response);
}

/* =========================================================
   ACTIVITIES
========================================================= */

export async function getActivities() {
  const response = await fetch(
    `${API_URL}/activities`,
    {
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
}