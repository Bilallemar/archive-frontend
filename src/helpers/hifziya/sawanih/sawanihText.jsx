import { all } from "axios";

const getSawanihTexts = (t) => ({
  // ===== Page Titles =====
  title: t("title"),
  newRecord: t("newRecord"),
  editRecord: t("editRecord"),
  newSawanih: t("newSawanih"),
  newIsteqdam: t("newIsteqdam"),
  all: t("all"),
  sawanih: t("sawanih"),
  isteqdam: t("isteqdam"),
  
  // ===== Fields / Columns =====
  name: t("name"),
  fatherName: t("fatherName"),
  qaidWarida: t("qaidWarida"),
  incommingDate: t("incommingDate"), // که په سیستم کې دواړه کارېږي
  outgoingDate: t("outgoingDate"),
  organization: t("organization"),
  org: t("org"),
  pageQuantity: t("pageQuantity"),
  description: t("description"),
  recordStatus: t("recordStatus"),
  // ===== Actions =====
  actions: t("actions"),
  view: t("view"),
  edit: t("edit"),
  delete: t("delete"),
  cancel: t("cancel"),
  close: t("close"),
  save: t("save"),
  saving: t("saving"),
  back: t("back"),

  // ===== Delete Dialog =====
  deleteDialogTitle: t("deleteDialogTitle"),
  deleteDialogText: t("deleteDialogText"),
  deleteSuccess: t("deleteSuccess"),
  deleteError: t("deleteError"),


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
  // ===== Filters & Search =====
  search: t("search"),
  fieldOrg: t("fieldOrg"),

  // ===== Pagination =====
  rowsPerPage: t("rowsPerPage"),

  // ===== States / Messages =====
  loading: t("loading"),
  loadError: t("loadError"),
  noData: t("noData"),
  notAvailable: t("notAvailable"),
  noArchiveSelected: t("noArchiveSelected"),
  filter: t("filter"),
search: t("search"),



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

export default getSawanihTexts;
