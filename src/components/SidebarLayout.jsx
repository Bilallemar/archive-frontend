import { FormControl, MenuItem, Select } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  AppBar,
  Avatar,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  Menu,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  AdminPanelSettings,
  Archive,
  ExpandLess,
  ExpandMore,
  Folder,
  FolderSpecial,
  Home,
  Logout,
  Menu as MenuIcon,
  Person,
  Settings,
} from "@mui/icons-material";

import { useLocation, useNavigate } from "react-router-dom";
import { getSidebarTexts } from "../helpers/SidebarLayoutTexts";
import api from "../services/api";
import { useMyContext } from "../store/ContextApi";
import {
  clearUserManagement,
  getNavigationItems,
} from "../utils/managementUtils";

const drawerWidth = 270;

// ── Design tokens ───────────────────────────────────────────────
const SB_BG = "#ffffff";
const SB_TEXT = "#1a2236";
const SB_MUTED = "#8a96a3";
const SB_DIVIDER = "rgba(0,0,0,0.08)";
const SB_HOVER = "rgba(0,0,0,0.04)";
const SB_ACTIVE_BG = "rgba(74,144,217,0.12)";
const SB_ACTIVE_DOT = "#4A90D9";

export default function SidebarLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [imageError, setImageError] = useState(false);

  const { t, i18n } = useTranslation("SidebarLayout");
  const text = getSidebarTexts(t);
  const isRTL = ["ps", "fa", "ar"].includes(i18n.language);

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { currentUser, isAdmin, setToken, setCurrentUser, setIsAdmin } =
    useMyContext();

  const navigationItems = getNavigationItems();

  // ── Build grouped nav ─────────────────────────────────────────
  const groupedNav = useMemo(() => {
    const g = {
      dashboard: [],
      archive: [],
      hifziya: [],
      makzan: [],
      settings: [],
    };

    navigationItems.forEach((item) => {
      if (item.path === "/") g.dashboard.push(item);
      else if (item.path.includes("archive") || item.path.includes("nasharat"))
        g.archive.push(item);
      else if (
        item.path.includes("sawanih") ||
        item.path === "/shura-aali-resolutions" ||
        item.path.includes("hifziya") ||
        item.path.includes("minot-makatib")
      )
        g.hifziya.push(item);
      else if (
        item.path.includes("makzan") ||
        item.path.includes("annual-reports") ||
        item.path === "/makhzan-warada-sadera"
      )
        g.makzan.push(item);
      else if (item.path.includes("master-data")) g.settings.push(item);
    });

    const result = [
      {
        group: "dashboard",
        label: text.dashboard || "دشبورد",
        items: g.dashboard,
        icon: <Home sx={{ fontSize: 18 }} />,
        color: "#4A90D9",
      },
    ];
    if (g.archive.length)
      result.push({
        group: "archive",
        label: text.archive || "آرشیف مدیریت",
        items: g.archive,
        icon: <Archive sx={{ fontSize: 18 }} />,
        color: "#6C63FF",
      });
    if (g.hifziya.length)
      result.push({
        group: "hifziya",
        label: text.hifziya || "حفظیه مدیریت",
        items: g.hifziya,
        icon: <FolderSpecial sx={{ fontSize: 18 }} />,
        color: "#FFAB00",
      });
    if (g.makzan.length)
      result.push({
        group: "makzan",
        label: text.makzan || "مخزن مدیریت",
        items: g.makzan,
        icon: <Folder sx={{ fontSize: 18 }} />,
        color: "#FF5630",
      });
    if (g.settings.length)
      result.push({
        group: "settings",
        label: text.settings || "تنظیمات",
        items: g.settings,
        icon: <Settings sx={{ fontSize: 18 }} />,
        color: "#10B981",
      });
    return result;
  }, [navigationItems, isAdmin, text]);

  // ── Helpers ───────────────────────────────────────────────────
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get("/auth/profile");
      setUserProfile(res.data);
      setImageError(false);
    } catch (e) {
      console.error(e);
    }
  };

  const getProfileImageUrl = () => {
    if (!userProfile?.profileImage || imageError) return null;
    try {
      const p = userProfile.profileImage.startsWith("/")
        ? userProfile.profileImage.slice(1)
        : userProfile.profileImage;
      return `${(import.meta.env.VITE_API_URL || "http://localhost:8081").replace(/\/$/, "")}/${p}`;
    } catch {
      return null;
    }
  };

  const userAvatar =
    getProfileImageUrl() ??
    currentUser?.profileImage ??
    currentUser?.imageUrl ??
    currentUser?.avatar ??
    null;
  const userName =
    userProfile?.userName ||
    currentUser?.name ||
    currentUser?.username ||
    text.user ||
    "User";
  const userEmail = userProfile?.email || currentUser?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    clearUserManagement();
    setToken(null);
    setCurrentUser(null);
    setIsAdmin(false);
    setUserProfile(null);
    navigate("/login");
  };

  // ── Reusable icon box ─────────────────────────────────────────
  const IconBox = ({ color, icon }) => (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: "8px",
        bgcolor: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
  );

  // ── Drawer content ────────────────────────────────────────────
  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: SB_BG,
        direction: isRTL ? "rtl" : "ltr",
      }}
    >
      {/* Logo */}
      <Box
        onClick={() => navigate("/")}
        sx={{
          px: 2,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: `1px solid ${SB_DIVIDER}`,
          cursor: "pointer",
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "10px",
            background: "linear-gradient(135deg,#4A90D9,#2c6fad)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.3rem",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(74,144,217,0.35)",
          }}
        >
          {text.logo || "⚖️"}
        </Box>
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "0.95rem",
              color: SB_TEXT,
              lineHeight: 1.2,
            }}
          >
            {text.appName}
          </Typography>
          <Typography sx={{ fontSize: "0.7rem", color: SB_MUTED }}>
            {text.appSubTitle}
          </Typography>
        </Box>
      </Box>

      {/* Navigation list */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 1.5 }}>
        <List sx={{ px: 1.5 }} disablePadding>
          {groupedNav.map((group) => (
            <React.Fragment key={group.group}>
              {/* ── Dashboard (no collapse) ── */}
              {group.group === "dashboard" ? (
                <ListItemButton
                  onClick={() => {
                    navigate("/");
                    if (isMobile) setMobileOpen(false);
                  }}
                  sx={{
                    px: 1.5,
                    py: 1,
                    mb: 0.3,
                    borderRadius: "8px",
                    bgcolor: pathname === "/" ? SB_ACTIVE_BG : "transparent",
                    "&:hover": { bgcolor: SB_HOVER },
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    direction: isRTL ? "rtl" : "ltr",
                  }}
                >
                  <IconBox color={group.color} icon={group.icon} />
                  <Typography
                    sx={{
                      flex: 1,
                      fontSize: "0.88rem",
                      textAlign: isRTL ? "right" : "left",
                      fontWeight: pathname === "/" ? 700 : 500,
                      color: pathname === "/" ? SB_TEXT : SB_TEXT,
                    }}
                  >
                    {group.label}
                  </Typography>
                </ListItemButton>
              ) : (
                /* ── Collapsible group ── */
                <>
                  {/* Group header */}
                  <ListItemButton
                    onClick={() =>
                      setOpenMenus((p) => ({
                        ...p,
                        [group.group]: !p[group.group],
                      }))
                    }
                    sx={{
                      px: 1.5,
                      py: 1,
                      mb: 0.3,
                      borderRadius: "8px",
                      bgcolor: openMenus[group.group]
                        ? "rgba(255,255,255,0.06)"
                        : "transparent",
                      "&:hover": { bgcolor: SB_HOVER },
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      direction: isRTL ? "rtl" : "ltr",
                    }}
                  >
                    {/* Icon box — right side, next to text */}
                    <IconBox color={group.color} icon={group.icon} />

                    {/* Label — right next to icon */}
                    <Typography
                      sx={{
                        fontSize: "0.88rem",
                        textAlign: isRTL ? "right" : "left",
                        fontWeight: openMenus[group.group] ? 700 : 500,
                        color: openMenus[group.group] ? SB_TEXT : SB_TEXT,
                      }}
                    >
                      {group.label}
                    </Typography>

                    {/* Spacer pushes chevron to far left */}
                    <Box sx={{ flex: 1 }} />

                    {/* Chevron — far left */}
                    <Box sx={{ color: SB_MUTED, display: "flex" }}>
                      {openMenus[group.group] ? (
                        <ExpandLess sx={{ fontSize: 17 }} />
                      ) : (
                        <ExpandMore sx={{ fontSize: 17 }} />
                      )}
                    </Box>
                  </ListItemButton>

                  {/* Sub-items */}
                  <Collapse
                    in={!!openMenus[group.group]}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List disablePadding sx={{ mb: 0.5 }}>
                      {group.items.map((item) => {
                        const active = pathname === item.path;
                        return (
                          <ListItemButton
                            key={item.path}
                            onClick={() => {
                              navigate(item.path);
                              if (isMobile) setMobileOpen(false);
                            }}
                            sx={{
                              pr: 5,
                              pl: 1.5,
                              py: 0.8,
                              mb: 0.2,
                              borderRadius: "7px",
                              bgcolor: active ? SB_ACTIVE_BG : "transparent",
                              "&:hover": { bgcolor: SB_HOVER },
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              direction: isRTL ? "rtl" : "ltr",
                            }}
                          >
                            {/* label */}
                            <Typography
                              sx={{
                                flex: 1,
                                fontSize: "0.82rem",
                                textAlign: isRTL ? "right" : "left",
                                fontWeight: active ? 700 : 400,
                                color: active ? SB_TEXT : SB_MUTED,
                              }}
                            >
                              {item.label}
                            </Typography>
                            {/* dot */}
                            <Box
                              sx={{
                                width: active ? 8 : 6,
                                height: active ? 8 : 6,
                                borderRadius: "50%",
                                bgcolor: active ? SB_ACTIVE_DOT : SB_MUTED,
                                flexShrink: 0,
                                transition: "all 0.15s",
                              }}
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                </>
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* User profile */}
      <Box sx={{ p: 1.5, borderTop: `1px solid ${SB_DIVIDER}` }}>
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.2,
            borderRadius: "10px",
            cursor: "pointer",
            "&:hover": { bgcolor: SB_HOVER },
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: !userAvatar ? SB_ACTIVE_DOT : undefined,
            }}
            src={userAvatar}
            imgProps={{ onError: () => setImageError(true) }}
          >
            {!userAvatar && userInitial}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{ fontWeight: 700, fontSize: "0.83rem", color: SB_TEXT }}
            >
              {userName}
            </Typography>
            <Typography sx={{ fontSize: "0.7rem", color: SB_MUTED }} noWrap>
              {userEmail}
            </Typography>
          </Box>
          <Settings sx={{ fontSize: 16, color: SB_MUTED }} />
        </Box>
      </Box>
    </Box>
  );

  // ── Main render ───────────────────────────────────────────────
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: "background.paper",
          color: "text.primary",
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {pathname === "/"
                ? text.dashboard
                : navigationItems.find((i) => i.path === pathname)?.label || ""}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FormControl size="small" variant="outlined" sx={{ minWidth: 90 }}>
              <Select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                sx={{
                  fontWeight: 600,
                  height: 36,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "divider",
                  },
                }}
              >
                <MenuItem value="ps">پښتو</MenuItem>
                <MenuItem value="fa">دری</MenuItem>
                <MenuItem value="en">EN</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: !userAvatar ? "primary.main" : undefined,
                }}
                src={userAvatar}
                imgProps={{ onError: () => setImageError(true) }}
              >
                {!userAvatar && userInitial}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            navigate("/profile");
            setAnchorEl(null);
          }}
        >
          <Person fontSize="small" sx={{ mr: 1 }} /> {text.profile}
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate("/master-data");
            setAnchorEl(null);
          }}
        >
          <Settings fontSize="small" sx={{ mr: 1 }} /> {text.settings}
        </MenuItem>
        {isAdmin && (
          <>
            <Divider />
            <MenuItem
              onClick={() => {
                navigate("/admin/audit-logs");
                setAnchorEl(null);
              }}
            >
              <AdminPanelSettings fontSize="small" sx={{ mr: 1 }} />{" "}
              {text.auditLogs}
            </MenuItem>
            <MenuItem
              onClick={() => {
                navigate("/admin/user-management");
                setAnchorEl(null);
              }}
            >
              <AdminPanelSettings fontSize="small" sx={{ mr: 1 }} />{" "}
              {text.userManagement}
            </MenuItem>
          </>
        )}
        <Divider />
        <MenuItem onClick={handleLogout}>
          <Logout fontSize="small" sx={{ mr: 1 }} /> {text.logout}
        </MenuItem>
      </Menu>

      {/* Drawers */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              bgcolor: SB_BG,
              border: "none",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              bgcolor: SB_BG,
              border: "none",
              boxShadow: "2px 0 16px rgba(0,0,0,0.25)",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
