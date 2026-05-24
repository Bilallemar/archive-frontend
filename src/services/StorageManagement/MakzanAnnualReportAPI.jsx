import api from "../api";

export const gitAllAnnualReports = (params) => api.get("/makzan-annual-reports", { params });

export const getAnnualReportById = (id) =>
  api.get(`/makzan-annual-reports/${id}`);

export const createAnnualReport = (reportData) => {
  return api.post("/makzan-annual-reports", reportData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const updateAnnualReport = (id, reportData) => {
  return api.put(`/makzan-annual-reports/${id}`, reportData, {
    headers: {
      "Content-Type":
        reportData instanceof FormData
          ? "multipart/form-data"
          : "application/json",
    },
  });
};

export const deleteAnnualReport = (id) =>
  api.delete(`/makzan-annual-reports/${id}`);

export const downloadFile = (filename) => {
  return api.get(`/makzan-annual-reports/download/${filename}`, {
    responseType: "blob",
  });
};
