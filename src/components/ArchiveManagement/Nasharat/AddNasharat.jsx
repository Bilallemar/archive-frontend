import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
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
import { useNavigate } from "react-router-dom";
import { createNasharat } from "../../../services/ArchiveManagement/NasharatAPI";
import api from "../../../services/api";
import { convertHijriToGregorian } from "../../../utils/hijriDateUtils";
import HijriDatePicker from "../../HijriDatePicker";

export default function AddNasharat() {
  const { t } = useTranslation("nasharat");
  const navigate = useNavigate();

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
        console.error("Error loading dropdowns:", error);
        toast.error(t("loadError", "د معلوماتو لوستل ناکام شول"));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [t]);

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
        departmentDate: convertHijriToGregorian(formData.departmentDate) || null,
        senderOrg: { id: Number(formData.senderOrgId) },
        receiverOrg: { id: Number(formData.receiverOrgId) },
        description: formData.description?.trim() || null,
        docType: { id: Number(formData.docTypeId) },
      };

      await createNasharat(payload);
      toast.success(t("success", "نشرات په بریالیتوب خوندي شول"));
      navigate("/nasharat");
    } catch (err) {
      const msg = err.response?.data?.message || t("error", "خوندي کول ناکام شول");
      toast.error(msg);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1, maxWidth: 1000, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/nasharat")}
        >
          {t("back", "شاته")}
        </Button>
        <Typography variant="h4" fontWeight="bold">
          {t("newNasharat", "نوی نشرات")}
        </Typography>
      </Box>

      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
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
                />
              </Grid>

              {/* Document Type */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!formData.docTypeId}>
                  <InputLabel id="doctype-select-label">
                    {t("docType", "نوعیت پارسل")}
                  </InputLabel>
                  <Select
                    labelId="doctype-select-label"
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
                  <InputLabel id="sender-select-label">
                    {t("sender", "مرسل (Sender)")}
                  </InputLabel>
                  <Select
                    labelId="sender-select-label"
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
                  <InputLabel id="receiver-select-label">
                    {t("receiver", "مرسل الیه (Receiver)")}
                  </InputLabel>
                  <Select
                    labelId="receiver-select-label"
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

              {/* Remarks */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label={t("description", "ملاحظات / Remarks")}
                  multiline
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={t("remarksPlaceholder", "...")}
                  sx={{ "& .MuiInputBase-root": { height: 100 } }}
                />
              </Grid>

              {/* Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/nasharat")}
                    disabled={isSubmitting}
                  >
                    {t("cancel", "لغوه")}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    endIcon={
                      isSubmitting ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <SaveIcon />
                      )
                    }
                  >
                    {isSubmitting ? t("saving", "خوندي کیږي...") : t("save", "خوندي کړئ")}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}