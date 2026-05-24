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
import getMakzanAnnualReportTexts from "../../../helpers/Storage/MakzanAnnualReport/MakzanAnnualReportText";
import api from "../../../services/api";
import { createAnnualReport } from "../../../services/StorageManagement/MakzanAnnualReportAPI";

export default function AddMakzanAnnualReport() {
  const [formData, setFormData] = useState({
    year: "",
    docTypeId: "",
    summaryWaseqa: "",
    description: "",
    provinceId: "",
    districtId: "",
    files: [],
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const navigate = useNavigate();
  const { t } = useTranslation("makzanAnnualReport");
  const texts = getMakzanAnnualReportTexts(t);

  const [docTypes, setDocTypes] = useState([]);
  const [isLoadingDocTypes, setIsLoadingDocTypes] = useState(false);

  // Load provinces, doc types
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingProvinces(true);
      setIsLoadingDocTypes(true);

      try {
        // Load provinces
        const provincesRes = await api.get("/locations/provinces");
        setProvinces(provincesRes.data || []);

        // Load document types
        const docTypesRes = await api.get("/doc-type/active");
        setDocTypes(docTypesRes.data || []);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error(texts.loadError || "Failed to load required data");
      } finally {
        setIsLoadingProvinces(false);
        setIsLoadingDocTypes(false);
      }
    };

    loadInitialData();
  }, []);
  useEffect(() => {
    api.get("/cabinet").then((res) => setCabinets(res.data || []));
  }, []);
  // Load districts when province changes
  useEffect(() => {
    if (!formData.provinceId) {
      setDistricts([]);
      return;
    }

    const loadDistricts = async () => {
      setIsLoadingDistricts(true);
      try {
        const res = await api.get(
          `/locations/districts/${formData.provinceId}`,
        );
        setDistricts(res.data || []);
      } catch (error) {
        console.error("Error loading districts:", error);
        toast.error("Failed to load districts");
      } finally {
        setIsLoadingDistricts(false);
      }
    };

    loadDistricts();
  }, [formData.provinceId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Reset district when province changes
    if (name === "provinceId") {
      setFormData((prev) => ({ ...prev, districtId: "" }));
    }
  };

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
  const handleScan = async () => {
    try {
      setIsScanning(true);
      const response = await api.get("/scanner-folder/files");
      setDetectedFiles(response.data || []);

      if (response.data.length === 0) {
        toast.info(texts.noFilesFound);
      } else {
        toast.success(`${response.data.length} ${texts.filesDetected}`);
      }
    } catch (error) {
      console.error("Failed to scan folder", error);
      toast.error(texts.scanError);
    } finally {
      setIsScanning(false);
    }
  };
  const handleLoadFromScanner = () => {
    if (!detectedFiles.length) return;
    setScannerFiles(detectedFiles.map((f) => f.name));
    setDetectedFiles([]);
    toast.success(
      `${detectedFiles.length} ${texts.loadSuccess || "فایلونه چمتو دي"}`,
    );
  };
  // Manual file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...selectedFiles],
    }));
  };

  // Remove individual file
  const handleRemoveFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  // Remove all files
  const handleRemoveAllFiles = () => {
    setFormData((prev) => ({
      ...prev,
      files: [],
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.provinceId) {
      toast.error("Province is required");
      setIsSubmitting(false);
      return;
    }
    if (!formData.year) {
      toast.error(texts.yearRequired || "Year is required");
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      const payload = {
        province: formData.provinceId
          ? { id: Number(formData.provinceId) }
          : null,
        district: formData.districtId
          ? { id: Number(formData.districtId) }
          : null,
        year: parseInt(formData.year),
        docType: formData.docTypeId ? { id: Number(formData.docTypeId) } : null,
        summaryWaseqa: formData.summaryWaseqa?.trim() || null,
        cabinetFile: selectedFile ? { id: parseInt(selectedFile) } : null,

        description: formData.description?.trim() || null,
      };
      formDataToSend.append("annualReport", JSON.stringify(payload));

      if (formData.files.length > 0) {
        formData.files.forEach((file) => {
          formDataToSend.append("fileURL", file);
        });
      }
      formDataToSend.append("scannerFiles", JSON.stringify(scannerFiles));
      await createAnnualReport(formDataToSend);
      toast.success(texts.createSuccess || "Report created successfully");
      navigate("/makzan-annual-reports");
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        texts.createError ||
        "Failed to create report";
      toast.error(msg);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProvinces || isLoadingDocTypes) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/makzan-annual-reports")}
          sx={{ color: "text.secondary" }}
        >
          {texts.back}
        </Button>
        <Typography
          variant="h4"
          sx={{ fontFamily: "B Nazanin", fontWeight: "bold" }}
        >
          {texts.addNewReport}
        </Typography>
      </Box>

      {/* <Box sx={{ mb: 2 }}>
        <PageBreadcrumbs />
      </Box> */}

      {/* Form Card */}
      <Card
        sx={{
          borderRadius: 2,
          boxShadow:
            "0px 4px 15px rgba(0,0,0,0.07), 0px 8px 10px rgba(0,0,0,0.04)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Scanner Status Card */}
                  <Card
                    variant="outlined"
                    sx={{
                      bgcolor:
                        detectedFiles.length > 0
                          ? "success.lighter"
                          : "background.neutral",
                      borderColor:
                        detectedFiles.length > 0 ? "success.main" : "divider",
                      borderWidth: 2,
                    }}
                  >
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
                        {texts.scannerFolderTitle}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {detectedFiles.length > 0
                          ? `${detectedFiles.length} files found`
                          : texts.clickToScan}
                      </Typography>

                      {/* Scan Button */}
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
                            {texts.scanning}
                          </>
                        ) : (
                          texts.scanButton
                        )}
                      </Button>

                      {/* Load Files Button */}
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
                        {texts.loadFiles}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Detected Files List */}
                  {detectedFiles.length > 0 && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ mb: 1 }}
                      >
                        {texts.detectedFiles}
                      </Typography>
                      <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
                        <Stack spacing={0.5}>
                          {detectedFiles.map((file, index) => (
                            <Chip
                              key={index}
                              label={file.name}
                              size="small"
                              icon={<AttachFileIcon />}
                              sx={{
                                justifyContent: "flex-start",
                                "& .MuiChip-label": {
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                },
                              }}
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
                  {/* Manual File Upload */}
                  <Box>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      size="small"
                      startIcon={<AttachFileIcon />}
                    >
                      {texts.manualUpload}
                      <input
                        type="file"
                        hidden
                        multiple
                        onChange={handleFileChange}
                        accept="image/*,.pdf,.doc,.docx"
                      />
                    </Button>
                  </Box>

                  {/* Selected Files for Upload */}
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
                          {texts.readyToUpload} ({formData.files.length})
                        </Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={handleRemoveAllFiles}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
                        <Stack spacing={0.5}>
                          {formData.files.map((file, index) => (
                            <Chip
                              key={index}
                              label={file.name}
                              onDelete={() => handleRemoveFile(index)}
                              size="small"
                              sx={{
                                backgroundColor: "#2196F3",
                                color: "#ffffff",
                                justifyContent: "space-between",

                                "& .MuiChip-deleteIcon": {
                                  color: "#ffffff",
                                  "&:hover": {
                                    color: "#ffffff",
                                  },
                                },

                                "& .MuiChip-label": {
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
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
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  {/* Province Dropdown */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small" required>
                      <InputLabel id="province-select-label">
                        {texts.province || "Province"}
                      </InputLabel>
                      <Select
                        labelId="province-select-label"
                        id="province-select"
                        name="provinceId"
                        value={formData.provinceId}
                        label={texts.province || "Province"}
                        onChange={handleInputChange}
                        error={!formData.provinceId}
                      >
                        <MenuItem value="">
                          <em>{texts.selectProvince || "Select province"}</em>
                        </MenuItem>
                        {provinces.map((prov) => (
                          <MenuItem key={prov.id} value={prov.id}>
                            {prov.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* District Dropdown */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="district-select-label">
                        {texts.district || "District"}
                      </InputLabel>
                      <Select
                        labelId="district-select-label"
                        id="district-select"
                        name="districtId"
                        value={formData.districtId}
                        label={texts.district || "District"}
                        onChange={handleInputChange}
                        disabled={!formData.provinceId || isLoadingDistricts}
                      >
                        <MenuItem value="">
                          <em>
                            {isLoadingDistricts
                              ? "Loading..."
                              : texts.selectDistrict ||
                                "Select district (optional)"}
                          </em>
                        </MenuItem>
                        {districts.map((dist) => (
                          <MenuItem key={dist.id} value={dist.id}>
                            {dist.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Year */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="year"
                      type="number"
                      label={texts.yearLabel}
                      value={formData.year}
                      onChange={handleInputChange}
                      required
                      error={!formData.year}
                    />
                  </Grid>

                  {/* Document Type */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="doctype-select-label">
                        {texts.docTypeLabel}
                      </InputLabel>
                      <Select
                        labelId="doctype-select-label"
                        id="doctype-select"
                        name="docTypeId"
                        value={formData.docTypeId}
                        label={texts.docTypeLabel}
                        onChange={handleInputChange}
                      >
                        <MenuItem value="">
                          <em>{texts.selectDocType || "Select type"}</em>
                        </MenuItem>
                        {docTypes.map((type) => (
                          <MenuItem key={type.id} value={type.id}>
                            {type.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Summary Waseqa */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="summaryWaseqa"
                      label={texts.summaryWaseqaLabel}
                      value={formData.summaryWaseqa}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      sx={{ mb: 1 }}
                    >
                                          {texts.cabinetAddress|| "پته کابینه (Cabinet Location)"}

                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{texts.cabinet || "کابینه (Cabinet)"}</InputLabel>
                      <Select
                        value={String(selectedCabinet)} // ✅ String()
                        onChange={handleCabinetChange}
                        label={texts.cabinet || "کابینه (Cabinet)"}
                      >
                        {cabinets.map((c) => (
                          <MenuItem key={c.id} value={String(c.id)}>
                            {" "}
                            {c.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl
                      fullWidth
                      size="small"
                      disabled={!selectedCabinet}
                    >
                      <InputLabel>{texts.floor || "ځای (Floor)"}</InputLabel>
                      <Select
                        value={String(selectedFloor)} // ✅ String()
                        onChange={handleFloorChange}
                        label={texts.floor || "ځای (Floor)"}
                      >
                        {floors.map((f) => (
                          <MenuItem key={f.id} value={String(f.id)}>
                            {" "}
                            {f.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl
                      fullWidth
                      size="small"
                      disabled={!selectedFloor}
                    >
                      <InputLabel>{texts.shelf || "شف (Shelf)"}</InputLabel>
                      <Select
                        value={String(selectedShelf)} // ✅ String()
                        onChange={handleShelfChange}
                        label={texts.shelf || "شف (Shelf)"}
                      >
                        {shelves.map((s) => (
                          <MenuItem key={s.id} value={String(s.id)}>
                            {" "}
                            {s.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl
                      fullWidth
                      size="small"
                      disabled={!selectedShelf}
                    >
                      <InputLabel>{texts.file || "اسناد (File)"}</InputLabel>
                      <Select
                        value={String(selectedFile)} // ✅ String()
                        onChange={(e) => setSelectedFile(e.target.value)}
                        label={texts.file || "اسناد (File)"}
                      >
                        {cabinetFiles.map((f) => (
                          <MenuItem key={f.id} value={String(f.id)}>
                            {" "}
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
                      name="description"
                      label={texts.remarksLabel}
                      multiline
                      value={formData.description}
                      onChange={handleInputChange}
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
                        onClick={() => navigate("/makzan-annual-reports")}
                        disabled={isSubmitting}
                      >
                        {texts.cancel}
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        endIcon={
                          isSubmitting ? (
                            <CircularProgress size={20} />
                          ) : (
                            <SaveIcon />
                          )
                        }
                        sx={{
                          bgcolor: "#2196F3",
                          "&:hover": { bgcolor: "#1d252e" },
                        }}
                      >
                        {isSubmitting ? texts.saving : texts.save}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
