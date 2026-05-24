const getMakzanReceiptTexts = (t) => {
  return {
    // Page Title
    pageTitle: t("pageTitle"),
    newReceipt: t("newReceipt"),
    addNewReceipt: t("addNewReceipt"),
    editReceiptTitle: t("editReceiptTitle"),

    // Table Column Headers
    department: t("department"),
    docNo: t("docNo"),
    org: t("org"),
    letterNo: t("letterNo"),
    letterDate: t("letterDate"),
    subjectType: t("subjectType"),
    description: t("description"),
    actions: t("actions"),

    // Filter Labels
    allFields: t("allFields"),

    // Action Buttons
    view: t("view"),
    edit: t("edit"),
    delete: t("delete"),
    save: t("save"),
    cancel: t("cancel"),
    back: t("back"),
    close: t("close"),

    // Dialog Titles
    viewDetails: t("viewDetails"),
    editReceipt: t("editReceipt"),
    deleteConfirmTitle: t("deleteConfirmTitle"),

    // Dialog Messages
    deleteConfirmMessage: t("deleteConfirmMessage"),
    noReceiptSelected: t("noReceiptSelected"),

    // File Upload
    scannerFolder: t("scannerFolder"),
    scannerFiles: t("scannerFiles"),
    scan: t("scan"),
    scanning: t("scanning"),
    loadFiles: t("loadFiles"),
    addManualFile: t("addManualFile"),
    readyForUpload: t("readyForUpload"),
    newFiles: t("newFiles"),
    existingFiles: t("existingFiles"),
    filesDetected: t("filesDetected"),
    noFilesInScanner: t("noFilesInScanner"),
    clickScanButton: t("clickScanButton"),
    addNewFiles: t("addNewFiles"),
    allowedFormats: t("allowedFormats"),
    maxSize: t("maxSize"),
    filesReplaceWarning: t("filesReplaceWarning"),

    // Form Labels
    department: t("department"),
    documentNo: t("documentNo"),
    organization: t("organization"),
    letterNumber: t("letterNumber"),
    letterDateLabel: t("letterDateLabel"),
    subjectTypeLabel: t("subjectTypeLabel"),
    remarks: t("remarks"),
    file: t("file"),

    // Validation Messages
    requiredField: t("requiredField"),
    fillRequired: t("fillRequired"),

    // Success/Error Messages
    createSuccess: t("createSuccess"),
    createError: t("createError"),
    updateSuccess: t("updateSuccess"),
    updateError: t("updateError"),
    deleteSuccess: t("deleteSuccess"),
    deleteError: t("deleteError"),
    loadError: t("loadError"),
    orgLoadError: t("orgLoadError"),
    filesLoadedFromScanner: t("filesLoadedFromScanner"),
    filesLoadError: t("filesLoadError"),
    scanError: t("scanError"),

    // Loading States
    loading: t("loading"),
    saving: t("saving"),
    updating: t("updating"),

    // Misc
    filesAvailable: t("filesAvailable"),
    orText: t("orText"),
      filter: t("filter"),
search: t("search"),
  rowsPerPage: t("rowsPerPage"),
of: t("of"),  
      // ===== Cabinet =====
  cabinetAddress: t("cabinetAddress"),
  cabinet: t("cabinet"),
  cabinets: t("cabinets"),
  floor: t("floor"),
  floors: t("floors"),
  shelf: t("shelf"),
  shelves: t("shelves"),
  file: t("file"),
  files: t("files"),
  };
};

export default getMakzanReceiptTexts;
