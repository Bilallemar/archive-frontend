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
import getAddHazariTexts from "../../../helpers/hifziya/hazari/AddHazariText";
import { updateHifziyaHazari } from "../../../services/RepositoryManagement/HifziyaHazariAPI";
import api from "../../../services/api";

export default function EditHazariDialog({ open, onClose, hazari, onSuccess }) {
  const { t } = useTranslation("addHazari");
  const text = getAddHazariTexts(t);

  const [formData, setFormData] = useState({
    volume: "",
    type: "",
    subType: "",
    year: "",
    org: "",
    description: "",
    newFiles: [],
  });

  const [types, setTypes] = useState([]);
  const [subTypes, setSubTypes] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingFiles, setExistingFiles] = useState([]);
  const [scannerFolderPath, setScannerFolderPath] = useState("");
  const [detectedFiles, setDetectedFiles] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerFiles, setScannerFiles] = useState([]);
  const [cabinets, setCabinets] = useState([]);
  const [floors, setFloors] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [cabinetFiles, setCabinetFiles] = useState([]);

  const [selectedCabinet, setSelectedCabinet] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedShelf, setSelectedShelf] = useState("");
  const [selectedFile, setSelectedFile] = useState("");

  // Load data when dialog opens
  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [typesRes, orgsRes, cabinetsRes, scannerPathRes] =
          await Promise.all([
            api.get("/type"),
            api.get("/org"),
            api.get("/cabinet"),
            api
              .get("/scanner-folder/path")
              .catch(() => ({ data: { path: "" } })),
          ]);
        setTypes(typesRes.data || []);
        setOrgs(orgsRes.data || []);
        setCabinets(cabinetsRes.data || []);
        setScannerFolderPath(scannerPathRes.data.path || "");

        if (hazari) {
          const formattedYear = hazari.year ? hazari.year.toString() : "";

          setFormData({
            volume: hazari.volume || "",
            type: hazari.type?.id || "",
            subType: hazari.subType?.id || "",
            year: formattedYear,
            org: hazari.org?.id || "",
            description: hazari.description || "",
            newFiles: [],
          });

          setExistingFiles(hazari.files || []);
          if (hazari.cabinetFile) {
            const cf = hazari.cabinetFile;
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
        toast.error("د معلوماتو لوستلو کې ستونزه");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [open, hazari]);

  // Load sub-types when type changes
  useEffect(() => {
    const loadSubTypes = async () => {
      if (!formData.type) {
        setSubTypes([]);
        return;
      }
      try {
        const res = await api.get(`/sub-type/by-type/${formData.type}`);
        setSubTypes(res.data || []);
      } catch {
        setSubTypes([]);
      }
    };
    loadSubTypes();
  }, [formData.type]);
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
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScan = async () => {
    try {
      setIsScanning(true);
      const res = await api.get("/scanner-folder/files");
      setDetectedFiles(res.data || []);
      toast[res.data.length ? "success" : "default"](
        `${res.data.length} ${text.filesFound || "files found"}`,
      );
    } catch {
      toast.error(text.scanError || "د سکین کولو کې ستونزه");
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
    toast.success(text.fileRemovedLocally || "File removed from list");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const required = ["type", "subType", "year", "org"];
    if (required.some((f) => !formData[f])) {
      toast.error(text.error?.requiredFields || "ټول اړین فیلډونه ډک کړئ");
      setIsSubmitting(false);
      return;
    }

    try {
      const fd = new FormData();
      const payload = {
        volume: formData.volume?.trim() || null,
        type: { id: Number(formData.type) },
        subType: { id: Number(formData.subType) },
        year: parseInt(formData.year),

        org: { id: Number(formData.org) },
        cabinetFile: selectedFile ? { id: parseInt(selectedFile) } : null,
        description: formData.description?.trim() || null,
        isIndraj: hazari.isIndraj,
      };

      fd.append("hifziyaHazari", JSON.stringify(payload));
      formData.newFiles.forEach((file) => fd.append("fileURL", file));
      fd.append("scannerFiles", JSON.stringify(scannerFiles));

      await updateHifziyaHazari(hazari.id, fd);
      toast.success(text.edit?.updateSuccess || "معلومات تازه شول");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(text.edit?.updateError || "د تازه کولو کې ستونزه");
    } finally {
      setIsSubmitting(false);
    }
  };

  const recordTypeLabel = hazari?.isIndraj
    ? text.indraj || "اندراج"
    : text.hazari || "حاضري";

  const badgeColor = hazari?.isIndraj ? "#2196F3" : "#4CAF50";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      disableRestoreFocus
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      {/* Header */}
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
            {text.title || "د حاضري اصلاح"}
          </Typography>
          <Box
            sx={{
              px: 2,
              py: 0.5,
              borderRadius: "999px",
              fontSize: "0.9rem",
              fontWeight: 600,
              backgroundColor: badgeColor,
              color: "white",
            }}
          >
            {recordTypeLabel}
          </Box>
          {hazari && (
            <Chip
              label={`ID: ${hazari.id}`}
              size="small"
              color="default"
              variant="outlined"
            />
          )}
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
              {/* LEFT — Scanner + Files */}
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
                          {text.folderTitle || "سکینر فولډر"}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {detectedFiles.length > 0
                            ? `${detectedFiles.length} ${text.filesFound || "files found"}`
                            : text.clickToScan || "د سکین لپاره کلیک وکړئ"}
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
                              {text.scanning || "سکین کیږي..."}
                            </>
                          ) : (
                            text.scanButton || "سکین"
                          )}
                        </Button>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<AttachFileIcon />}
                          onClick={handleLoadFromScanner}
                          disabled={!detectedFiles.length}
                          sx={{
                            bgcolor: "#4CAF50",
                            "&:hover": { bgcolor: "#45a049" },
                          }}
                        >
                          {text.loadFiles || "فایلونه ولوډ کړئ"}
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
                        {text.detectedFiles || "کشف شوي فایلونه"}
                      </Typography>
                      <Stack
                        spacing={0.5}
                        sx={{ maxHeight: 150, overflowY: "auto" }}
                      >
                        {detectedFiles.map((f, i) => (
                          <Chip
                            key={i}
                            label={f.name}
                            size="small"
                            icon={<AttachFileIcon />}
                            sx={{ justifyContent: "flex-start" }}
                          />
                        ))}
                      </Stack>
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
                        {text.existingFiles || "موجوده فایلونه"} (
                        {existingFiles.length})
                      </Typography>
                      <Stack
                        spacing={0.8}
                        sx={{ maxHeight: 150, overflowY: "auto" }}
                      >
                        {existingFiles.map((file) => (
                          <Chip
                            key={file.id}
                            label={file.fileName || file.name || "file"}
                            size="small"
                            icon={<AttachFileIcon />}
                            onDelete={() => handleRemoveExistingFile(file.id)}
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
                  {/* Manual Upload */}
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<AttachFileIcon />}
                  >
                    {text.addNewFiles || "نوي فایلونه اضافه کړئ"}
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </Button>

                  {/* New Files */}
                  {formData.newFiles.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        {text.newFilesAdded || "نوي فایلونه"} (
                        {formData.newFiles.length})
                      </Typography>
                      <Stack
                        spacing={0.5}
                        sx={{ maxHeight: 150, overflowY: "auto" }}
                      >
                        {formData.newFiles.map((file, i) => (
                          <Chip
                            key={i}
                            label={file.name}
                            size="small"
                            color="success"
                            onDelete={() => handleRemoveNewFile(i)}
                            sx={{ justifyContent: "flex-start" }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {existingFiles.length === 0 &&
                    formData.newFiles.length === 0 && (
                      <Alert severity="info" icon={<FolderIcon />}>
                        {text.noFilesAttached || "هیڅ فایل نشته"}
                      </Alert>
                    )}
                </Stack>
              </Grid>

              {/* RIGHT — Form Fields */}
              <Grid item xs={12} md={8}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="volume"
                      label={text.volume || "جلد"}
                      value={formData.volume}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      size="small"
                      required
                      error={!formData.type}
                    >
                      <InputLabel>{text.type || "ډول"}</InputLabel>
                      <Select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        label={text.type || "ډول"}
                      >
                        {types.map((type) => (
                          <MenuItem key={type.id} value={type.id}>
                            {type.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      size="small"
                      required
                      error={!formData.subType}
                      disabled={!formData.type}
                    >
                      <InputLabel>{text.subType || "فرعي ډول"}</InputLabel>
                      <Select
                        name="subType"
                        value={formData.subType}
                        onChange={handleInputChange}
                        label={text.subType || "فرعي ډول"}
                      >
                        {!formData.type ? (
                          <MenuItem disabled>
                            {text.selectTypeFirst || "لومړی ډول وټاکئ"}
                          </MenuItem>
                        ) : (
                          subTypes.map((st) => (
                            <MenuItem key={st.id} value={st.id}>
                              {st.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
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
                        onChange={handleInputChange}
                        label={text.org || "اداره"}
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
                      name="year"
                      type="number"
                      label={text.year || "کال"}
                      InputLabelProps={{ shrink: true }}
                      value={formData.year}
                      onChange={handleInputChange}
                      required
                      error={!formData.year}
                      helperText={!formData.year ? text.required || "اړین" : ""}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      sx={{ mb: 1 }}
                    >
                     {text.cabinetAddress || "د آلماري پته"}
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
                      <InputLabel>{text.shelf || "شیلف (Shelf)"}</InputLabel>
                      <Select
                        value={String(selectedShelf)}
                        onChange={handleShelfChange}
                        label={text.shelf || "شیلف (Shelf)"}
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
                      name="description"
                      label={text.description || "توضیحات / ملاحظات"}
                      multiline
                      rows={4}
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
          sx={{ bgcolor: badgeColor, "&:hover": { bgcolor: badgeColor } }}
        >
          {isSubmitting
            ? text.saving || "ذخیره کیږي..."
            : text.save || "تغییرات خوندي کړئ"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
