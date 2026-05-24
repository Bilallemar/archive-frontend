import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Box,
  Button,
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
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import getMakzanReceiptTexts from "../../../helpers/Storage/MakzanReceipt/MakzanReceiptText";
import api from "../../../services/api";
import { formatHijriDateForDisplay } from "../../../utils/hijriDateUtils";

export default function ViewMakzanReceipt({ open, onClose, receipt }) {
  const { t } = useTranslation("makzanReceipt");
  const texts = getMakzanReceiptTexts(t);

  if (!receipt) return null;
  const downloadReceiptFile = async (fileName) => {
    try {
      const response = await api.get(
        `/makzan-receipts/download/${encodeURIComponent(fileName)}`,
        {
          responseType: "blob",
        },
      );
      return response;
    } catch (error) {
      console.error("Download error:", error);
      throw error;
    }
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
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
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
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
          bgcolor: "primary.lighter",
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {texts.viewDetails || "د رسید تفصیلات"}
          </Typography>
          <Chip
            label={`ID: ${receipt.id}`}
            size="small"
            sx={{ mt: 1 }}
            color="primary"
            variant="outlined"
          />
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {/* No */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {texts.department || "شمېره"}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                {receipt.department || "N/A"}
              </Typography>
            </Box>
          </Grid>

          {/* Doc No */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {texts.docNo || "د سند شمېره"}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                {receipt.docNo || "N/A"}
              </Typography>
            </Box>
          </Grid>

          {/* Organization */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {texts.org || "اداره"}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                {receipt.org?.name || "N/A"}
              </Typography>
            </Box>
          </Grid>

          {/* Letter No */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {texts.letterNo || "شمېره مکتوب"}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                {receipt.letterNo || "N/A"}
              </Typography>
            </Box>
          </Grid>

          {/* Letter Date */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {texts.letterDate || "نیټه مکتوب"}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                {formatHijriDateForDisplay(receipt.letterDate)}
              </Typography>
            </Box>
          </Grid>

          {/* Subject Type */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {texts.subjectType || "موضوع ډول"}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                {receipt.subjectType || "N/A"}
              </Typography>
            </Box>
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {texts.description || "توضیحات"}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                {receipt.description || "N/A"}
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
                                      {text.cabinetAddress|| "پته کابینه (Cabinet Location)"}

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
                    {texts.file || "اسناد (File)"}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {report.cabinetFile?.name || "—"}
                  </Typography>
                </Box>
              </Grid>
            </>
          )}
          {/* Files Section */}
          {receipt.files && receipt.files.length > 0 && (
            <>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: "bold",
                    mb: 2,
                    color: "primary.main",
                    mt: 2,
                  }}
                >
                  {texts.files || "ضمیمه شوي فایلونه"} ({receipt.files.length})
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1.5}>
                  {receipt.files.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 2,
                        bgcolor: "background.neutral",
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <AttachFileIcon color="primary" />
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "medium" }}
                          >
                            {file.fileName || `File ${index + 1}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {file.fileType || "نامعلوم"} •{" "}
                            {file.fileSize
                              ? `${(file.fileSize / 1024).toFixed(2)} KB`
                              : "نامعلوم"}
                          </Typography>
                        </Box>
                      </Box>

                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewFile(file.filePath, file.fileName)}
                        title="فایل وګورئ"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              </Grid>
            </>
          )}

          {/* No Files */}
          {(!receipt.files || receipt.files.length === 0) && (
            <Grid item xs={12}>
              <Box
                sx={{
                  textAlign: "center",
                  py: 4,
                  bgcolor: "background.neutral",
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {texts.noFiles || "هیڅ فایل ضمیمه شوی نشته"}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          {texts.close || "بندول"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
