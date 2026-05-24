// src/helpers/hifziya/hazari/AddHazariText.js

const getAddHazariTexts = (t) => ({
  // ===== Page =====
  title: t("page.title"),
  back: t("page.back"),
  newIndraj: t("page.newIndraj"),
  newHazari: t("page.newHazari"),
  filter: t("filter"),
  search: t("search"),

  // ===== Scanner =====
  scannerFolderPath: t("scanner.folderPath"),
  scannerFolderTitle: t("scanner.folderTitle"),
  scanButton: t("scanner.scanButton"),
  scanning: t("scanner.scanning"),
  loadFiles: t("scanner.loadFiles"),
  clickToScan: t("scanner.clickToScan"),
  filesAvailable: t("scanner.filesAvailable"),
  detectedFiles: t("scanner.detectedFiles"),
  noFiles: t("scanner.noFiles"),
  filesFound: t("scanner.filesFound"),
  scanError: t("scanner.scanError"),
  loadSuccess: t("scanner.loadSuccess"),
  loadError: t("scanner.loadError"),

  // ===== Upload =====
  manualUpload: t("upload.manualUpload"),
  readyToUpload: t("upload.readyToUpload"),
  removeAll: t("upload.removeAll"),

  // ===== Form Fields =====
  volume: t("form.volume"),
  recordType: t("form.recordType"),
  indraj: t("form.indraj"),
  hazari: t("form.hazari"),
  type: t("form.type"),
  subType: t("form.subType"),
  year: t("form.year"),
  org: t("form.org"),
  description: t("form.description"),
  selectTypeFirst: t("form.selectTypeFirst"),
  loading: t("form.loading"),
  all: t("form.all"),

  // ===== Table Columns =====
  action: t("table.action"),
  actions: t("table.actions"),
  direction: t("table.direction"),

  // ===== Actions =====
  cancel: t("actions.cancel"),
  save: t("actions.save"),
  saving: t("actions.saving"),
  view: t("actions.view"),
  edit: t("actions.edit"),
  delete: t("actions.delete"),
  confirm: t("actions.confirm"),

  // ===== Messages =====
  loadDataError: t("messages.loadDataError"),
  loadSubTypesError: t("messages.loadSubTypesError"),
  requiredFields: t("messages.requiredFields"),
  createSuccess: t("messages.createSuccess"),
  createError: t("messages.createError"),
  deleteSuccess: t("messages.deleteSuccess"),
  deleteError: t("messages.deleteError"),
  updateSuccess: t("messages.updateSuccess"),
  updateError: t("messages.updateError"),
  noDataFound: t("messages.noDataFound"),
  remarksPlaceholder: t("messages.remarksPlaceholder"),

  // ===== Delete Dialog =====
  deleteDialogTitle: t("deleteDialog.title"),
  deleteDialogText: t("deleteDialog.text"),

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
  rowsPerPage: t("rowsPerPage"),
  of: t("of"),
});

export default getAddHazariTexts;
