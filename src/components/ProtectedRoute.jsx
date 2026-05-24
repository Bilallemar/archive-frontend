import React from "react";
import { Navigate } from "react-router-dom";
import { useMyContext } from "../store/ContextApi";
import {
  hasManagement,
  canAccessRoute,
  isAdmin as checkIsAdmin,
} from "../utils/managementUtils";
import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const ProtectedRoute = ({
  children,
  adminPage = false,
  requiresManagement = false,
  requiredManagementId = null,
}) => {
  const { token, isAdmin } = useMyContext();

  // Check if user is logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check admin access
  if (adminPage && !isAdmin) {
    return <Navigate to="/access-denied" replace />;
  }

  // Check if route requires management assignment
  if (requiresManagement && !hasManagement() && !checkIsAdmin()) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          padding: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 2,
            fontFamily: "B nazanin",
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          څانګه تعین شوی نه ده
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 3,
            fontFamily: "B nazanin",
            textAlign: "center",
            color: "text.secondary",
          }}
        >
          تاسو ته لا تر اوسه یوه څانګه تعین شوې نه ده. مهرباني وکړئ د اډمین سره
          اړیکه ونیسئ.
        </Typography>
        <Button
          component={Link}
          to="/profile"
          variant="contained"
          sx={{
            fontFamily: "B nazanin",
            backgroundColor: "#4e79a7",
            "&:hover": { backgroundColor: "#3d5f85" },
          }}
        >
          زما پروفایل ته لاړ شه
        </Button>
      </Box>
    );
  }

  // Check if user has access to specific management route
  if (requiredManagementId && !canAccessRoute(null, requiredManagementId)) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          padding: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 2,
            fontFamily: "B nazanin",
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          لاسرسی نشته
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 3,
            fontFamily: "B nazanin",
            textAlign: "center",
            color: "text.secondary",
          }}
        >
          تاسو د دې پاڼې ته د لاسرسي اجازه نلرئ. تاسو یوازې د خپلې څانګې پاڼو ته
          لاسرسی لرئ.
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="contained"
          sx={{
            fontFamily: "B nazanin",
            backgroundColor: "#4e79a7",
            "&:hover": { backgroundColor: "#3d5f85" },
          }}
        >
          کور ته بیرته ستنیدل
        </Button>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;
