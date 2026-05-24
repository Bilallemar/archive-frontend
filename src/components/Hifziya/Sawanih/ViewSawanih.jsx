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
import getSawanihTexts from "../../../helpers/hifziya/sawanih/sawanihText";
import { formatHijriDateForDisplay } from "../../../utils/hijriDateUtils";
import { convertToPersianNumbers } from "../../../utils/numberUtils";
// Assuming you have a downloadFile function similar to other modules

export default function ViewSawanih({ open, onClose, report }) {
  const { t } = useTranslation("sawanih");
  const texts = getSawanihTexts(t);

  if (!open || !report) return null;

  const isSawanih = report?.isSawanih === true;

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

  const formatFileSize = (bytes) => {
    if (!bytes) return "نامعلوم";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      {/* Title */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: isSawanih ? "warning.lighter" : "primary.lighter",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            {isSawanih ? "د سوانح تفصیلات" : "د استخدام تفصیلات"}
          </Typography>

          <Chip
            label={isSawanih ? "سوانح" : "استخدام"}
            size="small"
            color={isSawanih ? "warning" : "primary"}
            variant="outlined"
            sx={{ fontWeight: 600 }}
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
          {/* Row 1 */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.name || "نوم"}
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {report.name || "—"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.fatherName || "د پلار نوم"}
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {report.fatherName || "—"}
              </Typography>
            </Box>
          </Grid>

          {/* Row 2 */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.org || "اداره / څانګه"}
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {report.org?.name || "—"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.pageQuantity || "تعداد صفحات"}
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {isSawanih
                  ? "—"
                  : report.pageQuantity
                    ? convertToPersianNumbers(report.pageQuantity)
                    : "—"}
              </Typography>
            </Box>
          </Grid>

          {/* Dates */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.incommingDate || "تاریخ وارده"}
              </Typography>
              <Typography variant="body1">
                {formatHijriDateForDisplay(report.incommingDate) || "—"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.outgoingDate || "تاریخ صادره"}
              </Typography>
              <Typography variant="body1">
                {formatHijriDateForDisplay(report.outgoingDate) || "—"}
              </Typography>
            </Box>
          </Grid>

          {/* Description */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color="primary.main"
              gutterBottom
            >
              {texts.description || "ملاحظات / توضیحات"}
            </Typography>
            <Card variant="outlined" sx={{ bgcolor: "grey.50" }}>
              <CardContent sx={{ whiteSpace: "pre-wrap", py: 2 }}>
                <Typography variant="body1">
                  {report.description || "هیڅ ملاحظات ثبت شوي نه دي"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
  {report.cabinetFile && (
            <>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="primary.main"
                >
                  {texts.cabinetAddress || "محفوظ ځای (Cabinet Location)"}
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
                    {texts.cabinet || "کابینه (Cabinet)"}
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
                    {texts.floor || "پوړ (Floor)"}
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
                    {texts.shelf || "ځای (Shelf)"}
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
                    {texts.file || "فایل (File)"}
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
              ضمیمه شوي اسناد{" "}
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
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: "action.hover",
                      },
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
                sx={{ bgcolor: "info.lighter" }}
              >
                هیڅ ضمیمه شوی سند نشته
              </Alert>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 4, py: 2.5 }}>
        <Button variant="contained" onClick={onClose} sx={{ minWidth: 120 }}>
          {texts.close || "بندول"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
