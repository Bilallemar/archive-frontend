import api from "../api";

export const getAllHifziyaWaradaSadera = (params) =>
  api.get("/hifziya-warada-sadera", { params });

export const getHifziyaWaradaSaderaById = (id) =>
  api.get(`/hifziya-warada-sadera/${id}`);

// ✅ FIXED: Don't set Content-Type manually for FormData
// Axios will automatically set "multipart/form-data" with the correct boundary
export const createHifziyaWaradaSadera = (formDataToSend) => {
  return api.post("/hifziya-warada-sadera", formDataToSend);
};

// ✅ FIXED: Same fix for update
export const updateHifziyaWaradaSadera = (id, hazariData) => {
  return api.put(`/hifziya-warada-sadera/${id}`, hazariData);
};

export const deleteHifziyaWaradaSadera = (id) =>
  api.delete(`/hifziya-warada-sadera/${id}`);

// ✅ FIXED: URL was wrong - "upload" should be "download"
export const downloadFile = (filename) => {
  return api.get(`/hifziya-warada-sadera/download/${filename}`, {
    responseType: "blob",
  });
};
