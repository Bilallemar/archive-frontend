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
import getArchiveTexts from "../../../helpers/archive/getArchiveTexts";
import { formatHijriDateForDisplay } from "../../../utils/hijriDateUtils";

export default function ViewArchive({ open, onClose, archive }) {
  const { t } = useTranslation("archive");
  const texts = getArchiveTexts(t);
  const isWarada = archive?.direction === "INCOMING";

  const pageTitle = isWarada
    ? texts.viewIncoming || "لیدل وارده"
    : texts.viewOutgoing || "لیدل صادره";
  if (!archive) return null;

  const InfoRow = ({ label, value }) => (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid item xs={4}>
        <Typography variant="body2" color="text.secondary" fontWeight="bold">
          {label}:
        </Typography>
      </Grid>
      <Grid item xs={8}>
        <Typography variant="body1">{value || "—"}</Typography>
      </Grid>
    </Grid>
  );

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
            {pageTitle}
          </Typography>

          <Chip
            label={`ID: ${archive.id}`}
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
                {texts.docNo || "نمبر مکتوب / پارسل"}
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {archive.docNo}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.sender || "مرسل (Sender)"}
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {archive.senderOrg?.name}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.receiver || "مرسل الیه (Receiver)"}
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {archive.receiverOrg?.name}
              </Typography>
            </Box>
          </Grid>

          {/* District */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.docType || "نوعیت پارسل"}
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {archive.docType?.name}
              </Typography>
            </Box>
          </Grid>

          {/* Year */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.incomingDate || "تاریخ دریافت"}
              </Typography>
              <Typography variant="body1">
                {formatHijriDateForDisplay(archive.receiveDate)}
              </Typography>
            </Box>
          </Grid>

          {/* Document Type */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.sendDate || "تاریخ ارسال"}
              </Typography>
              <Typography variant="body1">
                {formatHijriDateForDisplay(archive.sendDate)}
              </Typography>
            </Box>
          </Grid>

          {/* Summary Waseqa */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {texts.departmentDate || "تاریخ شعبه"}
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                {formatHijriDateForDisplay(archive.departmentDate)}
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
                {archive.description || "—"}
              </Typography>
            </Box>
          </Grid>

          {/* Files Section */}
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
