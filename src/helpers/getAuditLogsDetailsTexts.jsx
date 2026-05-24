// src/utils/getAuditLogsDetailsTexts.js
const getAuditLogsDetailsTexts = (t) => ({
  // Page title & header
  pageTitle: t("pageTitle"),
  backButton: t("backButton"),

  // States & messages
  noLogsFound: t("noLogsFound"),
  loading: t("loading"),
  errorFetch: t("error.fetch"),

  // Table headers
  table: {
    action: t("table.action"),
    username: t("table.username"),
    tableName: t("table.tableName"),
    recordId: t("table.recordId"),
    content: t("table.content"),
    timestamp: t("table.timestamp"),
  },

  // Fallbacks
  unknown: t("unknown"),

  // Pagination
  pagination: {
    rowsPerPage: t("pagination.rowsPerPage"),
    displayedRows: (opts) => t("pagination.displayedRows", opts),
  },
});

export default getAuditLogsDetailsTexts;
