import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import FolderIcon from "@mui/icons-material/Folder";
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
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import getMakhzanWaradaSaderaTexts from "../../../helpers/Storage/MakhzanwSaradasSadera/getMakhzanWaradaSaderaTexts";
import api from "../../../services/api";
import { updateMakhzanWaradaSadera } from "../../../services/StorageManagement/MakhzanWaradaSaderaAPI";
import {
  convertGregorianToHijri,
  convertHijriToGregorian,
} from "../../../utils/hijriDateUtils";
import HijriDatePicker from "../../HijriDatePicker";

export default function EditMakhzanWaradaSaderaDialog({
  open,
  onClose,
  record,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    no: "",
    org: "",
    letterNumber: "",
    incommingDate: "",
    outgoingDate: "",
    summary: "",
    description: "",
    newFiles: [],
  });

  const [orgs, setOrgs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const [existingFiles, setExistingFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detectedFiles, setDetectedFiles] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [docTypes, setDocTypes] = useState([]);
  const [cabinets, setCabinets] = useState([]);
  const [floors, setFloors] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [cabinetFiles, setCabinetFiles] = useState([]);

  const [selectedCabinet, setSelectedCabinet] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedShelf, setSelectedShelf] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const [scannerFiles, setScannerFiles] = useState([]);

  const [scannerFolderPath, setScannerFolderPath] = useState("");
  const { t } = useTranslation("makhzanWaradaSadera");
  const text = getMakhzanWaradaSaderaTexts(t);

  const direction = record?.direction || "INCOMING";

  // Load initial data
  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      try {
        setIsLoading(true);

        const [orgsRes, docTypesRes, scannerPathRes] = await Promise.all([
          api.get("/org"),
          api.get("/doc-type/active"),
          api.get("/scanner-folder/path").catch(() => ({ data: { path: "" } })),
          // We already have record prop, but if needed you can re-fetch
        ]);

        setOrgs(orgsRes.data || []);
        setDocTypes(docTypesRes.data || []);
        setScannerFolderPath(scannerPathRes.data.path || "");

        if (record) {
          const formatDate = (date) =>
            date ? new Date(date).toISOString().split("T")[0] : "";

          setFormData({
            no: record.no || "",
            org: record.org?.id || "",
            letterNumber: record.letterNumber || "",
            incommingDate: convertGregorianToHijri(record.incommingDate),
            outgoingDate: convertGregorianToHijri(record.outgoingDate),
            summary: record.summary || "",
            description: record.description || "",
            subjectType: record.subjectType || "",
            newFiles: [],
          });

  
          setExistingFiles(record.files || []);
          if (record.cabinetFile) {
            const cf = record.cabinetFile;
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
        }
      } catch (err) {
        console.error(err);
        toast.error(text.loadError || "Error loading data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [open, record, text.loadError]);
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

  const handleScan = async () => {
    try {
      setIsScanning(true);
      const response = await api.get("/scanner-folder/files");
      setDetectedFiles(response.data || []);
      if (response.data.length === 0) {
        toast.info(text.noFilesInScanner || "No files found in scanner folder");
      } else {
        toast.success(
          `${response.data.length} ${text.filesDetected || "files detected"}`,
        );
      }
    } catch (error) {
      console.error("Failed to scan folder", error);
      toast.error(text.scanError || "Error scanning folder");
    } finally {
      setIsScanning(false);
    }
  };

  const handleLoadFromScanner = () => {
    if (!detectedFiles.length) return;
    setScannerFiles(detectedFiles.map((f) => f.name));
    setDetectedFiles([]);
    toast.success(
      `${detectedFiles.length} ${text.loadSuccess || "فایلونه چمتو دي"}`,
    );
  };
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
      text.fileRemovedLocally ||
        "File removed from list (not deleted from server yet)",
      {
        duration: 4000,
        position: "top-right", // optional - adjust if needed
      },
    );
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.no.trim()) {
      toast.error(text.missingFields || "Number is required");
      setIsSubmitting(false);
      return;
    }
    if (!formData.org) {
      toast.error(text.missingFields || "Organization is required");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        no: formData.no.trim(),
        org: { id: parseInt(formData.org) },
        letterNumber: formData.letterNumber.trim() || null,
        incommingDate: convertHijriToGregorian(formData.incommingDate) || null,
        summary: formData.summary.trim() || null,
        subjectType: formData.subjectType || null,
        cabinetFile: selectedFile ? { id: parseInt(selectedFile) } : null,

        description: formData.description.trim() || null,
        direction: direction,
      };

      if (direction === "OUTGOING" && formData.outgoingDate) {
        payload.outgoingDate = convertHijriToGregorian(formData.outgoingDate);
      }

      if (formData.docTypeId && formData.docTypeId !== "") {
        payload.docType = { id: parseInt(formData.docTypeId) };
      }

      const formDataToSend = new FormData();
      formDataToSend.append("makhzanWaradaSadera", JSON.stringify(payload));

      formData.newFiles.forEach((file) => {
        formDataToSend.append("fileURL", file);
      });
      formDataToSend.append("scannerFiles", JSON.stringify(scannerFiles));
      await updateMakhzanWaradaSadera(record.id, formDataToSend);

      toast.success(text.updateSuccess || "Record updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
      const errMsg =
        error.response?.data?.message || text.updateError || "Update failed";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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
            {text.editTitle || "Edit Record"}
          </Typography>
          <Box
            sx={{
              px: 2,
              py: 0.5,
              borderRadius: "999px",
              fontSize: "0.9rem",
              fontWeight: 600,
              backgroundColor: direction === "INCOMING" ? "#4CAF50" : "#2196F3",
              color: "white",
            }}
          >
            {direction === "INCOMING"
              ? text.incoming || "وارده"
              : text.outgoing || "صادره"}
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* LEFT – Scanner + Files */}
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
                          {text.scannerStatus || "Scanner Status"}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {detectedFiles.length > 0
                            ? `${detectedFiles.length} ${text.existingFiles || "files found"}`
                            : text.scanButtonInfo ||
                              "Click scan to detect files"}
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
                              {text.scanning || "Scanning..."}
                            </>
                          ) : (
                            text.scan || "Scan"
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
                          {text.loadFiles || "Load Files"}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Detected Files */}
                  {detectedFiles.length > 0 && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ mb: 1 }}
                      >
                        {text.detectedFiles || "Detected Files"}
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

                  {/* Existing Files */}
                  {existingFiles.length > 0 && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {text.existingFiles || "Existing Files"} (
                        {existingFiles.length})
                      </Typography>
                      <Stack
                        spacing={0.8}
                        sx={{ maxHeight: 180, overflowY: "auto" }}
                      >
                        {existingFiles.map((file) => (
                          <Chip
                            key={file.id}
                            label={file.fileName || file.name || "file"}
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
                  {/* New Files + Manual Upload */}
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<AttachFileIcon />}
                  >
                    {text.addNewFiles || "Add New Files"}
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx"
                    />
                  </Button>

                  {formData.newFiles.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        {text.newFilesAdded || "New files to upload"} (
                        {formData.newFiles.length})
                      </Typography>
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
                            sx={{ justifyContent: "flex-start" }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {existingFiles.length === 0 &&
                    formData.newFiles.length === 0 && (
                      <Alert
                        severity="info"
                        icon={<FolderIcon />}
                        sx={{ mt: 2 }}
                      >
                        {text.noFilesAttached || "No files attached yet"}
                      </Alert>
                    )}
                </Stack>
              </Grid>

              {/* RIGHT – Form Fields */}
              <Grid item xs={12} md={8}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="no"
                      label={text.no || "شمېره"}
                      value={formData.no}
                      onChange={handleInputChange}
                      required
                      error={!formData.no.trim()}
                      helperText={!formData.no.trim() ? text.required : ""}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      size="small"
                      required
                      error={!formData.org}
                    >
                      <InputLabel>{text.org || "اداره"}</InputLabel>
                      <Select
                        name="org"
                        value={formData.org}
                        label={text.org || "اداره"}
                        onChange={handleInputChange}
                      >
                        {orgs.map((org) => (
                          <MenuItem key={org.id} value={org.id}>
                            {org.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="letterNumber"
                      label={text.letterNumber || "شمېره مکتوب"}
                      value={formData.letterNumber}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="subjectType"
                      label={text.subjectType || "د موضع ډول"}
                      value={formData.subjectType}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <HijriDatePicker
                      fullWidth
                      size="small"
                      type="date"
                      name="incommingDate"
                      label={text.incommingDate || "تاریخ وارده"}
                      InputLabelProps={{ shrink: true }}
                      value={formData.incommingDate}
                      onChange={handleHijriDateChange("incommingDate")}
                    />
                  </Grid>

                  {direction === "OUTGOING" && (
                    <Grid item xs={12} sm={6}>
                      <HijriDatePicker
                        fullWidth
                        size="small"
                        type="date"
                        name="outgoingDate"
                        label={text.outgoingDate || "تاریخ صادره"}
                        InputLabelProps={{ shrink: true }}
                        value={formData.outgoingDate}
                        onChange={handleHijriDateChange("outgoingDate")}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="summary"
                      label={text.summary || "لنډیز"}
                      value={formData.summary}
                      onChange={handleInputChange}
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
                      <InputLabel>{text.cabinet || "کابینه (Cabinet)"}</InputLabel>
                      <Select
                        value={String(selectedCabinet)}
                        onChange={handleCabinetChange}
                        label={text.cabinet || "کابینه (Cabinet)"}
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
                      <InputLabel>{text.floor || "پوړ (Floor)"}</InputLabel>
                      <Select
                        value={String(selectedFloor)}
                        onChange={handleFloorChange}
                        label={text.floor || "پوړ (Floor)"}
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
                      <InputLabel>{text.shelf || "ځای (Shelf)"}</InputLabel>
                      <Select
                        value={String(selectedShelf)}
                        onChange={handleShelfChange}
                        label={text.shelf || "ځای (Shelf)"}
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
                      <InputLabel>{text.file || "فایل (File)"}</InputLabel>
                      <Select
                        value={String(selectedFile)}
                        onChange={(e) => setSelectedFile(e.target.value)}
                        label={text.file || "فایل (File)"}
                      >
                        {cabinetFiles.map((f) => (
                          <MenuItem key={f.id} value={String(f.id)}>
                            {f.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={4}
                      name="description"
                      label={text.description || "ملاحظات"}
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

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={isSubmitting}>
          {text.cancel || "لغوه"}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />
          }
          sx={{
            bgcolor: direction === "INCOMING" ? "#4CAF50" : "#2196F3",
            "&:hover": {
              bgcolor: direction === "INCOMING" ? "#45a049" : "#1976D2",
            },
          }}
        >
          {isSubmitting
            ? text.saving || "ذخیره کیږي..."
            : text.saveChanges || "ذخیره کول"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
