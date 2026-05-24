// src/components/Breadcrumbs/PageBreadcrumbs.jsx
import React, { useMemo } from "react";
import { Breadcrumbs, Link, Typography, Box } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import HomeIcon from "@mui/icons-material/Home";
import getBreadcrumbNameMap from "./breadcrumbNameMap";

const PageBreadcrumbs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation("breadcrumbs");

  // ✅ Get localized breadcrumb map
  const breadcrumbNameMap = useMemo(() => getBreadcrumbNameMap(t), [t]);

  const pathnames = location.pathname.split("/").filter((x) => x);

  // Don't show breadcrumbs on home page
  if (location.pathname === "/" || pathnames.length === 0) {
    return null;
  }

  // Helper function to get label for a path
  const getLabel = (path, value) => {
    // First, try exact match
    if (breadcrumbNameMap[path]) {
      return breadcrumbNameMap[path];
    }

    // Check for dynamic routes (containing :id)
    for (const [key, label] of Object.entries(breadcrumbNameMap)) {
      if (key.includes(":id")) {
        const baseKey = key.replace("/:id", "");
        if (path.startsWith(baseKey) && !isNaN(Number(value))) {
          return label;
        }
      }
    }

    return value;
  };

  return (
    <Box sx={{ marginBottom: "16px" }}>
      <Breadcrumbs
        aria-label="breadcrumb"
        separator="•"
        sx={{
          "& .MuiBreadcrumbs-separator": {
            fontSize: "12px",
            color: "#919AEB",
            margin: "0 8px",
          },
        }}
      >
        {/* Home/Dashboard Icon - Always first */}
        <Link
          underline="hover"
          color="inherit"
          onClick={() => navigate("/")}
          sx={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            "&:hover": {
              color: "primary.main",
            },
          }}
        >
          <HomeIcon sx={{ fontSize: 20, marginLeft: "4px" }} />
        </Link>

        {/* Path segments */}
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const label = getLabel(to, value);

          return isLast ? (
            <Typography
              color="text.primary"
              key={to}
              sx={{
                fontWeight: 500,
                fontSize: "0.875rem",
              }}
            >
              {label}
            </Typography>
          ) : (
            <Link
              underline="hover"
              color="inherit"
              onClick={() => navigate(to)}
              key={to}
              sx={{
                cursor: "pointer",
                fontSize: "0.875rem",
                "&:hover": {
                  color: "primary.main",
                },
              }}
            >
              {label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default PageBreadcrumbs;
