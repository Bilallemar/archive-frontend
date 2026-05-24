import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getStoredLanguage, setDocumentDirection } from "./utils/languageUtils";

// ================== Pashto ==================
import psArchive from "./locales/ps/Archive/archive.json";
import psUserDetails from "./locales/ps/UserDetails.json";
import psUserProfile from "./locales/ps/UserProfile.json";
import psForgotPassword from "./locales/ps/forgotPassword.json";
import psLandingPage from "./locales/ps/landingPage.json";
import psLogin from "./locales/ps/login.json";
import psNavbar from "./locales/ps/navbar.json";
import psUserManagement from "./locales/ps/userManagement.json";
import psUsers from "./locales/ps/users.json";
// import psArchiveList from "./locales/ps/Archive/archivelist.json";
// import psEditArchiveDialog from "./locales/ps/Archive/EditArchiveDialog.json"; // ✅ new
// import psViewArchive from "./locales/ps/Archive/ViewArchive.json";
import psAuditDetails from "./locales/ps/AdminAuditLogsDetails.json";
import psNasharat from "./locales/ps/Archive/nasharat.json";
import psCabinetManagement from "./locales/ps/Cabinetmanagement.json";
import psCreateUserDialog from "./locales/ps/CreateUserDialog.json";
import psAddHazari from "./locales/ps/Hifziya/HifziyaHazari/AddHazari.json";
import psSawanih from "./locales/ps/Hifziya/Sawanih/sawanih.json";
import psShuraAaliResolutions from "./locales/ps/Hifziya/ShuraAaliResolution.json";
import psHifziyaWaradaSadera from "./locales/ps/Hifziya/WaradaSadera/waradaSaderaList.json";
import psLocationManagement from "./locales/ps/LocationManagement.json";
import psMasterData from "./locales/ps/MasterDataManagement.json";
import psSidebarLayout from "./locales/ps/SidebarLayout.json";
import psMakzanReceipt from "./locales/ps/Storage/MakzanReceipt/MakzanReceipt.json";
import psMakzanSubmissionReport from "./locales/ps/Storage/MakzanSubmissionReport/MakzanSubmissionReport.json";
import psMakhzanWaradaSadera from "./locales/ps/Storage/MakzanWaradaSadera/MakhzanWaradaSadera.json";
import psBreadcrumbs from "./locales/ps/breadcrumbs.json";
import psManagementUtils from "./locales/ps/managementUtils.json";
import psMakhzanAnnualReport from "./locales/ps/Storage/MakzanAnnualReport/MakzanAnnualReport.json";
import psAdminAuditLogs from "./locales/ps/AdminAuditLogs.json";
import psMinotMakatib from "./locales/ps/Hifziya/MinotMakatib/MinotMakatib.json";

// ================== Dari ==================
import faAdminAuditLogs from "./locales/fa/AdminAuditLogs.json";
import faArchive from "./locales/fa/Archive/archive.json";
// import faArchiveList from "./locales/fa/archivelist.json";
// import faEditArchiveDialog from "./locales/fa/EditArchiveDialog.json"; // ✅ new
// import faViewArchive from "./locales/fa/ViewArchive.json";
import faAuditDetails from "./locales/fa/AdminAuditLogsDetails.json";
import faNasharat from "./locales/fa/Archive/nasharat.json";
import faCabinetManagement from "./locales/fa/Cabinetmanagement.json";
import faCreateUserDialog from "./locales/fa/CreateUserDialog.json";
import faAddHazari from "./locales/fa/Hifziya/HifziyaHazari/addHazari.json";
import faSawanih from "./locales/fa/Hifziya/Sawanih/sawanih.json";
import faShuraAaliResolutions from "./locales/fa/Hifziya/ShuraAaliResolution.json";
import faHifziyaWaradaSadera from "./locales/fa/Hifziya/WaradaSadera/waradaSaderaList.json";
import faLocationManagement from "./locales/fa/LocationManagement.json";
import faMasterData from "./locales/fa/MasterDataManagement.json";
import faSidebarLayout from "./locales/fa/SidebarLayout.json";
import faMakhzanAnnualReport from "./locales/fa/Storage/MakzanAnnualReport/MakzanAnnualReport.json";
import faMakzanReceipt from "./locales/fa/Storage/MakzanReceipt/MakzanReceipt.json";
import faMakzanSubmissionReport from "./locales/fa/Storage/MakzanSubmissionReport/MakzanSubmissionReport.json";
import faMakhzanWaradaSadera from "./locales/fa/Storage/MakzanWaradaSadera/MakhzanWaradaSadera.json";
import faUserDetails from "./locales/fa/UserDetails.json";
import faUserProfile from "./locales/fa/UserProfile.json";
import faBreadcrumbs from "./locales/fa/breadcrumbs.json";
import faForgotPassword from "./locales/fa/forgotPassword.json";
import faLandingPage from "./locales/fa/landingPage.json";
import faLogin from "./locales/fa/login.json";
import faManagementUtils from "./locales/fa/managementUtils.json";
import faNavbar from "./locales/fa/navbar.json";
import faUserManagement from "./locales/fa/userManagement.json";
import faUsers from "./locales/fa/users.json";
import faMinotMakatib from "./locales/fa/Hifziya/MinotMakatib/MinotMakatib.json";
// ================== English ==================
import enAdminAuditLogs from "./locales/en/AdminAuditLogs.json";
import enArchive from "./locales/en/Archive/archive.json";
// import enArchiveList from "./locales/en/archivelist.json";
// import enEditArchiveDialog from "./locales/en/EditArchiveDialog.json"; // ✅ new
// import enViewArchive from "./locales/en/ViewArchive.json";
import enAuditDetails from "./locales/en/AdminAuditLogsDetails.json";
import enNasharat from "./locales/en/Archive/nasharat.json";
import enCabinetManagement from "./locales/en/Cabinetmanagement.json";
import enCreateUserDialog from "./locales/en/CreateUserDialog.json";
import enAddHazari from "./locales/en/Hifziya/HifziyaHazari/addHazari.json";
import enSawanih from "./locales/en/Hifziya/Sawanih/sawanih.json";
import enShuraAaliResolutions from "./locales/en/Hifziya/ShuraAaliResolution.json";
import enHifziyaWaradaSadera from "./locales/en/Hifziya/WaradaSadera/waradaSaderaList.json";
import enLocationManagement from "./locales/en/LocationManagement.json";
import enMasterData from "./locales/en/MasterDataManagement.json";
import enSidebarLayout from "./locales/en/SidebarLayout.json";
import enMakhzanAnnualReport from "./locales/en/Storage/MakzanAnnualReport/MakzanAnnualReport.json";
import enMakzanReceipt from "./locales/en/Storage/MakzanReceipt/MakzanReceipt.json";
import enMakzanSubmissionReport from "./locales/en/Storage/MakzanSubmissionReport/MakzanSubmissionReport.json";
import enMakhzanWaradaSadera from "./locales/en/Storage/MakzanWaradaSadera/MakhzanWaradaSadera.json";
import enUserDetails from "./locales/en/UserDetails.json";
import enUserProfile from "./locales/en/UserProfile.json";
import enBreadcrumbs from "./locales/en/breadcrumbs.json";
import enForgotPassword from "./locales/en/forgotPassword.json";
import enLandingPage from "./locales/en/landingPage.json";
import enLogin from "./locales/en/login.json";
import enManagementUtils from "./locales/en/managementUtils.json";
import enNavbar from "./locales/en/navbar.json";
import enUserManagement from "./locales/en/userManagement.json";
import enUsers from "./locales/en/users.json";
import enMinotMakatib from "./locales/en/Hifziya/MinotMakatib/MinotMakatib.json";

console.log("psAdminAuditLogs imported?", !!psAdminAuditLogs);
console.log(
  "First few keys in psAdminAuditLogs:",
  Object.keys(psAdminAuditLogs).slice(0, 5),
);
const initialLanguage = getStoredLanguage();

i18n.use(initReactI18next).init({
  resources: {
    ps: {
      login: psLogin,
      forgotPassword: psForgotPassword,
      userManagement: psUserManagement,
      users: psUsers,
      userDetails: psUserDetails,
      userProfile: psUserProfile,
      navbar: psNavbar,
      SidebarLayout: psSidebarLayout,
      landingPage: psLandingPage, // ✅ added
      archive: psArchive,
      MasterDataManagement: psMasterData,
      CabinetManagement: psCabinetManagement,
      managementUtils: psManagementUtils,
      addHazari: psAddHazari,
      hifziyaWaradaSadera: psHifziyaWaradaSadera,
      sawanih: psSawanih,
      makzanReceipt: psMakzanReceipt,
      makzanSubmissionReport: psMakzanSubmissionReport,
      makzanAnnualReport: psMakhzanAnnualReport,
      makhzanWaradaSadera: psMakhzanWaradaSadera,
      breadcrumbs: psBreadcrumbs,
      shuraAali: psShuraAaliResolutions,
      adminAuditLogs: psAdminAuditLogs,
      auditLogsDetails: psAuditDetails,
      locationManagement: psLocationManagement,
      createUserDialog: psCreateUserDialog,
      nasharat: psNasharat,
      minotMakatib: psMinotMakatib,
    },

    fa: {
      login: faLogin,
      forgotPassword: faForgotPassword,
      userManagement: faUserManagement,
      users: faUsers,
      userDetails: faUserDetails,
      userProfile: faUserProfile,
      navbar: faNavbar,
      SidebarLayout: faSidebarLayout,
      landingPage: faLandingPage,
      archive: faArchive,
      MasterDataManagement: faMasterData,
      CabinetManagement: faCabinetManagement,
      managementUtils: faManagementUtils,
      addHazari: faAddHazari,
      hifziyaWaradaSadera: faHifziyaWaradaSadera,
      sawanih: faSawanih,
      makzanReceipt: faMakzanReceipt,
      makzanSubmissionReport: faMakzanSubmissionReport,
      makzanAnnualReport: faMakhzanAnnualReport,
      makhzanWaradaSadera: faMakhzanWaradaSadera,
      breadcrumbs: faBreadcrumbs,
      shuraAali: faShuraAaliResolutions,
      adminAuditLogs: faAdminAuditLogs,
      auditLogsDetails: faAuditDetails,
      locationManagement: faLocationManagement,
      createUserDialog: faCreateUserDialog,
      nasharat: faNasharat,
      minotMakatib: faMinotMakatib,
    },

    en: {
      login: enLogin,
      forgotPassword: enForgotPassword,
      userManagement: enUserManagement,
      users: enUsers,
      userDetails: enUserDetails,
      userProfile: enUserProfile,
      navbar: enNavbar,
      SidebarLayout: enSidebarLayout,
      landingPage: enLandingPage,
      archive: enArchive,
      MasterDataManagement: enMasterData,
      CabinetManagement: enCabinetManagement,
      managementUtils: enManagementUtils,
      addHazari: enAddHazari,
      hifziyaWaradaSadera: enHifziyaWaradaSadera,
      sawanih: enSawanih,
      makzanReceipt: enMakzanReceipt,
      makzanSubmissionReport: enMakzanSubmissionReport,
      makzanAnnualReport: enMakhzanAnnualReport,
      makhzanWaradaSadera: enMakhzanWaradaSadera,
      breadcrumbs: enBreadcrumbs,
      shuraAali: enShuraAaliResolutions,
      adminAuditLogs: enAdminAuditLogs,
      auditLogsDetails: enAuditDetails,
      locationManagement: enLocationManagement,
      createUserDialog: enCreateUserDialog,
      nasharat: enNasharat,
      minotMakatib: enMinotMakatib,
    },
  },

  lng: "ps",
  fallbackLng: "ps",
  supportedLngs: ["ps", "fa", "en"],

  interpolation: {
    escapeValue: false,
  },

  ns: [
    "login",
    "forgotPassword",
    "userManagement",
    "users",
    "userDetails",
    "userProfile",
    "navbar",
    "SidebarLayout",
    "landingPage",
    "archive",
    "managementUtils",
    "addHazari",
    "hifziyaWaradaSadera",
    "sawanih",
    "makzanReceipt",
    "makzanSubmissionReport",
    "makzanAnnualReport",
    "makhzanWaradaSadera",
    "breadcrumbs",
    "shuraAali",
    "MasterDataManagement",
    "CabinetManagement",
    "adminAuditLogs",
    "auditLogsDetails",
    "locationManagement",
    "createUserDialog",
    "nasharat",
    "minotMakatib",
  ],

  defaultNS: "login",
});
i18n.on("languageChanged", (lng) => {
  setDocumentDirection(lng);
});

setDocumentDirection(initialLanguage);

export default i18n;
