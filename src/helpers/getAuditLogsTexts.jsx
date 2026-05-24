// src/utils/getAuditLogsTexts.js
const getAuditLogsTexts = (t) => ({
  // Page / Titles
  title: t("title"),
  description: t("description"),

  // Statistics Cards
  stats: {
    create: t("stats.create"),
    createLabel: t("stats.create.label"),
    update: t("stats.update"),
    updateLabel: t("stats.update.label"),
    delete: t("stats.delete"),
    deleteLabel: t("stats.delete.label"),
    total: t("stats.total"),
    totalLabel: t("stats.total.label"),
  },

  // Table Headers
  table: {
    action: t("table.action"),
    username: t("table.username"),
    tableModel: t("table.tableModel"),
    recordId: t("table.recordId"),
    content: t("table.content"),
    timestamp: t("table.timestamp"),
    actions: t("table.actions"),
  },

  // Buttons & Actions
  button: {
    view: t("button.view"),
  },

  // States & Messages
  unknown: t("unknown"),
  noData: t("noData"),
  loading: t("loading"),

  // Errors
  error: {
    fetchFailed: t("error.fetchFailed"),
  },

  // Pagination
  pagination: {
    rowsPerPage: t("pagination.rowsPerPage"),
    displayedRows: (opts) => t("pagination.displayedRows", opts),
  },
});

export default getAuditLogsTexts;
