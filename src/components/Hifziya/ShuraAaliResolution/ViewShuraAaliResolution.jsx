import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import getShuraAaliResolutionTexts from "../../../helpers/hifziya/ShuraAaliResolutionTexts";
import { formatHijriDateForDisplay } from "../../../utils/hijriDateUtils";

export default function ViewShuraAaliResolution({ open, onClose, resolution }) {
  const { t } = useTranslation("shuraAali");
  const texts = getShuraAaliResolutionTexts(t);
const isMosawaba = resolution?.direction === "MOSAWABA";

  const pageTitle = isMosawaba
    ? texts.viewMosawaba || "لیدل مصوبه"
    : texts.viewYadasht  || "لیدل یاداشت";
  if (!resolution) return null;

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

          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            {pageTitle}
          </Typography>
          {/* <Chip
            label={isSawanih ? "سوانح" : "استخدام"}
            size="medium"
            sx={{
              fontWeight: 600,
              bgcolor: isSawanih ? "warning.main" : "primary.main",
              color: "white",
              px: 1.5,
            }}
          /> */}
          <Chip
            label={`ID: ${resolution.id}`}
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
                {texts.sendDate}
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {formatHijriDateForDisplay(resolution.sendDate) || "—"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.senderRef}
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {resolution.senderReference || "—"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.subject}
              </Typography>
              <Typography variant="body1">
                {resolution.subject || "—"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.title}
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {resolution.title || "—"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.type}
              </Typography>
              <Typography variant="body1">
                {resolution.resolutionType || "—"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.letterNo}
              </Typography>
              <Typography variant="body1">
                {resolution.letterNumber || "—"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.year}
              </Typography>
              <Typography variant="body1">
                {resolution.approvalYear || "—"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.remarks}
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                {resolution.remarks || "—"}
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
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 4, py: 2.5 }}>
        <Button variant="contained" onClick={onClose}>
          {texts.close || "بندول"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
