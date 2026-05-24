// helpers/Storage/MakzanAnnualReport/MakzanAnnualReportText.js

const getMakzanAnnualReportTexts = (t) => {
  return {
    // Page Title
    pageTitle: t("pageTitle"),
    newReport: t("newReport"),
    addNewReport: t("addNewReport"),
  filter: t("filter"),
search: t("search"),
    // Table Column Headers
    province: t("province"),
    district: t("district"),
    address: t("address"),
    year: t("year"),
    docType: t("docType"),
    summaryWaseqa: t("summaryWaseqa"),
    description: t("description"),
    actions: t("actions"),
  rowsPerPage: t("rowsPerPage"),
of: t("of"),  
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
    editReport: t("editReport"),
    deleteConfirmTitle: t("deleteConfirmTitle"),

    // Dialog Messages
    deleteConfirmMessage: t("deleteConfirmMessage"),
    noReportSelected: t("noReportSelected"),

    // Form Labels
    addressLabel: t("addressLabel"),
    yearLabel: t("yearLabel"),
    docTypeLabel: t("docTypeLabel"),
    summaryWaseqaLabel: t("summaryWaseqaLabel"),
    remarksLabel: t("remarksLabel"),

    // Validation
    required: t("required"),
    yearRequired: t("yearRequired"),
    requiredField: t("requiredField"),
    fillRequired: t("fillRequired"),

    // Dropdown
    selectProvince: t("selectProvince"),
    selectDistrict: t("selectDistrict"),
    selectDocType: t("selectDocType"),

    // Scanner Section
    scannerFolderTitle: t("scannerFolderTitle"),
    clickToScan: t("clickToScan"),
    scanButton: t("scanButton"),
    scanning: t("scanning"),
    loadFiles: t("loadFiles"),
    detectedFiles: t("detectedFiles"),
    manualUpload: t("manualUpload"),
    readyToUpload: t("readyToUpload"),

    // Scanner Messages
    noFilesFound: t("noFilesFound"),
    filesDetected: t("filesDetected"),
    scanError: t("scanError"),
    filesLoadError: t("filesLoadError"),

    // Success/Error Messages
    createSuccess: t("createSuccess"),
    createError: t("createError"),
    updateSuccess: t("updateSuccess"),
    updateError: t("updateError"),
    deleteSuccess: t("deleteSuccess"),
    deleteError: t("deleteError"),
    loadError: t("loadError"),

    // Loading
    loading: t("loading"),
    saving: t("saving"),
    updating: t("updating"),

    // Buttons
    saveChanges: t("saveChanges"),

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

export default getMakzanAnnualReportTexts;
