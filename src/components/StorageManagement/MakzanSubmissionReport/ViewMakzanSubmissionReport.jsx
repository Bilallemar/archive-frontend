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
import getMakzanSubmissionReportTexts from "../../../helpers/Storage/MakzanSubmissionReport/MakzanSubmissionReportText";

export default function ViewMakzanSubmissionReport({ open, onClose, report }) {
  const { t } = useTranslation("makzanSubmissionReport");
  const texts = getMakzanSubmissionReportTexts(t);

  if (!open || !report) return null;

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
      {/* Title */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "primary.lighter",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            {texts.viewTitle || "د راپور تفصیلات"}
          </Typography>
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

      {/* Content */}
      <DialogContent dividers sx={{ py: 4, px: 4 }}>
        <Grid container spacing={3}>
          {/* Province */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.province || "ولایت"}
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {report.province?.name || "—"}
              </Typography>
            </Box>
          </Grid>

          {/* District */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.district || "ولسوالي"}
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {report.district?.name || "—"}
              </Typography>
            </Box>
          </Grid>

          {/* Year */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.year || "کال"}
              </Typography>
              <Typography variant="body1">{report.year || "—"}</Typography>
            </Box>
          </Grid>

          {/* Document Type */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.docType || "نوعیت پارسل"}
              </Typography>
              <Typography variant="body1">
                {report.docType?.name || "—"}
              </Typography>
            </Box>
          </Grid>

          {/* Summary Waseqa */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.summaryWaseqa || "خلص مطلب وثیقه"}
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                {report.summaryWaseqa || "—"}
              </Typography>
            </Box>
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.description || "ملاحظات"}
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
                  {texts.cabinetAddress || "پته کابینه (Cabinet Location)"}
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
                    {texts.shelf || "شف (Shelf)"}
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
          <Grid item xs={12} sx={{ mt: 1 }}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color="primary.main"
              gutterBottom
            >
              {texts.attachedFiles || "ضمیمه شوي فایلونه"}{" "}
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
                        "&:last-child": { pb: 1.5 },
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

      {/* Actions */}
      <DialogActions sx={{ px: 4, py: 2.5 }}>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            minWidth: 120,
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          {texts.close || "بندول"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
