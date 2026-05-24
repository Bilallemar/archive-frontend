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

import getShuraAaliResolutionTexts from "../../../helpers/hifziya/ShuraAaliResolutionTexts";
import api from "../../../services/api"; // ✅ add this import
import { updateShuraAaliResolution } from "../../../services/RepositoryManagement/shuraAaliResolutionApi";
import {
  convertGregorianToHijri,
  convertHijriToGregorian,
} from "../../../utils/hijriDateUtils";
import HijriDatePicker from "../../HijriDatePicker";

export default function EditShuraAaliResolutionDialog({
  open,
  onClose,
  resolution,
  onSuccess,
}) {
  const { t } = useTranslation("shuraAali");
  const texts = getShuraAaliResolutionTexts(t);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialType = searchParams.get("type") || "MOSAWABA";
  const validType = ["MOSAWABA", "YADASHT"].includes(initialType)
    ? initialType
    : "MOSAWABA";

  const [formData, setFormData] = useState({
    sendDate: "",
    subject: "",
    senderReference: "",
    title: "",
    resolutionType: "",
    letterNumber: "",
    resolutionNo: "",
    approvalYear: "",
    remarks: "",
    direction: validType,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Cabinet states
  const [cabinets, setCabinets] = useState([]);
  const [floors, setFloors] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [cabinetFiles, setCabinetFiles] = useState([]);
  const [selectedCabinet, setSelectedCabinet] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedShelf, setSelectedShelf] = useState("");
  const [selectedFile, setSelectedFile] = useState("");

  // ✅ Load cabinets once on mount
  useEffect(() => {
    api.get("/cabinet").then((res) => setCabinets(res.data || []));
  }, []);

  // ✅ Load form data + existing cabinet selection when dialog opens
  useEffect(() => {
    if (resolution && open) {
      setFormData({
        sendDate: convertGregorianToHijri(resolution.sendDate) || "",
        subject: resolution.subject || "",
        senderReference: resolution.senderReference || "",
        title: resolution.title || "",
        resolutionType: resolution.resolutionType || "",
        direction: resolution.direction || "MOSAWABA",
        letterNumber: resolution.letterNumber || "",
        resolutionNo: resolution.resolutionNo || "",
        approvalYear: resolution.approvalYear || "",
        remarks: resolution.remarks || "",
      });

      // ✅ Restore cabinet dropdowns if resolution has a cabinetFile
      const loadCabinetData = async () => {
        if (resolution.cabinetFile) {
          const cf = resolution.cabinetFile;
          const shelfId = cf.shelf?.id;
          const floorId = cf.shelf?.floor?.id;
          const cabinetId = cf.shelf?.floor?.cabinet?.id;

          setSelectedFile(String(cf.id));
          setSelectedShelf(String(shelfId));
          setSelectedFloor(String(floorId));
          setSelectedCabinet(String(cabinetId));

          try {
            const [floorsRes, shelvesRes, filesRes] = await Promise.all([
              api.get(`/cabinet/${cabinetId}/floors`),
              api.get(`/cabinet/floors/${floorId}/shelves`),
              api.get(`/cabinet/shelves/${shelfId}/files`),
            ]);
            setFloors(floorsRes.data || []);
            setShelves(shelvesRes.data || []);
            setCabinetFiles(filesRes.data || []);
          } catch {
            console.error("Failed to load cabinet dropdowns");
          }
        } else {
          // Reset cabinet if no existing one
          setSelectedCabinet("");
          setSelectedFloor("");
          setSelectedShelf("");
          setSelectedFile("");
          setFloors([]);
          setShelves([]);
          setCabinetFiles([]);
        }
      };

      loadCabinetData().finally(() => setIsLoading(false));
    }
  }, [resolution, open]);

  // ✅ Cabinet cascade handlers
  const handleCabinetChange = async (e) => {
    const cabinetId = e.target.value;
    setSelectedCabinet(cabinetId);
    setSelectedFloor("");
    setSelectedShelf("");
    setSelectedFile("");
    setFloors([]);
    setShelves([]);
    setCabinetFiles([]);

    if (cabinetId) {
      const res = await api.get(`/cabinet/${cabinetId}/floors`);
      setFloors(res.data || []);
    }
  };

  const handleFloorChange = async (e) => {
    const floorId = e.target.value;
    setSelectedFloor(floorId);
    setSelectedShelf("");
    setSelectedFile("");
    setShelves([]);
    setCabinetFiles([]);

    if (floorId) {
      const res = await api.get(`/cabinet/floors/${floorId}/shelves`);
      setShelves(res.data || []);
    }
  };

  const handleShelfChange = async (e) => {
    const shelfId = e.target.value;
    setSelectedShelf(shelfId);
    setSelectedFile("");
    setCabinetFiles([]);

    if (shelfId) {
      const res = await api.get(`/cabinet/shelves/${shelfId}/files`);
      setCabinetFiles(res.data || []);
    }
  };

  const handleHijriDateChange = (field) => (hijriDate) => {
    setFormData((prev) => ({ ...prev, [field]: hijriDate }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const pageTitle =
    formData.direction === "MOSAWABA"
      ? texts.editResolution || "ویرایش مصوبه"
      : texts.editYadasht || "ویرایش یاداشت";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.subject?.trim()) {
      toast.error(texts.subjectRequired);
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        sendDate: convertHijriToGregorian(formData.sendDate) || null,
        subject: formData.subject.trim(),
        senderReference: formData.senderReference?.trim() || null,
        title: formData.title?.trim() || null,
        resolutionType: formData.resolutionType?.trim() || null,
        direction: formData.direction,
        letterNumber: formData.letterNumber?.trim() || null,
        resolutionNo: formData.resolutionNo?.trim() || null,
        approvalYear: formData.approvalYear
          ? Number(formData.approvalYear)
          : null,
        remarks: formData.remarks?.trim() || null,
        cabinetFile: selectedFile ? { id: parseInt(selectedFile) } : null, // ✅ send selected file
      };

      await updateShuraAaliResolution(resolution.id, payload);
      toast.success(texts.updateSuccess);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Update error:", error);
      const msg = error.response?.data?.message || texts.updateFailed;
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!resolution) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{pageTitle}</DialogTitle>

      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <HijriDatePicker
                  fullWidth
                  size="small"
                  type="date"
                  name="sendDate"
                  label={texts.sendDate || "تاریخ وارده"}
                  InputLabelProps={{ shrink: true }}
                  value={formData.sendDate}
                  onChange={handleHijriDateChange("sendDate")}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  name="subject"
                  label={texts.subject}
                  value={formData.subject}
                  onChange={handleInputChange}
                  error={!formData.subject?.trim()}
                  helperText={!formData.subject?.trim() ? texts.required : ""}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="senderReference"
                  label={texts.senderReference}
                  value={formData.senderReference}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="title"
                  label={texts.title}
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="resolutionType"
                  label={
                    formData.direction === "MOSAWABA"
                      ? "نوع مصوبه"
                      : "نوع یاداشت"
                  }
                  value={formData.resolutionType}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="letterNumber"
                  label={texts.letterNumber}
                  value={formData.letterNumber}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="resolutionNo"
                  label={texts.resolutionNo}
                  value={formData.resolutionNo}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="approvalYear"
                  label={texts.approvalYear}
                  type="number"
                  value={formData.approvalYear}
                  onChange={handleInputChange}
                  inputProps={{ min: 1300, max: 1500 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="remarks"
                  label={texts.remarks}
                  value={formData.remarks}
                  onChange={handleInputChange}
                  placeholder={texts.remarksPlaceholder}
                />
              </Grid>

              {/* ✅ Cabinet Section */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ mb: 1 }}
                >
                 {texts.cabinetAddress || "آدرس کابینه"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>{texts.cabinet || "کابینه (Cabinet)"}</InputLabel>
                  <Select
                    value={String(selectedCabinet)}
                    onChange={handleCabinetChange}
                    label={texts.cabinet || "کابینه (Cabinet)"}
                  >
                    {cabinets.map((c) => (
                      <MenuItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" disabled={!selectedCabinet}>
                  <InputLabel>{texts.floor || "پوړ (Floor)"}</InputLabel>
                  <Select
                    value={String(selectedFloor)}
                    onChange={handleFloorChange}
                    label={texts.floor || "پوړ (Floor)"}
                  >
                    {floors.map((f) => (
                      <MenuItem key={f.id} value={String(f.id)}>
                        {f.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" disabled={!selectedFloor}>
                  <InputLabel>{texts.shelf || "ځای (Shelf)"}</InputLabel>
                  <Select
                    value={String(selectedShelf)}
                    onChange={handleShelfChange}
                    label={texts.shelf || "ځای (Shelf)"}
                  >
                    {shelves.map((s) => (
                      <MenuItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" disabled={!selectedShelf}>
                  <InputLabel>{texts.file || "فایل (File)"}</InputLabel>
                  <Select
                    value={String(selectedFile)}
                    onChange={(e) => setSelectedFile(e.target.value)}
                    label={texts.file || "فایل (File)"}
                  >
                    {cabinetFiles.map((f) => (
                      <MenuItem key={f.id} value={String(f.id)}>
                        {f.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          {texts.cancel}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          endIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {isSubmitting ? texts.saving : texts.saveChanges}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
