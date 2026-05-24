const getBreadcrumbNameMap = (t) => ({
  // Archive Management - Show parent first
  "/archive": t("archive"),
  "/archive/add": t("addArchive"),
  "/archive/:id": t("editArchive"),

  // Nasharat
 "/nasharat": t("nasharat"),
  "/nasharat/add": t("addNasharat"),
  "/nasharat/:id": t("editNasharat"),
  // Sawanih
  "/sawanih": t("sawanih"),
  "/sawanih/add-sawanih": t("addSawanih"),
  "/sawanih/:id": t("editSawanih"),

  // Hifziya Hazari
  "/hifziya-hazari": t("hifziyaHazari"),
  "/hifziya-hazari/add-hazari": t("addHazari"),
  "/hifziya-hazari/:id": t("editHazari"),

  // Shura Aali Resolutions
  "/shura-aali-resolutions": t("shuraAaliResolutions"),
  "/shura-aali-resolutions/add-shura-aali-resolution": t(
    "addShuraAaliResolution",
  ),
  "/shura-aali-resolutions/:id": t("editShuraAaliResolution"),

  // Hifziya Warada Sadera
  "/hifziya-warada-sadera": t("hifziyaWaradaSadera"),
  "/hifziya-warada-sadera/add-hifziya-warada-sadera": t(
    "addHifziyaWaradaSadera",
  ),
  "/hifziya-warada-sadera/:id": t("editHifziyaWaradaSadera"),
  // Minot Makatib
 "/minot-makatib": t("minotMakatib"),
  "/minot-makatib/add": t("addMinotMakatib"),
  "/minot-makatib/:id": t("editMinotMakatib"),
  // Annual Reports Info
  "/annual-reports-info": t("annualReportsInfo"),
  "/annual-reports-info/add": t("addAnnualReportInfo"),
  "/annual-reports-info/:id": t("editAnnualReportInfo"),

  // Makzan Receipts
  "/makzan-receipts": t("makzanReceipts"),
  "/makzan-receipts/add": t("addMakzanReceipt"),
  "/makzan-receipts/:id": t("editMakzanReceipt"),

  // Makzan Annual Reports
  "/makzan-annual-reports": t("makzanAnnualReports"),
  "/makzan-annual-reports/add": t("addMakzanAnnualReport"),
  "/makzan-annual-reports/:id": t("editMakzanAnnualReport"),

  // Makhzan Warada Sadera
  "/makhzan-warada-sadera": t("makhzanWaradaSadera"),
  "/makhzan-warada-sadera/add": t("addMakhzanWaradaSadera"),
  "/makhzan-warada-sadera/:id": t("editMakhzanWaradaSadera"),

  // Admin & Settings
  "/admin": t("admin"),
  "/admin/user-management": t("userManagement"),
  "/master-data": t("masterData"),
  "/profile": t("profile"),
});

export default getBreadcrumbNameMap;
