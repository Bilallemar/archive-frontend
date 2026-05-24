export const getUserManagementTexts = (t) => ({
  pageTitle: t("userManagementPageTitle"),
  pageDescription: t("userManagementPageDescription"),
  assignInfo: t(
    "assignInfo",
    "Assign each user to a management department. Users can only access data from their assigned management. Admins have access to all managements."
  ),
  username: t("username"),
  email: t("email"),
  createdDate: t("createdDate") || "Created Date",
  role: t("role"),
  currentManagement: t("currentManagement"),
  assignNewManagement: t("assignNewManagement"),
  actions: t("actions"),
  createdDate: t("createdDate"),
  newUser: t("newUser"),
  selectManagement: t("selectManagement"),
  assignButton: t("assignButton"),
  adminLabel: t("adminLabel", "Admin"),
  allManagementsLabel: t("allManagementsLabel", "All Managements"),
  unassignedLabel: t("unassignedLabel", "Not Assigned"),
  adminAccessNote: t(
    "adminAccessNote",
    "Admin has access to all managements. No action needed."
  ),
  loading: t("loading"),
  statisticsUsersAssigned: t("statisticsUsersAssigned", "Users assigned"),
  statisticsUnassignedUsers: t(
    "statisticsUnassignedUsers",
    "Users without management"
  ),
  errorLoadData: t("errorLoadData", "Failed to load data"),
  successAssign: t("successAssign", "Management assigned successfully!"),
  errorAssign: t("errorAssign", "Failed to assign management"),
  errorSelectManagement: t(
    "errorSelectManagement",
    "Please select a management"
  ),
});
