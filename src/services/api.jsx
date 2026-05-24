import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  console.error("CRITICAL: VITE_API_URL is not defined!");
  toast.error("Configuration error! API URL is missing.");
}

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { Accept: "application/json" },
  withCredentials: true,
  timeout: 10000,
});

// ← Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("JWT_TOKEN");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔐 Request to ${config.url} with token`);
    } else {
      console.warn(`⚠️ Request to ${config.url} WITHOUT token!`);
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      console.log(`📦 FormData request detected`);
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  },
);

// ← Single response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Network error
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      console.error("Network error: Backend is not reachable at", API_URL);
      toast.error(
        "Cannot connect to server. Please check if backend is running.",
      );
      return Promise.reject(error);
    }

    // Timeout error
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout");
      toast.error("Request timed out. Please try again.");
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url;
    const errorData = error.response?.data;

    // Handle 401 Unauthorized
    if (status === 401) {
      const hasToken = localStorage.getItem("JWT_TOKEN");

      if (
        url?.includes("/signin") ||
        url?.includes("/login") ||
        url?.includes("/signup")
      ) {
        toast.error(errorData?.message || "Invalid credentials");
        return Promise.reject(error);
      }

      if (url?.includes("/verify-2fa") || url?.includes("/2fa")) {
        toast.error(errorData?.message || "Invalid verification code");
        return Promise.reject(error);
      }

      if (hasToken && !originalRequest._retry) {
        const errorMsg = errorData?.message?.toLowerCase() || "";
        const isTokenError =
          errorMsg.includes("token") ||
          errorMsg.includes("expired") ||
          errorMsg.includes("jwt") ||
          errorMsg.includes("unauthorized");

        if (isTokenError) {
          originalRequest._retry = true;
          toast.error("Your session has expired. Please login again.");
          localStorage.clear();
          setTimeout(() => {
            window.location.href = "/login";
          }, 1500);
          return Promise.reject(error);
        }
      }

      toast.error(errorData?.message || "Authentication required");
      return Promise.reject(error);
    }

    // Handle 403 Forbidden — disabled account or no permission
    if (status === 403) {
      const message = errorData?.message || "Access denied";
      if (message.includes("غیر فعال") || message.includes("disabled")) {
        localStorage.clear();
        toast.error(message);
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
        return Promise.reject(error);
      }
      toast.error(message);
      return Promise.reject(error);
    }

    // Handle other status codes
    const errorMessages = {
      400: errorData?.message || "Invalid request data",
      404: errorData?.message || "Resource not found",
      409: errorData?.message || "Conflict with existing data",
      422: errorData?.message || "Validation failed",
      500: errorData?.message || "Server error. Please try again later",
      503: errorData?.message || "Service temporarily unavailable",
    };

    if (errorMessages[status]) {
      console.error(`HTTP ${status}:`, errorMessages[status]);
      toast.error(errorMessages[status]);
    } else if (status) {
      toast.error(errorData?.message || `Request failed with status ${status}`);
    }

    return Promise.reject(error);
  },
);

// Test backend connection
export const testBackendConnection = async () => {
  try {
    await axios.get(`${API_URL}/api/csrf-token`, { timeout: 5000 });
    console.log("Backend connection successful");
    return true;
  } catch (error) {
    console.error("Backend connection failed:", error.message);
    return false;
  }
};

export default api;
