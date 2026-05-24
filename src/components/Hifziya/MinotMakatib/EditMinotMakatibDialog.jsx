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
import api from "../../../services/api";
import { updateMinotMakatib } from "../../../services/RepositoryManagement/MinotMakatibAPI";
import { useTranslation } from "react-i18next";
import getMinotMakatibTexts from "../../../helpers/hifziya/MinotMakatib/MinotMakatibTexts";

export default function EditMinotMakatibDialog({ open, onClose, minotMakatib, onSuccess }) {
  const [formData, setFormData] = useState({
    cartonNumber: "",
    letterNumber: "",
    year: "",
    subject: "",
    org: "",
    description: "",
    newFiles: [],
  });
const { t } = useTranslation("minotMakatib");
  const text = getMinotMakatibTexts(t);
  const [orgs, setOrgs] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [detectedFiles, setDetectedFiles] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerFiles, setScannerFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cabinet states
  const [cabinets, setCabinets] = useState([]);
  const [floors, setFloors] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [cabinetFiles, setCabinetFiles] = useState([]);
  const [selectedCabinet, setSelectedCabinet] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedShelf, setSelectedShelf] = useState("");
  const [selectedFile, setSelectedFile] = useState("");

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const [orgsRes, cabinetsRes] = await Promise.all([
          api.get("/org"),
          api.get("/cabinet"),
        ]);
        setOrgs(orgsRes.data || []);
        setCabinets(cabinetsRes.data || []);

        if (minotMakatib) {
          setFormData({
            cartonNumber: minotMakatib.cartonNumber || "",
            letterNumber: minotMakatib.letterNumber || "",
            year: minotMakatib.year || "",
            subject: minotMakatib.subject || "",
            org: minotMakatib.org?.id || "",
            description: minotMakatib.description || "",
            newFiles: [],
          });
          setExistingFiles(minotMakatib.files || []);

          // Load existing cabinet address
          if (minotMakatib.cabinetFile) {
            const cf = minotMakatib.cabinetFile;
            const shelfId = cf.shelf?.id;
            const floorId = cf.shelf?.floor?.id;
            const cabinetId = cf.shelf?.floor?.cabinet?.id;

            setSelectedFile(String(cf.id));
            setSelectedShelf(String(shelfId));
            setSelectedFloor(String(floorId));
            setSelectedCabinet(String(cabinetId));

            const [floorsRes, shelvesRes, filesRes] = await Promise.all([
              api.get(`/cabinet/${cabinetId}/floors`),
              api.get(`/cabinet/floors/${floorId}/shelves`),
              api.get(`/cabinet/shelves/${shelfId}/files`),
            ]);
            setFloors(floorsRes.data || []);
            setShelves(shelvesRes.data || []);
            setCabinetFiles(filesRes.data || []);
          }
        }
      } catch (err) {
        toast.error(text.loadError);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [open, minotMakatib]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const res = await api.get("/scanner-folder/files");
      setDetectedFiles(res.data || []);
      toast[res.data.length ? "success" : "info"](`${res.data.length} ${text.scanSuccess}`);
    } catch {
      toast.error(text.scanError);
    } finally {
      setIsScanning(false);
    }
  };

  const handleLoadFromScanner = () => {
    if (!detectedFiles.length) return toast.error(text.noFilesDetected);
    setScannerFiles(detectedFiles.map((f) => f.name));
    setDetectedFiles([]);
    toast.success(`${detectedFiles.length} ${text.filesLoaded}`);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({ ...prev, newFiles: [...prev.newFiles, ...files] }));
  };

  const handleRemoveNewFile = (index) =>
    setFormData((prev) => ({ ...prev, newFiles: prev.newFiles.filter((_, i) => i !== index) }));

  const handleRemoveExistingFile = (fileId) => {
    setExistingFiles((prev) => prev.filter((f) => f.id !== fileId));
    toast.success(text.fileRemoved);
  };

  const handleCabinetChange = async (e) => {
    const cabinetId = e.target.value;
    setSelectedCabinet(cabinetId);
    setSelectedFloor(""); setSelectedShelf(""); setSelectedFile("");
    setFloors([]); setShelves([]); setCabinetFiles([]);
    if (cabinetId) {
      const res = await api.get(`/cabinet/${cabinetId}/floors`);
      setFloors(res.data || []);
    }
  };

  const handleFloorChange = async (e) => {
    const floorId = e.target.value;
    setSelectedFloor(floorId);
    setSelectedShelf(""); setSelectedFile("");
    setShelves([]); setCabinetFiles([]);
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
    if (!formData.cartonNumber.trim()) {
      toast.error(text.required);
      return;
    }
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      const payload = {
        cartonNumber: formData.cartonNumber.trim(),
        letterNumber: formData.letterNumber.trim() || null,
        year: formData.year ? parseInt(formData.year) : null,
        subject: formData.subject.trim() || null,
        org: formData.org ? { id: parseInt(formData.org) } : null,
        description: formData.description.trim() || null,
        cabinetFile: selectedFile ? { id: parseInt(selectedFile) } : null,
      };
      fd.append("minotMakatib", JSON.stringify(payload));
      formData.newFiles.forEach((file) => fd.append("fileURL", file));
      fd.append("scannerFiles", JSON.stringify(scannerFiles));
      await updateMinotMakatib(minotMakatib.id, fd);
      toast.success(text.updateSuccess);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(text.updateError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h5" fontWeight="bold">{text.editTitle} </Typography>
          <Box sx={{ px: 2, py: 0.5, borderRadius: "999px", fontSize: "0.9rem", fontWeight: 600, bgcolor: "#2196F3", color: "white" }}>
            {text.title || "سمون"}
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* LEFT — Scanner & Files */}
              <Grid item xs={12} md={4}>
                <Stack spacing={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: "center", py: 3 }}>
                      <Badge badgeContent={detectedFiles.length} color="success" sx={{ mb: 2 }}>
                        <FolderIcon sx={{ fontSize: 50, color: "primary.main" }} />
                      </Badge>
                      <Typography variant="h6" gutterBottom>{text.scannerMode}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {detectedFiles.length > 0 ? `${detectedFiles.length} ${text.files}` : `${text.clickToScan}`}
                      </Typography>
                      <Button variant="outlined" fullWidth startIcon={<ScannerIcon />} onClick={handleScan} disabled={isScanning} sx={{ mb: 1 }}>
                        {isScanning ? <><CircularProgress size={16} sx={{ mr: 1 }} />{text.scanning}...</> : `${text.scan}`}

                      </Button>
                      <Button
                        variant="contained" fullWidth startIcon={<AttachFileIcon />}
                        onClick={handleLoadFromScanner} disabled={!detectedFiles.length}
                        sx={{ bgcolor: "#4CAF50", "&:hover": { bgcolor: "#45a049" } }}
                      >
                        {text.loadFromScanner}
                      </Button>
                    </CardContent>
                  </Card>

                  {scannerFiles.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                       {text.scannerFiles} ({scannerFiles.length})
                      </Typography>
                      <Stack spacing={0.5} sx={{ maxHeight: 150, overflowY: "auto" }}>
                        {scannerFiles.map((name, i) => (
                          <Chip
                            key={i} label={name} size="small"
                            onDelete={() => setScannerFiles((prev) => prev.filter((_, idx) => idx !== i))}
                            sx={{ bgcolor: "#4CAF50", color: "#fff", "& .MuiChip-deleteIcon": { color: "#fff" } }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {existingFiles.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {text.existingFiles}({existingFiles.length})
                      </Typography>
                      <Stack spacing={0.8} sx={{ maxHeight: 180, overflowY: "auto" }}>
                        {existingFiles.map((file) => (
                          <Chip
                            key={file.id}
                            label={file.fileName || "فایل"}
                            size="small"
                            icon={<AttachFileIcon />}
                            onDelete={() => handleRemoveExistingFile(file.id)}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <Button variant="outlined" component="label" fullWidth startIcon={<AttachFileIcon />}>
                    {text.uploadNew}
                    <input type="file" hidden multiple onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx" />
                  </Button>

                  {formData.newFiles.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        {text.newFiles}({formData.newFiles.length})
                      </Typography>
                      <Stack spacing={0.8} sx={{ maxHeight: 180, overflowY: "auto" }}>
                        {formData.newFiles.map((file, i) => (
                          <Chip key={i} label={file.name} size="small" color="success" onDelete={() => handleRemoveNewFile(i)} />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {existingFiles.length === 0 && formData.newFiles.length === 0 && (
                    <Alert severity="info" icon={<FolderIcon />}>{text.noFilesAttached}</Alert>
                  )}
                </Stack>
              </Grid>

              {/* RIGHT — Form Fields */}
              <Grid item xs={12} md={8}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" required name="cartonNumber" label={text.cartonNumber}
                      value={formData.cartonNumber} onChange={handleInputChange} error={!formData.cartonNumber.trim()} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" name="letterNumber" label={text.letterNumber}
                      value={formData.letterNumber} onChange={handleInputChange} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" name="year" label={text.year} type="number"
                      value={formData.year} onChange={handleInputChange} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{text.org}</InputLabel>
                      <Select name="org" value={formData.org} onChange={handleInputChange} label={text.org}>
                        {orgs.map((o) => (
                          <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField fullWidth size="small" name="subject" label={text.subject}
                      value={formData.subject} onChange={handleInputChange} />
                  </Grid>

                  {/* Cabinet Address */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                      {text.cabinetAddress}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{text.cabinet}</InputLabel>
                      <Select value={String(selectedCabinet)} onChange={handleCabinetChange} label={text.cabinet}>
                        {cabinets.map((c) => (
                          <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small" disabled={!selectedCabinet}>
                      <InputLabel>{text.floor}</InputLabel>
                      <Select value={String(selectedFloor)} onChange={handleFloorChange} label={text.floor}>
                        {floors.map((f) => (
                          <MenuItem key={f.id} value={String(f.id)}>{f.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small" disabled={!selectedFloor}>
                      <InputLabel>{text.shelf}</InputLabel>
                      <Select value={String(selectedShelf)} onChange={handleShelfChange} label={text.shelf}>
                        {shelves.map((s) => (
                          <MenuItem key={s.id} value={String(s.id)}>{s.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small" disabled={!selectedShelf}>
                      <InputLabel>{text.file}</InputLabel>
                      <Select value={String(selectedFile)} onChange={(e) => setSelectedFile(e.target.value)} label={text.file}>
                        {cabinetFiles.map((f) => (
                          <MenuItem key={f.id} value={String(f.id)}>{f.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField fullWidth size="small" multiline rows={4} name="description" label={text.description}
                      value={formData.description} onChange={handleInputChange} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={isSubmitting}>{text.cancel}</Button>
        <Button
          onClick={handleSubmit} variant="contained" disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
          sx={{ bgcolor: "#2196F3", "&:hover": { bgcolor: "#1976D2" } }}
        >
          {isSubmitting ? text.saving : text.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
}