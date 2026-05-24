import api from "../api";

// Get all archives
export const getAllNasharats = (params) => api.get("/nasharats", { params });

// Get archive by ID - FIXED: Added parentheses
export const getNasharatById = (id) => api.get(`/nasharats/${id}`);

// Create new archive
export const createNasharat = (nasharatData) => {
  return api.post("/nasharats", nasharatData, {
    headers: { "Content-Type": "application/json" },
  });
};

// Update archive - FIXED: Added parentheses
export const updateNasharat = (id, nasharatData) => {
  return api.put(`/nasharats/${id}`, nasharatData, {
    headers: { "Content-Type": "application/json" },
  });
};

// Delete archive - FIXED: Added parentheses
export const deleteNasharat = (id) => api.delete(`/nasharats/${id}`);
