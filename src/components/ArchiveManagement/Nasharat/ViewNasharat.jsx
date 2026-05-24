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
import { formatHijriDateForDisplay } from "../../../utils/hijriDateUtils";

export default function ViewNasharat({ open, onClose, nasharat }) {
  const { t } = useTranslation("nasharat");

  if (!nasharat) return null;

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
            {t("viewNasharat", "لیدل نشرات")}
          </Typography>
          <Chip
            label={`ID: ${nasharat.id}`}
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
          {/* Doc Number */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {t("docNo", "نمبر مکتوب / پارسل")}
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {nasharat.docNo}
              </Typography>
            </Box>
          </Grid>

          {/* Sender */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {t("sender", "مرسل (Sender)")}
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {nasharat.senderOrg?.name || nasharat.senderOrgName || "—"}
              </Typography>
            </Box>
          </Grid>

          {/* Receiver */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {t("receiver", "مرسل الیه (Receiver)")}
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {nasharat.receiverOrg?.name || nasharat.receiverOrgName || "—"}
              </Typography>
            </Box>
          </Grid>

          {/* Doc Type */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {t("docType", "نوعیت پارسل")}
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {nasharat.docType?.name || nasharat.docTypeName || "—"}
              </Typography>
            </Box>
          </Grid>

          {/* Receive Date */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {t("incomingDate", "تاریخ دریافت")}
              </Typography>
              <Typography variant="body1">
                {formatHijriDateForDisplay(nasharat.receiveDate) || "—"}
              </Typography>
            </Box>
          </Grid>

          {/* Send Date */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {t("sendDate", "تاریخ ارسال")}
              </Typography>
              <Typography variant="body1">
                {formatHijriDateForDisplay(nasharat.sendDate) || "—"}
              </Typography>
            </Box>
          </Grid>

          {/* Department Date */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {t("departmentDate", "تاریخ شعبه")}
              </Typography>
              <Typography variant="body1">
                {formatHijriDateForDisplay(nasharat.departmentDate) || "—"}
              </Typography>
            </Box>
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {t("description", "ملاحظات")}
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                {nasharat.description || "—"}
              </Typography>
            </Box>
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
          {t("close", "بندول")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
