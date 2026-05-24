import api from "../api";

export const getAllMinotMakatibs = (params) =>
  api.get("/minot-makatib", { params });

export const getMinotMakatibById = (id) => api.get(`/minot-makatib/${id}`);

export const createMinotMakatib = (formDataToSend) => {
  return api.post("/minot-makatib", formDataToSend, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateMinotMakatib = (id, formDataToSend) => {
  return api.put(`/minot-makatib/${id}`, formDataToSend, {
    headers: {
      "Content-Type":
        formDataToSend instanceof FormData
          ? "multipart/form-data"
          : "application/json",
    },
  });
};

export const deleteMinotMakatib = (id) => api.delete(`/minot-makatib/${id}`);

export const downloadFile = (filename) => {
  return api.get(`/minot-makatib/download/${encodeURIComponent(filename)}`, {
    responseType: "blob",
  });
};
