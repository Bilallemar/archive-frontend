import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import FolderIcon from "@mui/icons-material/Folder";
import SaveIcon from "@mui/icons-material/Save";
import ScannerIcon from "@mui/icons-material/Scanner";
import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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
import { useNavigate } from "react-router-dom";
import getMinotMakatibTexts from "../../../helpers/hifziya/MinotMakatib/MinotMakatibTexts";
import api from "../../../services/api";
import { createMinotMakatib } from "../../../services/RepositoryManagement/MinotMakatibAPI";

export default function AddMinotMakatib() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    cartonNumber: "",
    letterNumber: "",
    year: "",
    subject: "",
    org: "",
    description: "",
    files: [],
  });
  const { t } = useTranslation("minotMakatib");
  const text = getMinotMakatibTexts(t);
  const [orgs, setOrgs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectedFiles, setDetectedFiles] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerFiles, setScannerFiles] = useState([]);

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
    const load = async () => {
      const [orgsRes, cabinetsRes] = await Promise.all([
        api.get("/org"),
        api.get("/cabinet"),
      ]);
      setOrgs(orgsRes.data || []);
      setCabinets(cabinetsRes.data || []);
    };
    load();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const res = await api.get("/scanner-folder/files");
      setDetectedFiles(res.data || []);
      toast[res.data.length ? "success" : "info"](
        `${res.data.length} فایلونه وموندل شول`,
      );
    } catch {
      toast.error(text.scanError || "د سکینر فایلونو لوستل ناکام شو");
    } finally {
      setIsScanning(false);
    }
  };

  const handleLoadFromScanner = () => {
    if (!detectedFiles.length)
      return toast.error(
        text.noScannerFiles || "هیڅ فایل د سکینر څخه ونه موندل شو",
      );
    setScannerFiles(detectedFiles.map((f) => f.name));
    setDetectedFiles([]);
    toast.success(
      `${detectedFiles.length}${text.loadSuccess || "فایلونه چمتو دي"}`,
    );
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setFormData((prev) => ({ ...prev, files: [...prev.files, ...newFiles] }));
  };

  const handleRemoveFile = (index) =>
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));

  const handleRemoveAllFiles = () =>
    setFormData((prev) => ({ ...prev, files: [] }));

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
    if (!formData.cartonNumber.trim()) {
      toast.error("د کارتن شمېره اړینه ده");
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
      formData.files.forEach((file) => fd.append("fileURL", file));
      fd.append("scannerFiles", JSON.stringify(scannerFiles));
      await createMinotMakatib(fd);
      toast.success(
        text.createSuccess || "می نوټ مکتب په بریالیتوب سره ثبت شو",
      );
      navigate("/minot-makatib");
    } catch (err) {
      toast.error(text.createError || "د ثبت پر مهال ستونزه رامنځته شوه");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/minot-makatib")}
          sx={{ color: "text.secondary" }}
        >
          {text.back || "شاته"}
        </Button>
        <Typography variant="h4" fontWeight="bold">
          {text.title || "نوی می نوټ مکتب ثبت کړئ"}
        </Typography>
      </Box>

      <Card
        sx={{ borderRadius: 2, boxShadow: "0px 4px 15px rgba(0,0,0,0.07)" }}
      >
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* LEFT — Files & Scanner */}
              <Grid item xs={12} md={4}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderWidth: 2,
                      borderColor: detectedFiles.length
                        ? "success.main"
                        : "divider",
                      bgcolor: detectedFiles.length
                        ? "success.lighter"
                        : "background.paper",
                    }}
                  >
                    <CardContent sx={{ textAlign: "center", py: 4 }}>
                      <Badge
                        badgeContent={detectedFiles.length}
                        color="success"
                        sx={{ mb: 2 }}
                      >
                        <FolderIcon
                          sx={{ fontSize: 60, color: "primary.main" }}
                        />
                      </Badge>
                      <Typography variant="h6" gutterBottom>
                        {text.scannerFolderTitle || "د سکینر فولډر فایلونه"}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                      >
                        {detectedFiles.length > 0
                          ? `${detectedFiles.length} فایلونه وموندل شول`
                          : text.scanButtonInfo || "Click scan to detect files"}
                      </Typography>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<ScannerIcon />}
                        onClick={handleScan}
                        disabled={isScanning}
                        sx={{ mb: 2 }}
                      >
                        {isScanning ? (
                          <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />{" "}
                            {text.scanning || "سکین کیږي..."}
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
                        disabled={!detectedFiles.length}
                        sx={{
                          bgcolor: "#4CAF50",
                          "&:hover": { bgcolor: "#45a049" },
                        }}
                      >
                        {text.loadFiles || "فایلونه لېږدول"}
                      </Button>
                    </CardContent>
                  </Card>

                  {detectedFiles.length > 0 && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ mb: 1 }}
                      >
                        {text.detectedFiles || "د سکینر فایلونه"} (
                        {detectedFiles.length})
                      </Typography>
                      <Box sx={{ maxHeight: 180, overflowY: "auto" }}>
                        <Stack spacing={0.5}>
                          {detectedFiles.map((f, i) => (
                            <Chip
                              key={i}
                              label={f.name}
                              size="small"
                              icon={<AttachFileIcon />}
                            />
                          ))}
                        </Stack>
                      </Box>
                    </Box>
                  )}

                  {scannerFiles.length > 0 && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ mb: 1 }}
                      >
                        {text.scannerFiles || "د سکینر فایلونه"} (
                        {scannerFiles.length})
                      </Typography>
                      <Stack
                        spacing={0.5}
                        sx={{ maxHeight: 150, overflowY: "auto" }}
                      >
                        {scannerFiles.map((name, i) => (
                          <Chip
                            key={i}
                            label={name}
                            size="small"
                            onDelete={() =>
                              setScannerFiles((prev) =>
                                prev.filter((_, idx) => idx !== i),
                              )
                            }
                            sx={{
                              bgcolor: "#4CAF50",
                              color: "#fff",
                              "& .MuiChip-deleteIcon": { color: "#fff" },
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<AttachFileIcon />}
                  >
                    {text.manualUpload || "Manual Upload"}
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx"
                    />
                  </Button>

                  {formData.files.length > 0 && (
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight="bold">
                          {text.readyToUpload || "Ready to Upload"}(
                          {formData.files.length})
                        </Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={handleRemoveAllFiles}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box sx={{ maxHeight: 180, overflowY: "auto" }}>
                        <Stack spacing={0.5}>
                          {formData.files.map((file, i) => (
                            <Chip
                              key={i}
                              label={file.name}
                              onDelete={() => handleRemoveFile(i)}
                              size="small"
                              sx={{
                                bgcolor: "#2196F3",
                                color: "#fff",
                                "& .MuiChip-deleteIcon": { color: "#fff" },
                                "& .MuiChip-label": {
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  maxWidth: 150,
                                },
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* RIGHT — Form Fields */}
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      required
                      name="cartonNumber"
                      label={text.cartonNumber || "د کارتن شمېره"}
                      value={formData.cartonNumber}
                      onChange={handleInputChange}
                      error={!formData.cartonNumber}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="letterNumber"
                      label={text.letterNumber || "د مکتوب شمېره"}
                      value={formData.letterNumber}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="year"
                      label={text.year || "کال"}
                      value={formData.year}
                      onChange={handleInputChange}
                      type="number"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{text.org || "اداره"}</InputLabel>
                      <Select
                        name="org"
                        value={formData.org}
                        onChange={handleInputChange}
                        label={text.org || "اداره"}
                      >
                        {orgs.map((o) => (
                          <MenuItem key={o.id} value={o.id}>
                            {o.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      name="subject"
                      label={text.subject || "موضوع"}
                      value={formData.subject}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  {/* Cabinet Address */}
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      sx={{ mb: 1 }}
                    >
                      {text.cabinetAddress}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{text.cabinet || "کابینه"}</InputLabel>
                      <Select
                        value={String(selectedCabinet)}
                        onChange={handleCabinetChange}
                        label={text.cabinet || "کابینه"}
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
                      <InputLabel>{text.floor || "پوړ"}</InputLabel>
                      <Select
                        value={String(selectedFloor)}
                        onChange={handleFloorChange}
                        label={text.floor || "پوړ"}
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
                      <InputLabel>{text.shelf || "شیلف"}</InputLabel>
                      <Select
                        value={String(selectedShelf)}
                        onChange={handleShelfChange}
                        label={text.shelf || "شیلف"}
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
                      <InputLabel>{text.file || "فایل"}</InputLabel>
                      <Select
                        value={String(selectedFile)}
                        onChange={(e) => setSelectedFile(e.target.value)}
                        label={text.file || "فایل"}
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
                      name="description"
                      label={text.description || "ملاحظات"}
                      value={formData.description}
                      onChange={handleInputChange}
                      sx={{ "& .MuiInputBase-root": { height: 100 } }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        justifyContent: "flex-end",
                        mt: 2,
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => navigate("/minot-makatib")}
                        disabled={isSubmitting}
                      >
                        {text.cancel || "لغو"}
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        endIcon={
                          isSubmitting ? (
                            <CircularProgress size={20} />
                          ) : (
                            <SaveIcon />
                          )
                        }
                        disabled={isSubmitting}
                        sx={{
                          bgcolor: "#2196F3",
                          "&:hover": { bgcolor: "#1976D2" },
                        }}
                      >
                        {isSubmitting
                          ? text.saving || "ذخیره کیږي..."
                          : text.save || "ذخیره"}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
