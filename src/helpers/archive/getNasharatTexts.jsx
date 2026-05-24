const getNasharatTexts = (t) => ({
  // ===== Page / Titles =====
  title: t("title"),
  newNasharat: t("newNasharat"),
  newIncoming: t("newIncoming"),
  newOutgoing: t("newOutgoing"),
  viewIncoming: t("viewIncoming"),
  viewOutgoing: t("viewOutgoing"),

  recordTypeForDirection: t("recordTypeForDirection"),

  // ===== Archive Types =====
  type: t("type"),
  incoming: t("incoming"),
  outgoing: t("outgoing"),
  all: t("all"),

  // ===== Common Fields =====
  docNo: t("docNo"),
  departmentDate: t("departmentDate"),
  incomingDate: t("incomingDate"),

  outgoingDate: t("outgoingDate"),
  sendDate: t("sendDate"),
  submittedDate: t("submittedDate"),
  org: t("org"),
  organization: t("organization"),
  sender: t("sender"),
  receiver: t("receiver"),
  docType: t("docType"),
  year: t("year"),
  description: t("description"),
  descriptionPlaceholder: t("descriptionPlaceholder"),

  // ===== Actions =====
  view: t("view"),
  edit: t("edit"),
  delete: t("delete"),
  save: t("save"),
  cancel: t("cancel"),
  close: t("close"),
  back: t("back"),

  // ===== Table =====
  actions: t("actions"),
  rowsPerPage: t("rowsPerPage"),
  of: t("of"),

  // ===== Filters & Search =====
  search: t("search"),
    filter: t("filter"),

  fieldDocNo: t("fieldDocNo"),
  fieldOrg: t("fieldOrg"),
  fieldYear: t("fieldYear"),
  fieldDocType: t("fieldDocType"),

  // ===== Dialogs =====
  deleteDialogTitle: t("deleteDialogTitle"),
  deleteDialogText: t("deleteDialogText"),

  // ===== Messages & States =====
  loading: t("loading"),
  success: t("success"),
  error: t("error"),
  loadError: t("loadError"),
  deleteSuccess: t("deleteSuccess"),
  deleteError: t("deleteError"),
  noData: t("noData"),
  notAvailable: t("notAvailable"),
  noArchiveSelected: t("noArchiveSelected"),
  remarksPlaceholder: t("remarksPlaceholder"),

  // ===== Selects =====
  selectOrg: t("selectOrg"),
  selectDocType: t("selectDocType"),

  // ===== Validation =====
  required: t("required"),
});

export default getNasharatTexts;
