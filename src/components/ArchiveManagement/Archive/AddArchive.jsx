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
import { useLocation, useNavigate } from "react-router-dom";
import getArchiveTexts from "../../../helpers/archive/getArchiveTexts";
import { createArchive } from "../../../services/ArchiveManagement/ArchiveAPI";
import api from "../../../services/api";
import { convertHijriToGregorian } from "../../../utils/hijriDateUtils";
import HijriDatePicker from "../../HijriDatePicker";

export default function AddArchive({ archive }) {
  const { t } = useTranslation("archive");
  const texts = getArchiveTexts(t);
  const navigate = useNavigate();
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
      ? texts.newIncoming || "نوې وارده"
      : texts.newOutgoing || "نوی صادره";
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
      toast.error(texts.loadError || "Failed to load organizations/types");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      toast.error(texts.docNoRequired || "Document number is required");
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
      toast.error(texts.docTypeRequired || "Document type is required");
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
        direction: validDirection,
      };
      if (validDirection === "OUTGOING" && formData.sendDate) {
        payload.sendDate = convertHijriToGregorian(formData.sendDate);
      }
      await createArchive(payload);
      toast.success(texts.success || "Document registered successfully");
      navigate("/archive");
    } catch (err) {
      const msg =
        err.response?.data?.message || texts.error || "Failed to save";
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
          onClick={() => navigate("/archive")}
        >
          {texts.back || "Back"}
        </Button>
        <Typography variant="h4" fontWeight="bold">
          {pageTitle}
        </Typography>
      </Box>

      {/* <Box sx={{ mb: 1 }}>
        <PageBreadcrumbs />
      </Box> */}

      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Direction info (read-only) */}
              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {texts.recordTypeForDirection}:{" "}
                  <strong>
                    {validDirection === "INCOMING"
                      ? texts.incoming || "Incoming (وارده)"
                      : texts.outgoing || "Outgoing (صادره)"}
                  </strong>
                </Typography>
              </Grid>

              {/* Document Number */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  name="docNo"
                  label={texts.docNo || "Document / Parcel No"}
                  value={formData.docNo}
                  onChange={handleInputChange}
                  error={!formData.docNo?.trim()}
                  // helperText={!formData.docNo?.trim() ? texts.required : ""}
                />
              </Grid>

              {/* Document Type */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!formData.docTypeId}>
                  <InputLabel id="doctype-select-label">
                    {texts.docType || "Parcel Type"}
                  </InputLabel>
                  <Select
                    labelId="doctype-select-label"
                    id="doctype-select"
                    name="docTypeId"
                    value={formData.docTypeId}
                    label={texts.docType || "Parcel Type"}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">
                      <em>{texts.selectDocType || "Select type"}</em>
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
                    {texts.sender || "Sender (مرسل)"}
                  </InputLabel>
                  <Select
                    labelId="sender-select-label"
                    name="senderOrgId"
                    value={formData.senderOrgId}
                    label={texts.sender || "Sender"}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">
                      <em>{texts.selectOrg || "Select organization"}</em>
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
                    {texts.receiver || "Receiver (مرسل الیه)"}
                  </InputLabel>
                  <Select
                    labelId="receiver-select-label"
                    name="receiverOrgId"
                    value={formData.receiverOrgId}
                    label={texts.receiver || "Receiver"}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">
                      <em>{texts.selectOrg || "Select organization"}</em>
                    </MenuItem>
                    {orgs.map((org) => (
                      <MenuItem key={org.id} value={org.id}>
                        {org.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Received Date */}
              {/* {validDirection === "OUTGOING" && (
                <Grid item xs={12} sm={6}>
                  <HijriDatePicker
                    fullWidth
                    name="receiveDate"
                    type="date"
                    label={texts.incomingDate || "Received Date"}
                    InputLabelProps={{ shrink: true }}
                    value={formData.receiveDate}
                    onChange={handleHijriDateChange("receivedDate")}
                  />
                </Grid>
              )} */}

              <Grid item xs={12} md={6}>
                <HijriDatePicker
                  fullWidth
                  size="small"
                  type="date"
                  name="receiveDate"
                  label={texts.incomingDate || "تاریخ دریافت"}
                  InputLabelProps={{ shrink: true }}
                  value={formData.receiveDate}
                  onChange={handleHijriDateChange("receiveDate")}
                />
              </Grid>

              {/* Send Date */}
              {validDirection === "OUTGOING" && (
                <Grid item xs={12} md={6}>
                  <HijriDatePicker
                    fullWidth
                    size="small"
                    type="date"
                    name="sendDate"
                    label={texts.outgoingDate || "تاریخ صادره"}
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
                  label={texts.departmentDate || "Department/Branch Date"}
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
                  label={texts.description || "Remarks / ملاحظات"}
                  multiline
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={texts.remarksPlaceholder || "..."}
                  sx={{
                    "& .MuiInputBase-root": {
                      height: 100,
                    },
                  }}
                />
              </Grid>

              {/* Buttons */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    mt: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/archive")}
                    disabled={isSubmitting}
                  >
                    {texts.cancel || "Cancel"}
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
                    {isSubmitting
                      ? texts.saving || "Saving..."
                      : texts.save || "Save"}
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
