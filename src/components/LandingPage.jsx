import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  Alert,
  Box,
  Card,
  CircularProgress,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import LandingPageTexts from "../helpers/LandingPageTexts";
import api from "../services/api";
import {
  getCurrentHijriDate,
  getHijriMonthName,
  getHijriYear,
} from "../utils/hijriDateUtils";
import { hasManagement, isAdmin } from "../utils/managementUtils";

export default function LandingPage() {
  const { t } = useTranslation("landingPage");
  const text = useMemo(() => LandingPageTexts(t), [t]);
  const theme = useTheme();
  const userIsAdmin = isAdmin();
  const userHasManagement = hasManagement();

  const [chartData, setChartData] = useState({
    months: [],
    fileData: [],
    waradaData: [],
    saderaData: [],
    totalArchive: 0,
    totalHifziya: 0,
    totalMakhzan: 0,
    totalDocuments: 0,
    totalWarada: 0,
    totalSadera: 0,
    totalSawanih: 0,
    totalHifziyaHazari: 0,
    totalHifziyaWaradaSadera: 0,
    totalMakzanReceipt: 0,
    totalAnnualReport: 0,
    totalSubmissionReport: 0,
    totalFile: 0,
    weeklyData: { sender: 0, recipient: 0, file: 0 },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get management ID from localStorage
  const managementId = useMemo(() => {
    try {
      const stored = localStorage.getItem("USER_MANAGEMENT");
      if (stored) return Number(JSON.parse(stored)?.managementId);
    } catch {
      return null;
    }
    return null;
  }, []);
  // ✅ Get current Hijri year
  const currentHijriYear = useMemo(() => {
    try {
      // getCurrentHijriDate() returns "1447/3/9" → split and take first part
      return getCurrentHijriDate().split("/")[0];
    } catch {
      return new Date().getFullYear();
    }
  }, []);
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/dashboard/stats");
        setChartData(res.data);
      } catch (err) {
        console.error("Dashboard load error:", err);
        if (err.response?.status === 401)
          setError(text.sessionExpired || "جلسه ختمه شوه");
        else if (err.response?.status === 403)
          setError(text.accessDenied || "اجازه نشته");
        else setError(text.dashboardLoadError || "د ډیشبورډ معلومات لوډ نشول");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Convert YYYY-MM → Hijri month name
  // ✅ Convert YYYY-MM → Hijri name, but keep plain years as-is
  const hijriMonths = useMemo(() => {
    return (chartData.months || []).map((ym) => {
      // Plain 4-digit year (e.g. "2025") → convert to Hijri year only
      if (/^\d{4}$/.test(ym)) {
        return String(getHijriYear(ym));
      }
      // YYYY-MM → Hijri month name
      return getHijriMonthName(ym + "-01") || ym;
    });
  }, [chartData.months]);
  // ── Mini Sparkline ──────────────────────────────
  const MiniSparkline = ({ data, color }) => {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const W = 60,
      H = 32;
    const points = data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * W;
        const y = H - ((v - min) / range) * H;
        return `${x},${y}`;
      })
      .join(" ");
    return (
      <svg width={W} height={H}>
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  // ── Stat Cards per role ─────────────────────────
  let statCards = [];

  if (userIsAdmin) {
    // ADMIN: Archive / Hifziya / Makhzan
    statCards = [
      {
        title: text.totalArchive || "ټول آرشیف",
        value: chartData.totalArchive || 0,
        weeklyValue: chartData.weeklyData?.file || 0,
        color: "#8B5CF6",
        lightBg: "rgba(139,92,246,0.08)",
        sparklineData: chartData.fileData?.slice(-7) || [],
      },
      {
        title: text.totalHifziya || "ټول حفظیه",
        value: chartData.totalHifziya || 0,
        weeklyValue: 0,
        color: "#FFAB00",
        lightBg: "rgba(255,171,0,0.08)",
        sparklineData: chartData.fileData?.slice(-7) || [],
      },
      {
        title: text.totalMakhzan || "ټول مخزن",
        value: chartData.totalMakhzan || 0,
        weeklyValue: 0,
        color: "#FF5630",
        lightBg: "rgba(255,86,48,0.08)",
        sparklineData: chartData.fileData?.slice(-7) || [],
      },
    ];
  } else if (managementId === 1) {
    // ARCHIVE MANAGER: Incoming / Outgoing / This month
    statCards = [
      {
        title: text.totalWarada || "ټول واردات (Incoming)",
        value: chartData.totalWarada || 0,
        weeklyValue: chartData.weeklyData?.file || 0,
        color: "#00B8D9",
        lightBg: "rgba(0,184,217,0.08)",
        sparklineData: chartData.waradaData?.slice(-7) || [],
      },
      {
        title: text.totalSadera || "ټول صادرات (Outgoing)",
        value: chartData.totalSadera || 0,
        weeklyValue: 0,
        color: "#FF5630",
        lightBg: "rgba(255,86,48,0.08)",
        sparklineData: chartData.saderaData?.slice(-7) || [],
      },
      {
        title: text.thisMonth || "دې میاشت اسناد",
        value: chartData.weeklyData?.file || 0,
        weeklyValue: chartData.weeklyData?.file || 0,
        color: "#00A76F",
        lightBg: "rgba(0,167,111,0.08)",
        sparklineData: chartData.fileData?.slice(-7) || [],
      },
    ];
  } else if (managementId === 2) {
    statCards = [
      {
        title: text.totalSawanih || "سوانح",
        value: chartData.totalSawanih || 0,
        weeklyValue: chartData.weeklyData?.file || 0,
        color: "#8B5CF6",
        lightBg: "rgba(139,92,246,0.08)",
        sparklineData: chartData.waradaData?.slice(-7) || [],
        showYear: false, // ✅ Sawanih has dates → show month
      },
      {
        title: text.totalHazari || "حضاری",
        value: chartData.totalHifziyaHazari || 0,
        weeklyValue: 0,
        color: "#FFAB00",
        lightBg: "rgba(255,171,0,0.08)",
        sparklineData: chartData.saderaData?.slice(-7) || [],
        showYear: true, // ✅ Hazari has years → show year
      },
      {
        title: text.totalIndraj || "انداج",
        value: chartData.totalHifziyaWaradaSadera || 0,
        weeklyValue: 0,
        color: "#00B8D9",
        lightBg: "rgba(0,184,217,0.08)",
        sparklineData: chartData.fileData?.slice(-7) || [],
        showYear: true, // ✅ Indraj has years → show year
      },
    ];
  } else if (managementId === 3) {
    // MAKHZAN MANAGER: Receipt / Annual / Submission
    statCards = [
      {
        title: text.totalMakzanReceipt || "رسیدونه",
        value: chartData.totalMakzanReceipt || 0,
        weeklyValue: chartData.weeklyData?.file || 0,
        color: "#FF5630",
        lightBg: "rgba(255,86,48,0.08)",
        sparklineData: chartData.waradaData?.slice(-7) || [],
      },
      {
        title: text.totalAnnualReport || "کلني راپورونه",
        value: chartData.totalAnnualReport || 0,
        weeklyValue: 0,
        color: "#1890FF",
        lightBg: "rgba(24,144,255,0.08)",
        sparklineData: chartData.saderaData?.slice(-7) || [],
      },
      {
        title: text.totalSubmissionReport || "تسلیمي راپورونه",
        value: chartData.totalSubmissionReport || 0,
        weeklyValue: 0,
        color: "#7635DC",
        lightBg: "rgba(118,53,220,0.08)",
        sparklineData: chartData.fileData?.slice(-7) || [],
      },
    ];
  } else {
    // Fallback for unassigned users
    statCards = [
      {
        title: text.totalFiles || "ټول اسناد",
        value: chartData.totalFile || 0,
        weeklyValue: chartData.weeklyData?.file || 0,
        color: "#00B8D9",
        lightBg: "rgba(0,184,217,0.08)",
        sparklineData: chartData.fileData?.slice(-7) || [],
      },
    ];
  }

  // ── Chart bars per role ─────────────────────────
  const displayWarada =
    chartData.waradaData?.length > 0 ? chartData.waradaData : [];
  const displaySadera =
    chartData.saderaData?.length > 0 ? chartData.saderaData : [];
  const displayFile = chartData.fileData?.length > 0 ? chartData.fileData : [];

  const getChartBars = () => {
    if (userIsAdmin) {
      return [
        {
          data: displayFile,
          color: "#00B8D9",
          label: text.totalFiles || "ټول اسناد",
        },
      ];
    }
    if (managementId === 1) {
      return [
        {
          data: displayWarada,
          color: "#00B8D9",
          label: text.totalWarada || "واردات (Incoming)",
        },
        {
          data: displaySadera,
          color: "#FF5630",
          label: text.totalSadera || "صادرات (Outgoing)",
        },
      ];
    }
    if (managementId === 2) {
      return [
        {
          data: displayWarada,
          color: "#FFAB00",
          label: text.totalHazari || "حضاری",
        },
        {
          data: displaySadera,
          color: "#00B8D9",
          label: text.totalIndraj || "انداج",
        },
      ];
    }
    if (managementId === 3) {
      return [
        {
          data: displayWarada,
          color: "#FF5630",
          label: text.totalMakzanReceipt || "رسیدونه",
        },
        // {
        //   data: displaySadera,
        //   color: "#1890FF",
        //   label: text.totalAnnualReport || "کلني راپورونه",
        // },
        // {
        //   data: displayFile,
        //   color: "#7635DC",
        //   label: text.totalSubmissionReport || "تسلیمي راپورونه",
        // },
      ];
    }
    return [
      {
        data: displayFile,
        color: "#00B8D9",
        label: text.totalFiles || "ټول اسناد",
      },
    ];
  };
  const chartBars = getChartBars();

  const allBarValues = chartBars.flatMap((b) => b.data);
  const maxBarValue = Math.max(...allBarValues, 1);
  const yAxisSteps = [
    maxBarValue,
    Math.round(maxBarValue * 0.75),
    Math.round(maxBarValue * 0.5),
    Math.round(maxBarValue * 0.25),
    0,
  ];

  // ── Donut (admin only) ──────────────────────────
  // Build donut segments based on role
  let donutSegments = [];

  if (userIsAdmin) {
    donutSegments = [
      {
        color: "#8B5CF6",
        label: text.totalArchive || "آرشیف",
        value: chartData.totalArchive || 0,
      },
      {
        color: "#FFAB00",
        label: text.totalHifziya || "حفظیه",
        value: chartData.totalHifziya || 0,
      },
      {
        color: "#FF5630",
        label: text.totalMakhzan || "مخزن",
        value: chartData.totalMakhzan || 0,
      },
    ];
  } else if (managementId === 1) {
    donutSegments = [
      {
        color: "#00B8D9",
        label: text.totalWarada || "واردات",
        value: chartData.totalWarada || 0,
      },
      {
        color: "#FF5630",
        label: text.totalSadera || "صادرات",
        value: chartData.totalSadera || 0,
      },
    ];
  } else if (managementId === 2) {
    donutSegments = [
      {
        color: "#8B5CF6",
        label: text.totalSawanih || "سوانح",
        value: chartData.totalSawanih || 0,
      },
      {
        color: "#FFAB00",
        label: text.totalHazari || "حضاری",
        value: chartData.totalHifziyaHazari || 0,
      },
      {
        color: "#00B8D9",
        label: text.totalIndraj || "انداج",
        value: chartData.totalHifziyaWaradaSadera || 0,
      },
    ];
  } else if (managementId === 3) {
    donutSegments = [
      {
        color: "#FF5630",
        label: text.totalMakzanReceipt || "رسیدونه",
        value: chartData.totalMakzanReceipt || 0,
      },
      {
        color: "#1890FF",
        label: text.totalAnnualReport || "کلني راپورونه",
        value: chartData.totalAnnualReport || 0,
      },
      {
        color: "#7635DC",
        label: text.totalSubmissionReport || "تسلیمي راپورونه",
        value: chartData.totalSubmissionReport || 0,
      },
    ];
  }

  const totalDonut = donutSegments.reduce((sum, s) => sum + s.value, 0);
  const showDonut = totalDonut > 0;
  const circumference = 471;
  let runningOffset = 0;
  const donutArcs = donutSegments.map((seg) => {
    const fraction = totalDonut > 0 ? seg.value / totalDonut : 0;
    const dash = fraction * circumference;
    const offset = -runningOffset;
    runningOffset += dash;
    return { ...seg, dash, offset };
  });

  // ── Render ──────────────────────────────────────
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          bgcolor: theme.palette.background.default,
        }}
      >
        <CircularProgress size={48} thickness={4} sx={{ color: "#3B82F6" }} />
      </Box>
    );
  }
  if (error) {
    return (
      <Box
        sx={{
          p: 3,
          bgcolor: theme.palette.background.default,
          minHeight: "100vh",
        }}
      >
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }
  if (!userHasManagement && !userIsAdmin) {
    return (
      <Box
        sx={{
          p: 3,
          bgcolor: theme.palette.background.default,
          minHeight: "100vh",
        }}
      >
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          {text.noManagementAssigned || "هیڅ اداره درته ټاکل شوې نده"}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        p: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
        {/* ── STAT CARDS ── */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {statCards.map((card, idx) => {
            const pct =
              card.value > 0
                ? ((card.weeklyValue / card.value) * 100).toFixed(1)
                : "0.0";
            const isPos = card.weeklyValue > 0;
            return (
              <Grid item xs={12} md={4} key={idx}>
                <Card
                  sx={{
                    bgcolor: theme.palette.background.paper,
                    borderRadius: 4,
                    p: 3,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    border: `1px solid ${theme.palette.divider}`,
                    transition: "all 0.3s",
                    "&:hover": {
                      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: theme.palette.text.secondary,
                          mb: 1,
                        }}
                      >
                        {card.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "2.25rem",
                          fontWeight: 700,
                          color: theme.palette.text.primary,
                          mb: 1.5,
                        }}
                      >
                        {(card.value || 0).toLocaleString()}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        {isPos ? (
                          <TrendingUpIcon
                            sx={{ fontSize: 16, color: "#10B981" }}
                          />
                        ) : (
                          <TrendingDownIcon
                            sx={{ fontSize: 16, color: "#EF4444" }}
                          />
                        )}
                        <Typography
                          component="span"
                          sx={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: isPos ? "#10B981" : "#EF4444",
                          }}
                        >
                          {isPos ? "+" : ""}
                          {pct}%
                        </Typography>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: "0.875rem",
                            color: theme.palette.text.secondary,
                            ml: 0.5,
                          }}
                        >
                          {card.showYear
                            ? text.thisYear || "دې کال"
                            : text.thisMonth || "دې میاشت"}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        bgcolor: card.lightBg,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MiniSparkline
                        data={card.sparklineData}
                        color={card.color}
                      />
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* ── CHARTS ROW ── */}
        <Grid container spacing={3}>
          {/* Donut — admin only */}
          {showDonut && (
            <Grid item xs={12} lg={4}>
              <Card
                sx={{
                  bgcolor: theme.palette.background.paper,
                  borderRadius: 4,
                  p: 3,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  border: `1px solid ${theme.palette.divider}`,
                  height: "100%",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    mb: 3,
                  }}
                >
                  {text.documentDistribution || "د اسنادو ویش"}
                </Typography>
                <Box
                  sx={{
                    position: "relative",
                    display: "flex",
                    justifyContent: "center",
                    mb: 3,
                  }}
                >
                  <svg width="220" height="220" viewBox="0 0 220 220">
                    {donutArcs.map((arc, i) => (
                      <circle
                        key={i}
                        cx="110"
                        cy="110"
                        r="75"
                        fill="none"
                        stroke={arc.color}
                        strokeWidth="35"
                        strokeDasharray={`${arc.dash} ${circumference}`}
                        strokeDashoffset={arc.offset}
                        transform="rotate(-90 110 110)"
                      />
                    ))}
                  </svg>
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%,-50%)",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: theme.palette.text.secondary,
                        mb: 0.5,
                      }}
                    >
                      {text.total || "مجموع"}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "1.875rem",
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                      }}
                    >
                      {totalDonut.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  {donutSegments.map((item, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            bgcolor: item.color,
                            borderRadius: "50%",
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: "0.875rem",
                            color: theme.palette.text.secondary,
                          }}
                        >
                          {item.label}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                        }}
                      >
                        {item.value.toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>
          )}

          {/* Bar Chart */}
          <Grid item xs={12} lg={showDonut ? 8 : 12}>
            <Card
              sx={{
                bgcolor: theme.palette.background.paper,
                borderRadius: 4,
                p: 3,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: `1px solid ${theme.palette.divider}`,
                height: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                  }}
                >
                  {text.documentsByMonth || "د میاشتې اسناد"}
                </Typography>
                {managementId !== 2 && (
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      bgcolor: "#EFF6FF",
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "#3B82F6",
                      }}
                    >
                      {currentHijriYear}
                    </Typography>
                  </Box>
                )}
              </Box>

              {hijriMonths.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 288,
                  }}
                >
                  <Typography sx={{ color: theme.palette.text.secondary }}>
                    {text.noData || "معلومات شتون نلري"}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ position: "relative", height: 320 }}>
                  {/* Y-axis labels */}
                  <Box
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 32,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    {yAxisSteps.map((v, i) => (
                      <Typography
                        key={i}
                        sx={{
                          fontSize: "0.65rem",
                          color: theme.palette.text.secondary,
                        }}
                      >
                        {v}
                      </Typography>
                    ))}
                  </Box>

                  {/* Bars */}
                  <Box
                    sx={{
                      ml: 5,
                      height: "calc(100% - 32px)",
                      display: "flex",
                      alignItems: "flex-end",
                      gap: "4px",
                    }}
                  >
                    {hijriMonths.map((month, idx) => {
                      const isCurrentMonth =
                        chartData.months[idx] ===
                        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

                      return (
                        <Box
                          key={idx}
                          sx={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            height: "100%",
                            justifyContent: "flex-end",
                          }}
                        >
                          {/* Group of bars */}
                          <Box
                            sx={{
                              width: "100%",
                              display: "flex",
                              alignItems: "flex-end",
                              justifyContent: "center",
                              gap: "1px",
                              height: "100%",
                            }}
                          >
                            {chartBars.map((bar, barIdx) => {
                              const val = bar.data[idx] || 0;
                              const h =
                                maxBarValue > 0 ? (val / maxBarValue) * 100 : 0;
                              return (
                                <Box
                                  key={barIdx}
                                  title={`${month} — ${bar.label}: ${val}`}
                                  sx={{
                                    flex: 1,
                                    bgcolor:
                                      isCurrentMonth && barIdx === 0
                                        ? "#3B82F6"
                                        : h > 0
                                          ? bar.color
                                          : theme.palette.divider,
                                    borderRadius: "3px 3px 0 0",
                                    height: h > 0 ? `${h}%` : "2px",
                                    transition: "height 0.4s ease",
                                    cursor: "pointer",
                                    "&:hover": { opacity: 0.75 },
                                  }}
                                />
                              );
                            })}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>

                  {/* X-axis month labels */}
                  <Box sx={{ ml: 5, height: 32, display: "flex", gap: "4px" }}>
                    {hijriMonths.map((month, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          flex: 1,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "flex-end",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.6rem",
                            color: theme.palette.text.secondary,
                            textAlign: "center",
                          }}
                        >
                          {month}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Legend */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: 2,
                  mt: 2,
                }}
              >
                {chartBars.map((bar, i) => (
                  <Box
                    key={i}
                    sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        bgcolor: bar.color,
                        borderRadius: "50%",
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color: theme.palette.text.secondary,
                      }}
                    >
                      {bar.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
