import api from "../api";

export const getAllReceipts = (params) =>
  api.get("/makzan-receipts", { params });

// 🔹 NEW: Search API
export const searchReceipts = (field, keyword) => {
  const params = {};
  if (keyword) params.keyword = keyword;
  if (field) params.field = field;

  return api.get("/makzan-receipts/search", { params });
};

export const getReceiptById = (id) => api.get(`/makzan-receipts/${id}`);

export const createReceipt = (formDataToSend) => {
  return api.post("/makzan-receipts", formDataToSend, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateReceipt = (id, formDataToSend) => {
  return api.put(`/makzan-receipts/${id}`, formDataToSend, {
    headers: {
      "Content-Type":
        formDataToSend instanceof FormData
          ? "multipart/form-data"
          : "application/json",
    },
  });
};

export const deleteReceipt = (id) => api.delete(`/makzan-receipts/${id}`);

export const downloadFile = (filename) => {
  return api.get(`/makzan-receipts/download/${filename}`, {
    responseType: "blob",
  });
};
