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
import { useLocation } from "react-router-dom";

import getArchiveTexts from "../../../helpers/archive/getArchiveTexts";
import { updateArchive } from "../../../services/ArchiveManagement/ArchiveAPI";
import api from "../../../services/api";
import {
  convertGregorianToHijri,
  convertHijriToGregorian,
} from "../../../utils/hijriDateUtils";
import HijriDatePicker from "../../HijriDatePicker";

export default function EditArchiveDialog({
  open,
  onClose,
  archive,
  onSuccess,
}) {
  const { t } = useTranslation("archive");
  const text = getArchiveTexts(t);
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const initialDirection = searchParams.get("direction") || "INCOMING";
  const validDirection = ["INCOMING", "OUTGOING"].includes(initialDirection)
    ? initialDirection
    : "INCOMING";
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
  const pageTitle =
    validDirection === "INCOMING"
      ? text.newIncoming || "نوې وارده"
      : text.newOutgoing || "نوی صادره";
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
        toast.error(text.loadError || "د معلوماتو لوستل ناکام شول");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [text.loadError]);

  // Populate form when archive changes and dialog opens
  useEffect(() => {
    if (archive && open) {
      setFormData({
        docNo: archive.docNo || "",
        receiveDate: convertGregorianToHijri(archive.receiveDate) || "",
        sendDate: convertGregorianToHijri(archive.sendDate) || "",
        departmentDate: convertGregorianToHijri(archive.departmentDate) || "",
        senderOrgId: archive.senderOrg?.id || "",
        receiverOrgId: archive.receiverOrg?.id || "",
        description: archive.description || "",
        docTypeId: archive.docType?.id || "",
      });
    }
  }, [archive, open]);

  const handleHijriDateChange = (field) => (hijriDate) => {
    setFormData((prev) => ({
      ...prev,
      [field]: hijriDate,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.docNo?.trim()) {
      toast.error(text.docNoRequired || "د مکتوب شمېره اړینه ده");
      setIsSubmitting(false);
      return;
    }
    if (!formData.senderOrgId) {
      toast.error("Sender is required");
      setIsSubmitting(false);
      return;
    }
    if (!formData.receiverOrgId) {
      toast.error("Receiver is required");
      setIsSubmitting(false);
      return;
    }
    if (!formData.docTypeId) {
      toast.error(text.docTypeRequired || "ډاکټر ډول اړین دی");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        docNo: formData.docNo.trim(),
        receiveDate: convertHijriToGregorian(formData.receiveDate) || null,
        departmentDate:
          convertHijriToGregorian(formData.departmentDate) || null,
        senderOrg: { id: Number(formData.senderOrgId) },
        receiverOrg: { id: Number(formData.receiverOrgId) },
        description: formData.description?.trim() || null,
        docType: { id: Number(formData.docTypeId) },
        direction: archive.direction, // ← direction نه بدلوو (read-only)
      };
      if (validDirection === "OUTGOING" && formData.sendDate) {
        payload.sendDate = convertHijriToGregorian(formData.sendDate);
      }
      await updateArchive(archive.id, payload);
      toast.success(text.updateSuccess || "معلومات په بریالیتوب تازه شول");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Update error:", error);
      const msg =
        error.response?.data?.message ||
        text.updateFailed ||
        "تازه کول ناکام شول";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!archive) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {" "}
        <Typography variant="h4" fontWeight="bold">
          {pageTitle}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Direction info (read-only) */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {text.recordTypeForDirection}:{" "}
            <strong>
              {validDirection === "INCOMING"
                ? text.incoming || "Incoming (وارده)"
                : text.outgoing || "Outgoing (صادره)"}
            </strong>
          </Typography>
        </Box>

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
                  label={text.docNo || "نمبر مکتوب / پارسل"}
                  value={formData.docNo}
                  onChange={handleInputChange}
                  error={!formData.docNo?.trim()}
                  helperText={!formData.docNo?.trim() ? text.required : ""}
                />
              </Grid>

              {/* Document Type */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!formData.docTypeId}>
                  <InputLabel id="doctype-edit-label">
                    {text.docType || "نوعیت پارسل"}
                  </InputLabel>
                  <Select
                    labelId="doctype-edit-label"
                    name="docTypeId"
                    value={formData.docTypeId}
                    label={text.docType || "نوعیت پارسل"}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">
                      <em>{text.selectDocType || "ډول وټاکئ"}</em>
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
                    {text.sender || "مرسل (Sender)"}
                  </InputLabel>
                  <Select
                    labelId="sender-edit-label"
                    name="senderOrgId"
                    value={formData.senderOrgId}
                    label={text.sender || "Sender"}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">
                      <em>{text.selectOrg || "سازمان وټاکئ"}</em>
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
                    {text.receiver || "مرسل الیه (Receiver)"}
                  </InputLabel>
                  <Select
                    labelId="receiver-edit-label"
                    name="receiverOrgId"
                    value={formData.receiverOrgId}
                    label={text.receiver || "Receiver"}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">
                      <em>{text.selectOrg || "سازمان وټاکئ"}</em>
                    </MenuItem>
                    {orgs.map((org) => (
                      <MenuItem key={org.id} value={org.id}>
                        {org.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <HijriDatePicker
                  fullWidth
                  size="small"
                  type="date"
                  name="receiveDate"
                  label={text.incomingDate || "تاریخ وارده"}
                  InputLabelProps={{ shrink: true }}
                  value={formData.receiveDate}
                  onChange={handleHijriDateChange("receiveDate")}
                />
              </Grid>

              {/* Send Date */}
              {archive.direction === "OUTGOING" && (
                <Grid item xs={12} sm={6}>
                  <HijriDatePicker
                    fullWidth
                    size="small"
                    type="date"
                    name="sendDate"
                    label={text.outgoingDate || "تاریخ صادره"}
                    InputLabelProps={{ shrink: true }}
                    value={formData.sendDate}
                    onChange={handleHijriDateChange("sendDate")}
                  />
                </Grid>
              )}
              {/* Department Date */}
              <Grid item xs={12} sm={6}>
                <HijriDatePicker
                  fullWidth
                  name="departmentDate"
                  type="date"
                  label={text.departmentDate || "تاریخ شعبه"}
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
                  label={text.description || "ملاحظات / Remarks"}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={text.remarksPlaceholder || "..."}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          {text.cancel || "لغوه"}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          endIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {isSubmitting
            ? text.saving || "په تمه..."
            : text.saveChanges || "تغییرات خوندي کړئ"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
