import api from "../api";

// Get all archives
export const getAllArchives = (params) => api.get("/archives", { params });

// Get archive by ID - FIXED: Added parentheses
export const getArchiveById = (id) => api.get(`/archives/${id}`);

// Create new archive
export const createArchive = (archiveData) => {
  return api.post("/archives", archiveData, {
    headers: { "Content-Type": "application/json" },
  });
};

// Update archive - FIXED: Added parentheses
export const updateArchive = (id, archiveData) => {
  return api.put(`/archives/${id}`, archiveData, {
    headers: { "Content-Type": "application/json" },
  });
};

// Delete archive - FIXED: Added parentheses
export const deleteArchive = (id) => api.delete(`/archives/${id}`);
