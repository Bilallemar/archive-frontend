

// export default LandingPageTexts;
const LandingPageTexts = (t) => ({
  // Stat Cards
  totalRecipients: t("totalRecipients"),
  totalSenders: t("totalSenders"),
  totalFiles: t("totalFiles"),
  last7Days: t("last7Days"),

  // Management Cards
  makzanReceipts: t("makzanReceipts"),
  makzanAnnualReports: t("makzanAnnualReports"),
  makzanSubmissionReports: t("makzanSubmissionReports"),

  // Errors
  sessionExpired: t("sessionExpired"),
  accessDenied: t("accessDenied"),
  dashboardLoadError: t("dashboardLoadError"),
  noManagementAssigned: t("noManagementAssigned"),

  // Donut Chart
  documentDistribution: t("documentDistribution"),
  total: t("total"),
  sender: t("sender"),
  recipient: t("recipient"),
  file: t("file"),

  // Bar Chart
  documentsByMonth: t("documentsByMonth"),
  currentYear: t("currentYear"),

  // Months Array
  months: t("months", { returnObjects: true }),
});

export default LandingPageTexts; // ← ADD THIS LINE!
