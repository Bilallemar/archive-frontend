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
import { useLocation, useNavigate } from "react-router-dom";
import getHifziyaWaradaSaderaTexts from "../../../helpers/hifziya/waradaSadera/waradaSaderaListTexts";
import api from "../../../services/api";
import { createHifziyaWaradaSadera } from "../../../services/RepositoryManagement/HifziyaWaradaSaderaAPI";
import { convertHijriToGregorian } from "../../../utils/hijriDateUtils";
import HijriDatePicker from "../../HijriDatePicker";

export default function AddHifziyaWaradaSadera() {
  const { t } = useTranslation("hifziyaWaradaSadera");
  const text = getHifziyaWaradaSaderaTexts(t);
  const navigate = useNavigate();
  const location = useLocation();

  const direction =
    new URLSearchParams(location.search).get("direction") === "OUTGOING"
      ? "OUTGOING"
      : "INCOMING";
  // ✅ Updated formData based on isIncoming
  const [formData, setFormData] = useState({
    no: "",
    org: "",
    letterNumber: "",
    incommingDate: "",
    outgoingDate: "", // Will be used only for صادره (outgoing)
    summary: "",
    subjectType: "",
    description: "",
    files: [],
  });

  const [orgs, setOrgs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scannerFolderPath, setScannerFolderPath] = useState("");
  const [detectedFiles, setDetectedFiles] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerFiles, setScannerFiles] = useState([]);
  const [docTypes, setDocTypes] = useState([]);
  const [cabinets, setCabinets] = useState([]);
  const [floors, setFloors] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [cabinetFiles, setCabinetFiles] = useState([]);

  const [selectedCabinet, setSelectedCabinet] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedShelf, setSelectedShelf] = useState("");
  const [selectedFile, setSelectedFile] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cabinetsRes, orgsRes, docTypesRes, scannerPathRes] =
          await Promise.all([
            api.get("/cabinet"), // ✅ added
            api.get("/org"),
            api.get("/doc-type/active"),
            api
              .get("/scanner-folder/path")
              .catch(() => ({ data: { path: "" } })),
          ]);
        setCabinets(cabinetsRes.data || []); // ✅ set here
        setOrgs(orgsRes.data || []);
        setDocTypes(docTypesRes.data || []);
        setScannerFolderPath(scannerPathRes.data.path || "");
      } catch (error) {
        console.error("Failed to load data", error);
        toast.error(text.loadError || "Error loading data");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [text.loadError]);
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
    console.log("Floor ID selected:", floorId); // ← what value?
    console.log("Floor ID type:", typeof floorId);
    console.log("✅ Floor selected ID:", floorId); // ← add this to debug
    setSelectedFloor(floorId);
    setSelectedShelf("");
    setSelectedFile("");
    setShelves([]);
    setCabinetFiles([]);

    if (floorId) {
      const res = await api.get(`/cabinet/floors/${floorId}/shelves`);
      console.log("Shelves API response:", res.data); // ← what comes back?
      console.log("Shelves count:", res.data?.length);
      console.log("✅ Shelves loaded:", res.data); // ← add this
      setShelves(res.data || []);
    }
  };

  const handleShelfChange = async (e) => {
    const shelfId = e.target.value;
    console.log("✅ Shelf selected ID:", shelfId); // ← add this
    setSelectedShelf(shelfId);
    setSelectedFile("");
    setCabinetFiles([]);

    if (shelfId) {
      const res = await api.get(`/cabinet/shelves/${shelfId}/files`);
      console.log("✅ Files loaded:", res.data); // ← add this
      setCabinetFiles(res.data || []);
    }
  };
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
        toast(text.noFilesInScanner || "هیڅ فایل ونه موندل شو"); // ← no .info
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
    if (!detectedFiles.length)
      return toast.error(text.noFilesToLoad || "هیڅ فایل نشته");
    setScannerFiles(detectedFiles.map((f) => f.name));
    setDetectedFiles([]);
    toast.success(
      `${detectedFiles.length} ${text.filesLoadedSuccessfully || "فایلونه چمتو دي"}`,
    );
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...selectedFiles],
    }));
  };

  const handleRemoveFile = (index) =>
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  const handleRemoveAllFiles = () =>
    setFormData((prev) => ({ ...prev, files: [] }));
  const pageTitle =
    direction === "INCOMING"
      ? text.newWareda || "نوې وارده"
      : text.newSadera || "نوی صادره";
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // ✅ Validation
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
      const formDataToSend = new FormData();

      // ✅ Build payload - matching the working structure from yesterday
      const payload = {
        no: formData.no.trim(),
        org: { id: parseInt(formData.org) },
        letterNumber: formData.letterNumber.trim() || null,
        incommingDate: convertHijriToGregorian(formData.incommingDate) || null,
        summary: formData.summary.trim() || null,
        description: formData.description.trim() || null,
        subjectType: formData.subjectType || null,
        direction: direction,
        cabinetFile: selectedFile ? { id: parseInt(selectedFile) } : null,
      };

      // ✅ Add outgoingDate only for صادره (outgoing)
      if (direction === "OUTGOING" && formData.outgoingDate) {
        payload.outgoingDate = convertHijriToGregorian(formData.outgoingDate);
      }

      // ✅ Add docType only if selected (avoid sending null or empty)
      if (formData.docTypeId && formData.docTypeId !== "") {
        payload.docType = { id: parseInt(formData.docTypeId) };
      }

      // 🐛 DEBUG: Log the payload being sent
      console.log("=== PAYLOAD BEING SENT ===");
      console.log(JSON.stringify(payload, null, 2));
      console.log("=========================");

      formDataToSend.append("hifziyaWaradaSadera", JSON.stringify(payload));

      // Add files if any
      if (formData.files.length > 0) {
        formData.files.forEach((file) => {
          formDataToSend.append("fileURL", file);
        });
        console.log(`📎 Attaching ${formData.files.length} file(s)`);
      }
      formDataToSend.append("scannerFiles", JSON.stringify(scannerFiles));
      // 🐛 DEBUG: Log FormData contents
      console.log("=== FORMDATA CONTENTS ===");
      for (let pair of formDataToSend.entries()) {
        if (pair[0] === "hifziyaWaradaSadera") {
          console.log(pair[0] + ": " + pair[1]);
        } else {
          console.log(pair[0] + ": [File: " + pair[1].name + "]");
        }
      }
      console.log("========================");

      const response = await createHifziyaWaradaSadera(formDataToSend);

      console.log("✅ Success response:", response);
      toast.success(
        text.recordCreatedSuccessfully || "Record created successfully",
      );
      navigate("/hifziya-warada-sadera");
    } catch (error) {
      console.error("❌ Full error object:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error config:", error.config);

      // Better error message
      let errorMessage = "Failed to create record";
      if (error.response) {
        errorMessage = `HTTP ${error.response.status}: ${error.response.data?.message || error.response.statusText || "Unknown error"}`;
      } else if (error.request) {
        errorMessage = "No response from server";
      } else {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, maxWidth: 1400, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/hifziya-warada-sadera")}
          sx={{ color: "text.secondary" }}
        >
          {text.backToList || "Back"}
        </Button>
        <Typography variant="h4" fontWeight="bold">
          {pageTitle}
        </Typography>
        {/* ✅ Badge showing وارده or صادره */}
      </Box>

      <Card elevation={3} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {text.recordTypeForDirection}:{" "}
                  <strong>
                    {direction === "INCOMING"
                      ? text.incomming || "incoming (وارده)"
                      : text.outgoing || "outgoing (صادره)"}
                  </strong>
                </Typography>
              </Grid>
              {/* LEFT SIDE - Scanner / File Upload */}
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
                        {text.scannerFolderTitle || "Scanner Status"}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                      >
                        {detectedFiles.length > 0
                          ? `${detectedFiles.length} ${text.existingFiles || "files found"}`
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
                            <CircularProgress size={20} sx={{ mr: 1 }} />
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
                      <Box sx={{ maxHeight: 180, overflowY: "auto" }}>
                        <Stack spacing={0.5}>
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
                    </Box>
                  )}
                  <Box>
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
                  </Box>

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
                          {text.readyToUpload || "Ready to Upload"} (
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
                          {formData.files.map((file, index) => (
                            <Chip
                              key={index}
                              label={file.name}
                              onDelete={() => handleRemoveFile(index)}
                              size="small"
                              sx={{
                                backgroundColor: "#2196F3",
                                color: "#ffffff",
                                "& .MuiChip-deleteIcon": {
                                  color: "#ffffff",
                                  "&:hover": { color: "#ffffff" },
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

              {/* RIGHT SIDE - Form Fields */}
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label={text.no || "شمېره"}
                      name="no"
                      value={formData.no}
                      onChange={handleInputChange}
                      required
                      error={!formData.no}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
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
                        {orgs.length === 0 ? (
                          <MenuItem disabled>
                            {text.loading || "Loading..."}
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

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label={text.letterNumber || "شمېره مکتوب"}
                      name="letterNumber"
                      value={formData.letterNumber}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  {/* ✅ Document Type - Optional for both incoming and outgoing */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label={text.subjectType || "== Subject Type =="}
                      name="subjectType"
                      value={formData.subjectType}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  {/* ✅ Incoming Date - Always shown */}
                  <Grid item xs={12} md={6}>
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

                  {/* ✅ Outgoing Date - Only for صادره (outgoing) */}
                  {direction === "OUTGOING" && (
                    <Grid item xs={12} md={6}>
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

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label={text.summary || "لنډیز"}
                      name="summary"
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
                      د کابینې پته (Cabinet Address)
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>کابینه (Cabinet)</InputLabel>
                      <Select
                        value={String(selectedCabinet)} // ✅ String()
                        onChange={handleCabinetChange}
                        label="کابینه (Cabinet)"
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
                      <InputLabel>پوړ (Floor)</InputLabel>
                      <Select
                        value={String(selectedFloor)} // ✅ String()
                        onChange={handleFloorChange}
                        label="پوړ (Floor)"
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
                      <InputLabel>شیلف (Shelf)</InputLabel>
                      <Select
                        value={String(selectedShelf)} // ✅ String()
                        onChange={handleShelfChange}
                        label="شیلف (Shelf)"
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
                      <InputLabel>فایل (File)</InputLabel>
                      <Select
                        value={String(selectedFile)} // ✅ String()
                        onChange={(e) => setSelectedFile(e.target.value)}
                        label="فایل (File)"
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
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      label={text.description || "ملاحظات"}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      sx={{
                        "& .MuiInputBase-root": {
                          height: 100,
                        },
                      }}
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
                        onClick={() => navigate("/hifziya-warada-sadera")}
                        disabled={isSubmitting}
                      >
                        {text.cancel || "لغوه"}
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
                          bgcolor:
                            direction === "INCOMING" ? "#4CAF50" : "#2196F3",
                          "&:hover": {
                            bgcolor:
                              direction === "INCOMING" ? "#45a049" : "#1976D2",
                          },
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
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
