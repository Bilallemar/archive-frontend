import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { updateNasharat } from "../../../services/ArchiveManagement/NasharatAPI";
import api from "../../../services/api";
import {
  convertGregorianToHijri,
  convertHijriToGregorian,
} from "../../../utils/hijriDateUtils";
import HijriDatePicker from "../../HijriDatePicker";

export default function EditNasharatDialog({
  open,
  onClose,
  nasharat,
  onSuccess,
}) {
  const { t } = useTranslation("nasharat");

  const [formData, setFormData] = useState({
    docNo: "",
    receiveDate: "",
    sendDate: "",
    departmentDate: "",
    senderOrgId: "",
    receiverOrgId: "",
    description: "",
    docTypeId: "",
  });

  const [orgs, setOrgs] = useState([]);
  const [docTypes, setDocTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load organizations and doc types
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [orgsRes, docTypesRes] = await Promise.all([
          api.get("/org"),
          api.get("/doc-type/active"),
        ]);
        setOrgs(orgsRes.data || []);
        setDocTypes(docTypesRes.data || []);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error(t("loadError", "د معلوماتو لوستل ناکام شول"));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [t]);

  // Populate form when nasharat changes and dialog opens
  useEffect(() => {
    if (nasharat && open) {
      setFormData({
        docNo: nasharat.docNo || "",
        receiveDate: convertGregorianToHijri(nasharat.receiveDate) || "",
        sendDate: convertGregorianToHijri(nasharat.sendDate) || "",
        departmentDate: convertGregorianToHijri(nasharat.departmentDate) || "",
        senderOrgId: nasharat.senderOrg?.id || "",
        receiverOrgId: nasharat.receiverOrg?.id || "",
        description: nasharat.description || "",
        docTypeId: nasharat.docType?.id || "",
      });
    }
  }, [nasharat, open]);

  const handleHijriDateChange = (field) => (hijriDate) => {
    setFormData((prev) => ({ ...prev, [field]: hijriDate }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.docNo?.trim()) {
      toast.error(t("docNoRequired", "د مکتوب شمېره اړینه ده"));
      setIsSubmitting(false);
      return;
    }
    if (!formData.senderOrgId) {
      toast.error(t("senderRequired", "مرسل اړین دی"));
      setIsSubmitting(false);
      return;
    }
    if (!formData.receiverOrgId) {
      toast.error(t("receiverRequired", "مرسل الیه اړین دی"));
      setIsSubmitting(false);
      return;
    }
    if (!formData.docTypeId) {
      toast.error(t("docTypeRequired", "د پارسل ډول اړین دی"));
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        docNo: formData.docNo.trim(),
        receiveDate: convertHijriToGregorian(formData.receiveDate) || null,
        sendDate: convertHijriToGregorian(formData.sendDate) || null,
        departmentDate:
          convertHijriToGregorian(formData.departmentDate) || null,
        senderOrg: { id: Number(formData.senderOrgId) },
        receiverOrg: { id: Number(formData.receiverOrgId) },
        description: formData.description?.trim() || null,
        docType: { id: Number(formData.docTypeId) },
      };

      await updateNasharat(nasharat.id, payload);
      toast.success(t("updateSuccess", "معلومات په بریالیتوب تازه شول"));
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Update error:", error);
      const msg =
        error.response?.data?.message ||
        t("updateFailed", "تازه کول ناکام شول");
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!nasharat) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h4" fontWeight="bold">
          {t("editNasharat", "نشرات سمول")}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={2.5}>
              {/* Document Number */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  name="docNo"
                  label={t("docNo", "نمبر مکتوب / پارسل")}
                  value={formData.docNo}
                  onChange={handleInputChange}
                  error={!formData.docNo?.trim()}
                  helperText={
                    !formData.docNo?.trim() ? t("required", "اړین دی") : ""
                  }
                />
              </Grid>

              {/* Document Type */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!formData.docTypeId}>
                  <InputLabel id="doctype-edit-label">
                    {t("docType", "نوعیت پارسل")}
                  </InputLabel>
                  <Select
                    labelId="doctype-edit-label"
                    name="docTypeId"
                    value={formData.docTypeId}
                    label={t("docType", "نوعیت پارسل")}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">
                      <em>{t("selectDocType", "ډول وټاکئ")}</em>
                    </MenuItem>
                    {docTypes.map((dt) => (
                      <MenuItem key={dt.id} value={dt.id}>
                        {dt.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Sender */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!formData.senderOrgId}>
                  <InputLabel id="sender-edit-label">
                    {t("sender", "مرسل (Sender)")}
                  </InputLabel>
                  <Select
                    labelId="sender-edit-label"
                    name="senderOrgId"
                    value={formData.senderOrgId}
                    label={t("sender", "Sender")}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">
                      <em>{t("selectOrg", "سازمان وټاکئ")}</em>
                    </MenuItem>
                    {orgs.map((org) => (
                      <MenuItem key={org.id} value={org.id}>
                        {org.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Receiver */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!formData.receiverOrgId}>
                  <InputLabel id="receiver-edit-label">
                    {t("receiver", "مرسل الیه (Receiver)")}
                  </InputLabel>
                  <Select
                    labelId="receiver-edit-label"
                    name="receiverOrgId"
                    value={formData.receiverOrgId}
                    label={t("receiver", "Receiver")}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">
                      <em>{t("selectOrg", "سازمان وټاکئ")}</em>
                    </MenuItem>
                    {orgs.map((org) => (
                      <MenuItem key={org.id} value={org.id}>
                        {org.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Receive Date */}
              <Grid item xs={12} sm={6}>
                <HijriDatePicker
                  fullWidth
                  size="small"
                  type="date"
                  name="receiveDate"
                  label={t("incomingDate", "تاریخ دریافت")}
                  InputLabelProps={{ shrink: true }}
                  value={formData.receiveDate}
                  onChange={handleHijriDateChange("receiveDate")}
                />
              </Grid>

              {/* Send Date */}
              <Grid item xs={12} sm={6}>
                <HijriDatePicker
                  fullWidth
                  size="small"
                  type="date"
                  name="sendDate"
                  label={t("sendDate", "تاریخ ارسال")}
                  InputLabelProps={{ shrink: true }}
                  value={formData.sendDate}
                  onChange={handleHijriDateChange("sendDate")}
                />
              </Grid>

              {/* Department Date */}
              <Grid item xs={12} sm={6}>
                <HijriDatePicker
                  fullWidth
                  name="departmentDate"
                  type="date"
                  label={t("departmentDate", "تاریخ شعبه")}
                  InputLabelProps={{ shrink: true }}
                  value={formData.departmentDate}
                  onChange={handleHijriDateChange("departmentDate")}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="description"
                  label={t("description", "ملاحظات / Remarks")}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={t("remarksPlaceholder", "...")}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          {t("cancel", "لغوه")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          endIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {isSubmitting
            ? t("saving", "په تمه...")
            : t("saveChanges", "تغییرات خوندي کړئ")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
