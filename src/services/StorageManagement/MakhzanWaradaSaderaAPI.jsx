import api from "../api";

export const getAllMakhzanWaradaSadera = (params) =>
  api.get("/makhzan-warada-sadera", { params });

export const getMakhzanWaradaSaderaById = (id) =>
  api.get(`/makhzan-warada-sadera/${id}`);

export const createMakhzanWaradaSadera = (formDataToSend) => {
  return api.post("/makhzan-warada-sadera", formDataToSend, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateMakhzanWaradaSadera = (id, makhzanData) => {
  return api.put(`/makhzan-warada-sadera/${id}`, makhzanData);
};

export const deleteMakhzanWaradaSadera = (id) =>
  api.delete(`/makhzan-warada-sadera/${id}`);

export const downloadFile = (filename) => {
  return api.get(`/makhzan-warada-sadera/download/${filename}`, {
    responseType: "blob",
  });
};
