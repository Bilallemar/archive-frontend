import { useEffect, useState } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import UserManagementPanel from "./components/Admin/UserManagementPanel";
import AddArchive from "./components/ArchiveManagement/Archive/AddArchive";
import ArchiveList from "./components/ArchiveManagement/Archive/ArchiveList";
import EditArchiveDialog from "./components/ArchiveManagement/Archive/EditArchiveDialog";
import AddNasharat from "./components/ArchiveManagement/Nasharat/AddNasharat";
import EditNasharatDialog from "./components/ArchiveManagement/Nasharat/EditNasharatDialog";
import NasharatList from "./components/ArchiveManagement/Nasharat/NasharatList";
import Admin from "./components/AuditLogs/Admin";
import AccessDenied from "./components/Auth/AccessDenied";
import ForgotPassword from "./components/Auth/ForgotPassword";
import Login from "./components/Auth/Login";
import OAuth2RedirectHandler from "./components/Auth/OAuth2RedirectHandler";
import ResetPassword from "./components/Auth/ResetPassword";
import Signup from "./components/Auth/Signup";
import UserProfile from "./components/Auth/UserProfile";
import ContactPage from "./components/contactPage/ContactPage";
import AddHazari from "./components/Hifziya/HifziyaHazari/AddHazari";
import EditHazariDialog from "./components/Hifziya/HifziyaHazari/EditHazariDialog";
import HazariList from "./components/Hifziya/HifziyaHazari/HazariList";
import AddHifziyaWaradaSadera from "./components/Hifziya/HifziyaWaradaSadera/AddHifziyaWaradaSadera";
import EditHifziyaWaradaSaderaDialog from "./components/Hifziya/HifziyaWaradaSadera/EditHifziyaWaradaSaderaDialog";
import HifziyaWaradaSaderaList from "./components/Hifziya/HifziyaWaradaSadera/HifziyaWaradaSaderaList";
import AddMinotMakatib from "./components/Hifziya/MinotMakatib/AddMinotMakatib";
import MinotMakatibList from "./components/Hifziya/MinotMakatib/MinotMakatibList";
import AddSawanih from "./components/Hifziya/Sawanih/AddSawanih";
import EditSawanihDialog from "./components/Hifziya/Sawanih/EditSawanihDialog";
import SawanihList from "./components/Hifziya/Sawanih/SawanihList";
import AddShuraAaliResolution from "./components/Hifziya/ShuraAaliResolution/AddShuraAaliResolution";
import EditShuraAaliResolutionDialog from "./components/Hifziya/ShuraAaliResolution/EditShuraAaliResolutionDialog";
import ShuraAaliResolutionList from "./components/Hifziya/ShuraAaliResolution/ShuraAaliResolutionList";
import LandingPage from "./components/LandingPage";
import MasterDataManagement from "./components/MasterData/MasterDataManagement";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AddMakhzanWaradaSadera from "./components/StorageManagement/MakhzanWaradaSadera/AddMakhzanWaradaSadera";
import EditMakhzanWaradaSaderaDialog from "./components/StorageManagement/MakhzanWaradaSadera/EditMakhzanWaradaSaderaDialog";
import MakhzanWaradaSaderaList from "./components/StorageManagement/MakhzanWaradaSadera/MakhzanWaradaSaderaList";
import AddMakzanAnnualReport from "./components/StorageManagement/MakzanAnnualReport/AddMakzanAnnualReport";
import EditMakzanAnnualReportDialog from "./components/StorageManagement/MakzanAnnualReport/EditMakzanAnnualReportDialog";
import MakzanAnnualReportList from "./components/StorageManagement/MakzanAnnualReport/MakzanAnnualReportList";
import AddMakzanReceipt from "./components/StorageManagement/MakzanReceipt/AddMakzanReceipt";
import EditReceiptDialog from "./components/StorageManagement/MakzanReceipt/EditReceiptDialog";
import MakzanReceiptList from "./components/StorageManagement/MakzanReceipt/MakzanReceiptList";
import AddMakzanSubmissionReport from "./components/StorageManagement/MakzanSubmissionReport/AddMakzanSubmissionReport";
import EditMakzanSubmissionReportDialog from "./components/StorageManagement/MakzanSubmissionReport/EditMakzanSubmissionReportDialog";
import MakzanSubmissionReportList from "./components/StorageManagement/MakzanSubmissionReport/MakzanSubmissionReportList";
import { createAppTheme } from "./theme";
import {
  initializeDirection,
  setDocumentDirection,
} from "./utils/languageUtils";
import { MANAGEMENTS } from "./utils/managementUtils";

import SidebarLayout from "./components/SidebarLayout";
import { useMyContext } from "./store/ContextApi";

const App = () => {
  const { i18n } = useTranslation();
  const { pathname } = useLocation();
  const { mode, token } = useMyContext();

  const [direction, setDirection] = useState("rtl");
  const [themeKey, setThemeKey] = useState(0);

  // Initialize direction on mount
  useEffect(() => {
    const { language, direction: dir } = initializeDirection();
    setDirection(dir);

    // Set i18n language if different
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }

    console.log("🚀 App initialized:", { language, direction: dir });
  }, []);

  // Update direction when language changes
  useEffect(() => {
    const newDirection = setDocumentDirection(i18n.language);
    setDirection(newDirection);
    setThemeKey((prev) => prev + 1); // Force theme recreation

    console.log("🔄 Language changed:", {
      language: i18n.language,
      direction: newDirection,
    });
  }, [i18n.language]);

  // Create theme with current direction
  const theme = createAppTheme(mode, direction);

  // Auth pages
  const authPages = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/oauth2/redirect",
  ];
  const isAuthPage = authPages.includes(pathname);

  if (isAuthPage || !token) {
    return (
      <ThemeProvider theme={theme} key={themeKey}>
        <CssBaseline />
        <Toaster position="bottom-center" reverseOrder={false} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme} key={themeKey}>
      <CssBaseline />
      <Toaster position="bottom-center" reverseOrder={false} />
      <SidebarLayout>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute requiresManagement={true}>
                <LandingPage />
              </ProtectedRoute>
            }
          />

          {/* Hifziya Routes */}
          <Route
            path="/sawanih/:id"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.HIFZIYA}>
                <EditSawanihDialog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sawanih/add-sawanih"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.HIFZIYA}>
                <AddSawanih />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sawanih"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.HIFZIYA}>
                <SawanihList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hifziya-warada-sadera/:id"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.HIFZIYA}>
                <EditHifziyaWaradaSaderaDialog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hifziya-warada-sadera/add-hifziya-warada-sadera"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.HIFZIYA}>
                <AddHifziyaWaradaSadera />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hifziya-warada-sadera"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.HIFZIYA}>
                <HifziyaWaradaSaderaList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hifziya-hazari/:id"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.HIFZIYA}>
                <EditHazariDialog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hifziya-hazari/add-hazari"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.HIFZIYA}>
                <AddHazari />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hifziya-hazari"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.HIFZIYA}>
                <HazariList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/minot-makatib"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.HIFZIYA}>
                <MinotMakatibList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/minot-makatib/add"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.HIFZIYA}>
                <AddMinotMakatib />
              </ProtectedRoute>
            }
          />
          {/* Archive Routes */}
          <Route
            path="/archive"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.ARCHIVE}>
                <ArchiveList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/archive/add"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.ARCHIVE}>
                <AddArchive />
              </ProtectedRoute>
            }
          />
          <Route
            path="/archive/:id"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.ARCHIVE}>
                <EditArchiveDialog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nasharat"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.ARCHIVE}>
                <NasharatList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nasharat/add"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.ARCHIVE}>
                <AddNasharat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nasharat/:id"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.ARCHIVE}>
                <EditNasharatDialog />
              </ProtectedRoute>
            }
          />
          {/* Makhzan Routes */}
          <Route
            path="/annual-reports-info"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.MAKHZAN}>
                <MakzanSubmissionReportList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/annual-reports-info/add"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.MAKHZAN}>
                <AddMakzanSubmissionReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/annual-reports-info/:id"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.MAKHZAN}>
                <EditMakzanSubmissionReportDialog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/makzan-receipts"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.MAKHZAN}>
                <MakzanReceiptList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/makzan-receipts/add"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.MAKHZAN}>
                <AddMakzanReceipt />
              </ProtectedRoute>
            }
          />
          <Route
            path="/makzan-receipts/:id"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.MAKHZAN}>
                <EditReceiptDialog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/makzan-annual-reports"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.MAKHZAN}>
                <MakzanAnnualReportList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/makzan-annual-reports/add"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.MAKHZAN}>
                <AddMakzanAnnualReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/makzan-annual-reports/:id"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.MAKHZAN}>
                <EditMakzanAnnualReportDialog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/makhzan-warada-sadera"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.MAKHZAN}>
                <MakhzanWaradaSaderaList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/makhzan-warada-sadera/add"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.MAKHZAN}>
                <AddMakhzanWaradaSadera />
              </ProtectedRoute>
            }
          />
          <Route
            path="/makhzan-warada-sadera/:id"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.MAKHZAN}>
                <EditMakhzanWaradaSaderaDialog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shura-aali-resolutions"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.HIFZIYA}>
                <ShuraAaliResolutionList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shura-aali-resolutions/add"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.HIFZIYA}>
                <AddShuraAaliResolution />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shura-aali-resolutions/:id"
            element={
              <ProtectedRoute requiredManagementId={MANAGEMENTS.HIFZIYA}>
                <EditShuraAaliResolutionDialog />
              </ProtectedRoute>
            }
          />
          {/* Admin Routes */}
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute adminPage={true}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/user-management"
            element={
              <ProtectedRoute adminPage={true}>
                <UserManagementPanel />
              </ProtectedRoute>
            }
          />

          {/* Other Routes */}
          <Route path="/master-data" element={<MasterDataManagement />} />
          <Route path="/contact" element={<ContactPage />} />
          {/* <Route path="/about" element={<AboutPage />} /> */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SidebarLayout>
    </ThemeProvider>
  );
};

const AppWrapper = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

export default AppWrapper;
