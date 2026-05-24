// utils/managementUtils.js
import i18n from "../i18n";

// =========================
// MANAGEMENT CONSTANTS
// =========================

// Management IDs - IMPORTANT: Match with your database IDs
export const MANAGEMENTS = {
  ARCHIVE: 1,
  HIFZIYA: 2,
  MAKHZAN: 3,
};

// =========================
// LOCALIZED MANAGEMENT NAMES
// =========================

export const getManagementNameById = (id) => {
  const names = {
    1: i18n.t("managementUtils:managementNames.archive"),
    2: i18n.t("managementUtils:managementNames.hifziya"),
    3: i18n.t("managementUtils:managementNames.makhzan"),
  };
  return names[id] || "No Management";
};

// =========================
// LOCAL STORAGE HELPERS
// =========================

export const getUserManagement = () => {
  try {
    const data = localStorage.getItem("USER_MANAGEMENT");
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting user management:", error);
    return null;
  }
};

export const setUserManagement = (managementData) => {
  try {
    localStorage.setItem("USER_MANAGEMENT", JSON.stringify(managementData));
  } catch (error) {
    console.error("Error setting user management:", error);
  }
};

export const clearUserManagement = () => {
  try {
    localStorage.removeItem("USER_MANAGEMENT");
  } catch (error) {
    console.error("Error clearing user management:", error);
  }
};

// =========================
// MANAGEMENT GETTERS
// =========================

export const getManagementId = () => {
  const management = getUserManagement();
  return management?.managementId || null;
};

export const getManagementName = () => {
  const management = getUserManagement();
  return (
    management?.managementName ||
    getManagementNameById(management?.managementId) ||
    "No Management"
  );
};

export const hasManagement = () => {
  return getUserManagement() !== null;
};

export const isUserInManagement = (managementId) => {
  const userManagementId = getManagementId();
  return userManagementId === managementId;
};

// =========================
// ADMIN CHECK
// =========================

export const isAdmin = () => {
  try {
    const user = JSON.parse(localStorage.getItem("USER") || "{}");
    return user.roles?.includes("ROLE_ADMIN") || false;
  } catch (error) {
    return false;
  }
};

// =========================
// NAVIGATION BASED ON MANAGEMENT
// =========================

export const getNavigationItems = () => {
  const managementId = getManagementId();
  const admin = isAdmin();

  const baseItems = [
    {
      path: "/",
      label: i18n.t("managementUtils:dashboard"),
      translationKey: "dashboard",
    },
  ];

  // Admin sees everything
  if (admin) {
    return [
      ...baseItems,
      {
        path: "/hifziya-hazari",
        label: i18n.t("managementUtils:bookAttendance"),
        management: MANAGEMENTS.HIFZIYA,
        translationKey: "bookAttendance",
      },
      {
        path: "/hifziya-warada-sadera",
        label: i18n.t("managementUtils:incomingOutgoing"),
        management: MANAGEMENTS.HIFZIYA,
        translationKey: "incomingOutgoing",
      },
      {
        path: "/sawanih",
        label: i18n.t("managementUtils:incidents"),
        management: MANAGEMENTS.HIFZIYA,
        translationKey: "incidents",
      },
      {
        path: "/minot-makatib",
        label: i18n.t("managementUtils:minotMakatib", "مینوټ مکاتب"),
        management: MANAGEMENTS.HIFZIYA,
        translationKey: "minotMakatib",
      },
      {
        path: "/shura-aali-resolutions",
        label: i18n.t("managementUtils:shuraAaliResolutions"),
        management: MANAGEMENTS.HIFZIYA,
        translationKey: "shuraAaliResolutions",
      },

      {
        path: "/archive",
        label: i18n.t("managementUtils:archive"),
        management: MANAGEMENTS.ARCHIVE,
        translationKey: "archive",
      },
      {
        path: "/nasharat",
        label: i18n.t("managementUtils:nasharat"),
        management: MANAGEMENTS.ARCHIVE,
        translationKey: "nasharat",
      },
      {
        path: "/makzan-annual-reports",
        label: i18n.t("managementUtils:annualReports"),
        management: MANAGEMENTS.MAKHZAN,
        translationKey: "annualReports",
      },
      {
        path: "/makzan-receipts",
        label: i18n.t("managementUtils:receipts"),
        management: MANAGEMENTS.MAKHZAN,
        translationKey: "receipts",
      },
      {
        path: "/annual-reports-info",
        label: i18n.t("managementUtils:reportInformation"),
        management: MANAGEMENTS.MAKHZAN,
        translationKey: "reportInformation",
      },
      {
        path: "/makhzan-warada-sadera",
        label: i18n.t("managementUtils:makhzanwaradaSadera"),
        management: MANAGEMENTS.MAKHZAN,
        translationKey: "makhzanwaradaSadera",
      },
      {
        path: "/master-data",
        label: i18n.t("managementUtils:masterData"),
        translationKey: "masterData",
      },
    ];
  }

  // Regular user sees only their management section
  const allItems = {
    [MANAGEMENTS.HIFZIYA]: [
      ...baseItems,
      {
        path: "/hifziya-hazari",
        label: i18n.t("managementUtils:bookAttendance"),
        translationKey: "bookAttendance",
      },
      {
        path: "/hifziya-warada-sadera",
        label: i18n.t("managementUtils:incomingOutgoing"),
        translationKey: "incomingOutgoing",
      },
      {
        path: "/sawanih",
        label: i18n.t("managementUtils:incidents"),
        translationKey: "incidents",
      },
      {
        path: "/minot-makatib",
        label: i18n.t("managementUtils:minotMakatib"),
        translationKey: "minotMakatib",
      },

      {
        path: "/shura-aali-resolutions",
        label: i18n.t("managementUtils:shuraAaliResolutions"),
        translationKey: "shuraAaliResolutions",
      },
    ],
    [MANAGEMENTS.ARCHIVE]: [
      ...baseItems,
      {
        path: "/archive",
        label: i18n.t("managementUtils:archive"),
        translationKey: "archive",
      },
      {
        path: "/nasharat",
        label: i18n.t("managementUtils:nasharat"),
        translationKey: "nasharat",
      },
    ],
    [MANAGEMENTS.MAKHZAN]: [
      ...baseItems,
      {
        path: "/makzan-annual-reports",
        label: i18n.t("managementUtils:annualReports"),
        translationKey: "annualReports",
      },
      {
        path: "/makzan-receipts",
        label: i18n.t("managementUtils:receipts"),
        translationKey: "receipts",
      },
      {
        path: "/annual-reports-info",
        label: i18n.t("managementUtils:reportInformation"),
        translationKey: "reportInformation",
      },
      {
        path: "/makhzan-warada-sadera",
        label: i18n.t("managementUtils:makhzanwaradaSadera"),
        translationKey: "makhzanwaradaSadera",
      },
    ],
  };

  return allItems[managementId] || baseItems;
};

// =========================
// DASHBOARD BASED ON MANAGEMENT
// =========================

export const getDashboardConfig = () => {
  const managementId = getManagementId();
  const userIsAdmin = isAdmin();

  if (userIsAdmin) {
    return {
      showAllStats: true,
      title: i18n.t("managementUtils:dashboard"),
      widgets: ["all"],
      allowedManagements: [
        MANAGEMENTS.ARCHIVE,
        MANAGEMENTS.HIFZIYA,
        MANAGEMENTS.MAKHZAN,
      ],
    };
  }

  const configs = {
    [MANAGEMENTS.ARCHIVE]: {
      showAllStats: false,
      title: i18n.t("managementUtils:archiveManagement"),
      widgets: ["archives", "receipts"],
    },
    [MANAGEMENTS.HIFZIYA]: {
      showAllStats: false,
      title: i18n.t("managementUtils:hifziyaManagement"),
      widgets: ["sawanih", "hazari"],
    },
    [MANAGEMENTS.MAKHZAN]: {
      showAllStats: false,
      title: i18n.t("managementUtils:makhzanManagement"),
      widgets: ["receipts", "reports"],
    },
  };

  return (
    configs[managementId] || {
      showAllStats: false,
      title: i18n.t("managementUtils:dashboard"),
      widgets: [],
    }
  );
};

// =========================
// ROUTE ACCESS CONTROL
// =========================

export const canAccessRoute = (routePath, requiredManagementId = null) => {
  const admin = isAdmin();

  // Admins can access everything
  if (admin) return true;

  // If no particular management required, allow access
  if (!requiredManagementId) return true;

  // Else check if user belongs to required management
  const userManagementId = getManagementId();
  return userManagementId === requiredManagementId;
};
