import api from "../api";

export const getAllSawanih = (params) => api.get("/sawanih", { params });

export const getSawanihById = (id) => api.get(`/sawanih/${id}`);

export const createSawanih = (formDataToSend) => {
  return api.post("/sawanih", formDataToSend, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateSawanih = (id, formDataToSend) => {
  return api.put(`/sawanih/${id}`, formDataToSend, {
    headers: {
      "Content-Type":
        formDataToSend instanceof FormData
          ? "multipart/form-data"
          : "application/json",
    },
  });
};

export const deleteSawanih = (id) => api.delete(`/sawanih/${id}`);

export const downloadFile = (filename) => {
  return api.get(`/sawanih/download/${encodeURIComponent(filename)}`, {
    responseType: "blob",
  });
};
