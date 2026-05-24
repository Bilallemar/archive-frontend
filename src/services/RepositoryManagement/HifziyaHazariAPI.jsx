import api from "../api";

export const getAllHifziyaHazaris = (params) =>
  api.get("/hifziya-hazari", { params });

export const getHifziyaHazariById = (id) => api.get(`/hifziya-hazari/${id}`);

export const createHifziyaHazari = (formDataToSend) => {
  return api.post("/hifziya-hazari", formDataToSend, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateHifziyaHazari = (id, hazariData) => {
  return api.put(`/hifziya-hazari/${id}`, hazariData, {
    headers: {
      "Content-Type":
        hazariData instanceof FormData
          ? "multipart/form-data"
          : "application/json",
    },
  });
};

export const deleteHifziyaHazari = (id) => api.delete(`/hifziya-hazari/${id}`);

// HifziyaHazariAPI.jsx
export const getFileDownloadUrl = (filename) => {
  const token = localStorage.getItem("jwtToken"); // ← use your actual key
  return `http://localhost:8081/api/hifziya-hazari/download/${encodeURIComponent(filename)}?token=${token}`;
};
