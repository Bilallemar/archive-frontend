// src/helpers/shuraAali/ShuraAaliResolutionTexts.js

const getShuraAaliResolutionTexts = (t) => ({
  // ===== Page Titles =====
  shuraAaliResolutions: t("page.shuraAaliResolutions"),
  newResolution: t("page.newResolution"),
  editResolution: t("page.editResolution"),
  viewResolution: t("page.viewResolution"),
  newYadasht: t("page.newYadasht"),
  editYadasht: t("page.editYadasht"),
  viewYadasht: t("page.viewYadasht"),
  viewMosawaba: t("page.viewMosawaba"),
  back: t("page.back"),
  filter: t("filter"),
search: t("search"),

  // ===== Table Columns =====
  id: t("table.id"),
  sendDate: t("table.sendDate"),
  subject: t("table.subject"),
  senderRef: t("table.senderRef"),
  title: t("table.title"),
  type: t("table.type"),
  letterNo: t("table.letterNo"),
  resolutionNumber: t("table.resolutionNumber"),

  year: t("table.year"),
  badgeType: t("table.badgetype"),
  remarks: t("table.remarks"),
  actions: t("table.actions"),

  // ===== Form Fields =====
  sendDate: t("form.sendDate"),
  subject: t("form.subject"),
  senderReference: t("form.senderReference"),
  title: t("form.title"),
  resolutionType: t("form.resolutionType"),
  yadashtType: t("form.yadashtType"),
  letterNumber: t("form.letterNumber"),
  approvalYear: t("form.approvalYear"),
  resolutionNo: t("form.resolutionNumber"),
  yadashtNo: t("form.yadashtNumber"),
  remarks: t("form.remarks"),
  remarksPlaceholder: t("form.remarksPlaceholder"),
  required: t("form.required"),

  // ===== Actions =====
  view: t("actions.view"),
  edit: t("actions.edit"),
  delete: t("actions.delete"),
  save: t("actions.save"),
  saveChanges: t("actions.saveChanges"),
  cancel: t("actions.cancel"),
  close: t("actions.close"),
  saving: t("actions.saving"),
  mosawaba: t("actions.mosawaba"),
  yadasht: t("actions.yadasht"),
  all: t("actions.all"),
  newMusawaba: t("actions.newMosawaba"),
  newYadasht: t("actions.newYadasht"),

  // ===== Messages =====
  loadError: t("messages.loadError"),
  deleteSuccess: t("messages.deleteSuccess"),
  deleteFailed: t("messages.deleteFailed"),
  updateSuccess: t("messages.updateSuccess"),
  updateFailed: t("messages.updateFailed"),
  created: t("messages.created"),
  createFailed: t("messages.createFailed"),
  subjectRequired: t("messages.subjectRequired"),

  // ===== Delete Dialog =====
  confirmDelete: t("deleteDialog.confirmDelete"),
  deleteWarning: t("deleteDialog.deleteWarning"),
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

export default getShuraAaliResolutionTexts;
