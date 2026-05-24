import api from "../api";

export const gitAllMakzanSubmissionReport = (params) =>
  api.get("/makzan-submission-reports", { params });

export const getMakzanSubmissionReportById = (id) =>
  api.get(`/makzan-submission-reports/${id}`);

export const createMakzanSubmissionReport = (reportData) => {
  return api.post("/makzan-submission-reports", reportData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const updateMakzanSubmissionReport = (id, reportData) => {
  return api.put(`/makzan-submission-reports/${id}`, reportData, {
    headers: {
      "Content-Type":
        reportData instanceof FormData
          ? "multipart/form-data"
          : "application/json",
    },
  });
};

export const deleteMakzanSubmissionReport = (id) =>
  api.delete(`/makzan-submission-reports/${id}`);

export const downloadFile = (filename) => {
  return api.get(`/makzan-submission-reports/download/${filename}`, {
    responseType: "blob",
  });
};
