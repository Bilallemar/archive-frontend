import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOffIcon from "@mui/icons-material/FolderOff";
import SaveIcon from "@mui/icons-material/Save";
import ScannerIcon from "@mui/icons-material/Scanner";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import getMakzanReceiptTexts from "../../../helpers/Storage/MakzanReceipt/MakzanReceiptText";
import api from "../../../services/api";
import { updateReceipt } from "../../../services/StorageManagement/MakzanReceiptAPI";
import {
  convertGregorianToHijri,
  convertHijriToGregorian,
} from "../../../utils/hijriDateUtils";
import HijriDatePicker from "../../HijriDatePicker";
export default function EditReceiptDialog({
  open,
  onClose,
  receipt,
  onSuccess,
}) {
  const { t } = useTranslation("makzanReceipt");
  const texts = getMakzanReceiptTexts(t);

  const [formData, setFormData] = useState({
    docNo: "",
    department: "",
    org: "",
    letterNo: "",
    letterDate: "",
    subjectType: "",
    description: "",
    newFiles: [],
  });

  const [orgs, setOrgs] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);

  const [detectedFiles, setDetectedFiles] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerFiles, setScannerFiles] = useState([]);
  const [scannerFolderPath, setScannerFolderPath] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [cabinets, setCabinets] = useState([]);
  const [floors, setFloors] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [cabinetFiles, setCabinetFiles] = useState([]);

  const [selectedCabinet, setSelectedCabinet] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedShelf, setSelectedShelf] = useState("");
  const [selectedFile, setSelectedFile] = useState("");

  const isInitialLoad = useRef(true);

  // ─── Load data when dialog opens ───────────────────────────────────────────
  useEffect(() => {
    if (!open || !receipt) return;

    isInitialLoad.current = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [orgsRes, scannerPathRes] = await Promise.all([
          api.get("/org"),
          api.get("/scanner-folder/path").catch(() => ({ data: { path: "" } })),
        ]);

        setOrgs(orgsRes.data || []);
        setScannerFolderPath(scannerPathRes.data?.path || "");

        setFormData({
          docNo: receipt.docNo || "",
          department: receipt.department || "",
          org: receipt.org?.id || "",
          letterNo: receipt.letterNo || "",
          letterDate: convertGregorianToHijri(receipt.letterDate) || "",
          subjectType: receipt.subjectType || "",
          description: receipt.description || "",
          newFiles: [],
        });

        if (receipt.cabinetFile) {
          const cf = receipt.cabinetFile;
          const shelfId = cf.shelf?.id;
          const floorId = cf.shelf?.floor?.id;
          const cabinetId = cf.shelf?.floor?.cabinet?.id;

          setSelectedFile(String(cf.id));
          setSelectedShelf(String(shelfId));
          setSelectedFloor(String(floorId));
          setSelectedCabinet(String(cabinetId));

          // Load the dropdown options so they are populated
          try {
            const [floorsRes, shelvesRes, filesRes, cabinetsRes] =
              await Promise.all([
                api.get(`/cabinet/${cabinetId}/floors`),
                api.get(`/cabinet/floors/${floorId}/shelves`),
                api.get(`/cabinet/shelves/${shelfId}/files`),
                api.get("/cabinet"),
              ]);
            setCabinets(cabinetsRes.data || []);
            setFloors(floorsRes.data || []);
            setShelves(shelvesRes.data || []);
            setCabinetFiles(filesRes.data || []);
          } catch (err) {
            console.error("Failed to load cabinet data", err);
          }
        } else {
          // No cabinet yet — just load the cabinets list
          const cabinetsRes = await api.get("/cabinet");
          setCabinets(cabinetsRes.data || []);
        }
      } catch (err) {
        console.error(err);
        toast.error(text.loadError || "Error loading data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [open, receipt, texts.loadError]);

  // ─── Input change ───────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
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
  // ─── Scanner ────────────────────────────────────────────────────────────────
  const handleScan = async () => {
    setIsScanning(true);
    try {
      const response = await api.get("/scanner-folder/files");
      setDetectedFiles(response.data || []);
      if (response.data.length === 0) {
        toast.info(texts.noFilesFound || "هیڅ فایل ونه موندل شو");
      } else {
        toast.success(
          `${response.data.length} ${texts.filesDetected || "فایلونه وموندل شول"}`,
        );
      }
    } catch (error) {
      toast.error(texts.scanError || "د سکین کولو کې ستونزه");
    } finally {
      setIsScanning(false);
    }
  };
  const handleHijriDateChange = (field) => (hijriDate) => {
    setFormData((prev) => ({
      ...prev,
      [field]: hijriDate,
    }));
  };
  const handleLoadFromScanner = () => {
    if (!detectedFiles.length) return;
    setScannerFiles(detectedFiles.map((f) => f.name));
    setDetectedFiles([]);
    toast.success(
      `${detectedFiles.length} ${text.loadSuccess || "فایلونه چمتو دي"}`,
    );
  };

  // ─── File handlers ──────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      newFiles: [...prev.newFiles, ...selected],
    }));
  };

  const handleRemoveNewFile = (index) =>
    setFormData((prev) => ({
      ...prev,
      newFiles: prev.newFiles.filter((_, i) => i !== index),
    }));

  const handleRemoveExistingFile = (fileId) => {
    setExistingFiles((prev) => prev.filter((f) => f.id !== fileId));
    toast.success(
      texts.fileRemovedLocally ||
        "فایل له لیست لرې شو (له سرور نه نه دی حذف شوی)",
    );
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.department || !formData.org) {
      toast.error(texts.requiredField || "شعبه او اداره اړین دي");
      setIsSubmitting(false);
      return;
    }

    try {
      const receiptData = {
        docNo: formData.docNo,
        department: formData.department,
        org: { id: formData.org },
        letterNo: formData.letterNo,
        letterDate: convertHijriToGregorian(formData.letterDate),
        subjectType: formData.subjectType,
        cabinetFile: selectedFile ? { id: parseInt(selectedFile) } : null,
        description: formData.description,
      };

      const formDataToSend = new FormData();
      formDataToSend.append("receipts", JSON.stringify(receiptData));

      formData.newFiles.forEach((file) => {
        formDataToSend.append("fileURL", file);
      });
      formDataToSend.append("scannerFiles", JSON.stringify(scannerFiles));
      await updateReceipt(receipt.id, formDataToSend);
      toast.success(texts.updateSuccess || "معلومات په بریالیتوب سره تازه شول");
      onSuccess?.();
      onClose();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "د تازه کولو پر مهال ستونزه رامنځته شوه";
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      {/* Title */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            {texts.editReceiptTitle || "د مخزن رسید تازه کول"}
          </Typography>
          {receipt && (
            <Chip
              label={`ID: ${receipt.id}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent dividers sx={{ p: 3 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* ── LEFT: Scanner + Files ── */}
              <Grid item xs={12} md={4}>
                <Stack spacing={3}>
                  {/* Scanner Card */}
                  {scannerFolderPath && (
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: "center", py: 3 }}>
                        <Badge
                          badgeContent={detectedFiles.length}
                          color="success"
                          sx={{ mb: 2 }}
                        >
                          <FolderIcon
                            sx={{ fontSize: 50, color: "primary.main" }}
                          />
                        </Badge>
                        <Typography variant="h6" gutterBottom>
                          {texts.scannerFolderTitle || "د سکینر فولدر"}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {detectedFiles.length > 0
                            ? `${detectedFiles.length} ${texts.filesDetected || "فایلونه وموندل شول"}`
                            : texts.clickToScan || "د فایلونو لپاره سکین کړئ"}
                        </Typography>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<ScannerIcon />}
                          onClick={handleScan}
                          disabled={isScanning}
                          sx={{ mb: 1 }}
                        >
                          {isScanning ? (
                            <>
                              <CircularProgress size={16} sx={{ mr: 1 }} />
                              {texts.scanning || "سکین کیږي..."}
                            </>
                          ) : (
                            texts.scanButton || "سکین کړئ"
                          )}
                        </Button>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<AttachFileIcon />}
                          onClick={handleLoadFromScanner}
                          disabled={detectedFiles.length === 0}
                          sx={{
                            bgcolor: "#4CAF50",
                            "&:hover": { bgcolor: "#45a049" },
                          }}
                        >
                          {texts.loadFiles || "فایلونه پورته کړئ"}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Detected Files from Scanner */}
                  {detectedFiles.length > 0 && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ mb: 1 }}
                      >
                        {texts.detectedFiles || "موندل شوي فایلونه"}
                      </Typography>
                      <Box sx={{ maxHeight: 180, overflowY: "auto" }}>
                        <Stack spacing={0.5}>
                          {detectedFiles.map((file, idx) => (
                            <Chip
                              key={idx}
                              label={file.name}
                              size="small"
                              icon={<AttachFileIcon />}
                              sx={{ justifyContent: "flex-start" }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    </Box>
                  )}

                  {/* Existing Files on Server */}
                  {existingFiles.length > 0 && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {texts.existingFiles || "موجوده فایلونه"} (
                        {existingFiles.length})
                      </Typography>
                      <Stack
                        spacing={0.8}
                        sx={{ maxHeight: 180, overflowY: "auto" }}
                      >
                        {existingFiles.map((file) => (
                          <Chip
                            key={file.id}
                            label={
                              file.filePath?.split("/").pop() ||
                              file.fileName ||
                              file.name ||
                              "file"
                            }
                            size="small"
                            icon={<AttachFileIcon />}
                            onDelete={() => handleRemoveExistingFile(file.id)}
                            color="default"
                            sx={{ justifyContent: "flex-start" }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                  {scannerFiles.length > 0 && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ mb: 1 }}
                      >
                        د سکینر فایلونه ({scannerFiles.length})
                      </Typography>
                      <Stack
                        spacing={0.5}
                        sx={{ maxHeight: 150, overflowY: "auto" }}
                      >
                        {scannerFiles.map((name, index) => (
                          <Chip
                            key={index}
                            label={name}
                            onDelete={() =>
                              setScannerFiles((prev) =>
                                prev.filter((_, i) => i !== index),
                              )
                            }
                            size="small"
                            sx={{
                              backgroundColor: "#4CAF50",
                              color: "#ffffff",
                              "& .MuiChip-deleteIcon": { color: "#ffffff" },
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                  {/* Manual Upload Button */}
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<AttachFileIcon />}
                  >
                    {texts.addNewFiles || "نوي فایلونه اضافه کړئ"}
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx"
                    />
                  </Button>

                  {/* New Files to Upload */}
                  {formData.newFiles.length > 0 && (
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          {texts.readyToUpload || "د اپلوډ لپاره چمتو"} (
                          {formData.newFiles.length})
                        </Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, newFiles: [] }))
                          }
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Stack
                        spacing={0.8}
                        sx={{ maxHeight: 180, overflowY: "auto" }}
                      >
                        {formData.newFiles.map((file, idx) => (
                          <Chip
                            key={idx}
                            label={file.name}
                            size="small"
                            color="success"
                            onDelete={() => handleRemoveNewFile(idx)}
                            sx={{
                              justifyContent: "flex-start",
                              "& .MuiChip-label": {
                                maxWidth: 150,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              },
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* No files at all */}
                  {existingFiles.length === 0 &&
                    formData.newFiles.length === 0 && (
                      <Alert severity="info" icon={<FolderOffIcon />}>
                        {texts.noFilesAttached || "هیڅ فایل ضمیمه شوی نه دی"}
                      </Alert>
                    )}
                </Stack>
              </Grid>

              {/* ── RIGHT: Form Fields ── */}
              <Grid item xs={12} md={8}>
                <Grid container spacing={2.5}>
                  {/* Department */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="department"
                      label={texts.department || "شعبه"}
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                      error={!formData.department}
                      helperText={
                        !formData.department ? texts.required || "اړین دی" : ""
                      }
                    />
                  </Grid>

                  {/* Document Number */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="docNo"
                      label={texts.documentNo || "د آرشیف نمبر"}
                      value={formData.docNo}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  {/* Letter Number */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="letterNo"
                      label={texts.letterNumber || "د مکتوب نمبر"}
                      value={formData.letterNo}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  {/* Organization */}
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      size="small"
                      required
                      error={!formData.org}
                    >
                      <InputLabel>{texts.organization || "اداره"}</InputLabel>
                      <Select
                        name="org"
                        value={formData.org}
                        onChange={handleInputChange}
                        label={texts.organization || "اداره"}
                      >
                        <MenuItem value="">
                          <em>{texts.selectOrg || "اداره وټاکئ"}</em>
                        </MenuItem>
                        {orgs.length === 0 ? (
                          <MenuItem disabled>
                            {texts.loading || "بارول..."}
                          </MenuItem>
                        ) : (
                          orgs.map((org) => (
                            <MenuItem key={org.id} value={org.id}>
                              {org.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Subject Type */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="subjectType"
                      label={texts.subjectTypeLabel || "د موضوع ډول"}
                      value={formData.subjectType}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  {/* Letter Date */}
                  <Grid item xs={12} sm={6}>
                    <HijriDatePicker
                      fullWidth
                      size="small"
                      name="letterDate"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      label={texts.letterDateLabel || "د مکتوب نیټه"}
                      value={formData.letterDate}
                      onChange={handleHijriDateChange("letterDate")}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      sx={{ mb: 1 }}
                    >
                                          {text.cabinetAddress|| "پته کابینه (Cabinet Location)"}

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
                    <FormControl
                      fullWidth
                      size="small"
                      disabled={!selectedCabinet}
                    >
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
                    <FormControl
                      fullWidth
                      size="small"
                      disabled={!selectedFloor}
                    >
                      <InputLabel>{texts.shelf || "شف (Shelf)"}</InputLabel>
                      <Select
                        value={String(selectedShelf)}
                        onChange={handleShelfChange}
                        label={texts.shelf || "شف (Shelf)"}
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
                    <FormControl
                      fullWidth
                      size="small"
                      disabled={!selectedShelf}
                    >
                      <InputLabel>{texts.file || "اسناد (File)"}</InputLabel>
                      <Select
                        value={String(selectedFile)}
                        onChange={(e) => setSelectedFile(e.target.value)}
                        label={texts.file || "اسناد (File)"}
                      >
                        {cabinetFiles.map((f) => (
                          <MenuItem key={f.id} value={String(f.id)}>
                            {f.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {/* Description */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={4}
                      name="description"
                      label={texts.description || "ملاحظات"}
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={isSubmitting}>
          {texts.cancel || "لغوه"}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || isLoading}
          startIcon={
            isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />
          }
          sx={{ bgcolor: "#2196F3", "&:hover": { bgcolor: "#1976D2" } }}
        >
          {isSubmitting
            ? texts.saving || "ذخیره کیږي..."
            : texts.save || "ذخیره کول"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
