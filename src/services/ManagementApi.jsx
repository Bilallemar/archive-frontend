import api from "./api";

// Get all managements
export const getAllManagements = async () => {
  const response = await api.get("/managements");
  return response.data;
};

// Assign user to management (Admin only)
export const assignUserToManagement = async (userId, managementId) => {
  const response = await api.post("/user-management/assign", null, {
    params: { userId, managementId },
  });
  return response.data;
};

// Get unassigned users
export const getUnassignedUsers = async () => {
  const response = await api.get("/user-management/unassigned-users");
  return response.data;
};

// Get management statistics
export const getManagementStatistics = async () => {
  const response = await api.get("/user-management/statistics");
  return response.data;
};
export const getAllUsers = async () => {
  const response = await api.get("/admin/getusers");
  return response.data;
};
