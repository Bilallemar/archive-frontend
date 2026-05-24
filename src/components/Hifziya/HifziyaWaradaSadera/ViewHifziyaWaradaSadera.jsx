import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import FolderOffIcon from "@mui/icons-material/FolderOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import getHifziyaWaradaSaderaTexts from "../../../helpers/hifziya/waradaSadera/waradaSaderaListTexts";
import { formatHijriDateForDisplay } from "../../../utils/hijriDateUtils";

export default function ViewHifziyaWaradaSadera({ open, onClose, report }) {
  const { t } = useTranslation("hifziyaWaradaSadera");
  const text = getHifziyaWaradaSaderaTexts(t);
  const isWarada = report?.direction === "INCOMING";

  const pageTitle = isWarada
    ? text.viewIncoming || "لیدل وارده"
    : text.viewOutgoing || "لیدل صادره";
  if (!open || !report) return null;

  const direction = report.direction || "INCOMING";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("fa-AF", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "نامعلوم";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleViewFile = (filePath, fileName) => {
    const ext = filePath.split(".").pop().toLowerCase();

    let token = localStorage.getItem("JWT_TOKEN") || "";
    if (token.startsWith("Bearer ")) token = token.substring(7);

    const url = `http://localhost:8081/api/hifziya-warada-sadera/download/${encodeURIComponent(filePath)}?token=${token}`;

    if (["pdf", "jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      window.open(url, "_blank");
    } else {
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || filePath; // ← show original name on download
      a.click();
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor:
            direction === "INCOMING" ? "success.lighter" : "primary.lighter",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            {pageTitle || "د لاسوند تفصیلات"}
          </Typography>
          <Chip
            label={direction === "INCOMING" ? "وارده" : "صادره"}
            size="medium"
            sx={{
              fontWeight: 600,
              bgcolor:
                direction === "INCOMING" ? "success.main" : "primary.main",
              color: "white",
              px: 1.5,
            }}
          />
          <Chip
            label={`ID: ${report.id}`}
            size="small"
            color="default"
            variant="outlined"
          />
        </Box>

        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 4, px: 4 }}>
        <Grid container spacing={3}>
          {/* Main Info */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {text.viewNumber || "شمېره"}
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {report.no || "—"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {text.viewOrganization || "اداره"}
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {report.org?.name || "—"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {text.viewLetterNumber || "شمېره مکتوب"}
              </Typography>
              <Typography variant="body1">
                {report.letterNumber || "—"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {text.viewIncommingDate || "تاریخ وارده"}
              </Typography>
              <Typography variant="body1">
                {formatHijriDateForDisplay(report.incommingDate)}
              </Typography>
            </Box>
          </Grid>

          {direction === "OUTGOING" && (
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  gutterBottom
                >
                  {text.viewOutgoingDate || "تاریخ صادره"}
                </Typography>
                <Typography variant="body1">
                  {formatHijriDateForDisplay(report.outgoingDate)}
                </Typography>
              </Box>
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {text.viewSummary || "لنډیز"}
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                {report.summary || "—"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {text.viewSubjectType || "د موضوع نوع"}
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                {report.subjectType || "—"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {text.viewDescription || "ملاحظات"}
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                {report.description || "—"}
              </Typography>
            </Box>
          </Grid>
          {report.cabinetFile && (
            <>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="primary.main"
                >
                  {text.cabinetLocation || "د کابینه موقعیت"}
                </Typography>
                <Divider sx={{ mt: 1 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                  >
                    {text.cabinet || "کابینه (Cabinet)"}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {report.cabinetFile?.shelf?.floor?.cabinet?.name || "—"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                  >
                    {text.floor || "پوړ (Floor)"}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {report.cabinetFile?.shelf?.floor?.name || "—"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                  >
                   {text.shelf || "شیلف (Shelf)"}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {report.cabinetFile?.shelf?.name || "—"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                  >
                   {text.file || "پته (File)"}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {report.cabinetFile?.name || "—"}
                  </Typography>
                </Box>
              </Grid>
            </>
          )}
          {/* Files Section */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color="primary.main"
              gutterBottom
            >
              {text.viewFiles || "ضمیمه شوي اسناد"}{" "}
              {report.files?.length ? `(${report.files.length})` : ""}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {report.files?.length > 0 ? (
              <Stack spacing={1.5}>
                {report.files.map((file, index) => (
                  <Card
                    key={index}
                    variant="outlined"
                    sx={{
                      "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: "action.hover",
                      },
                      transition: "all 0.2s",
                    }}
                  >
                    <CardContent
                      sx={{
                        py: 1.5,
                        px: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          flex: 1,
                        }}
                      >
                        <AttachFileIcon color="primary" />
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {file.fileName || `فایل ${index + 1}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {file.fileType || "نامعلوم"} •{" "}
                            {formatFileSize(file.fileSize)}
                          </Typography>
                        </Box>
                      </Box>

                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() =>
                          handleViewFile(file.filePath, file.fileName)
                        }
                        title="فایل خلاص کړئ / ډاونلوډ کړئ"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Alert
                severity="info"
                icon={<FolderOffIcon />}
                sx={{
                  bgcolor: "info.lighter",
                  border: "1px solid",
                  borderColor: "info.main",
                }}
              >
                هیڅ ضمیمه شوی سند نشته
              </Alert>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 4, py: 2.5 }}>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            minWidth: 120,
            bgcolor: direction === "INCOMING" ? "success.main" : "primary.main",
            "&:hover": {
              bgcolor:
                direction === "INCOMING" ? "success.dark" : "primary.dark",
            },
          }}
        >
          {text.viewClose || "بندول"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
