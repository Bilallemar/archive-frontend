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
import { useNavigate, useSearchParams } from "react-router-dom";
import getSawanihTexts from "../../../helpers/hifziya/sawanih/sawanihText";
import api from "../../../services/api";
import { createSawanih } from "../../../services/RepositoryManagement/SawanihAPI";
import { convertHijriToGregorian } from "../../../utils/hijriDateUtils";
import {
  convertToEnglishNumbers,
  convertToPersianNumbers,
} from "../../../utils/numberUtils";
import HijriDatePicker from "../../HijriDatePicker";

export default function AddSawanih() {
  const [searchParams] = useSearchParams();
  const recordType = searchParams.get("type"); // 'sawanih' or 'istekhdam'
  const isSawanih = recordType === "sawanih";

  const [detectedFiles, setDetectedFiles] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  const { t } = useTranslation("sawanih");
  const texts = getSawanihTexts(t);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    incommingDate: "",
    outgoingDate: "",
    org: "",
    description: "",
    pageQuantity: "",
    files: [],
  });
  const [scannerFiles, setScannerFiles] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [cabinets, setCabinets] = useState([]);
  const [floors, setFloors] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [cabinetFiles, setCabinetFiles] = useState([]);

  const [selectedCabinet, setSelectedCabinet] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedShelf, setSelectedShelf] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api.get("/org").then((res) => setOrgs(res.data || []));
  }, []);
  useEffect(() => {
    api.get("/cabinet").then((res) => setCabinets(res.data || []));
  }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  // Add these 3 handlers below your existing handlers

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

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...newFiles],
    }));
  };

  const handleRemoveFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveAllFiles = () => {
    setFormData((prev) => ({ ...prev, files: [] }));
  };

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const res = await api.get("/scanner-folder/files");
      setDetectedFiles(res.data || []);
      toast[res.data.length ? "success" : "info"](
        `${res.data.length} ${texts.filesFound || "فایلونه وموندل شول"}`,
      );
    } catch {
      toast.error(texts.scanError || "سکین کولو کې ستونزه");
    } finally {
      setIsScanning(false);
    }
  };

  const handleLoadFromScanner = () => {
    if (!detectedFiles.length)
      return toast.error(texts.noFiles || "هیڅ فایل نشته");
    setScannerFiles(detectedFiles.map((f) => f.name)); // ✅ just store names
    setDetectedFiles([]);
    toast.success(`${detectedFiles.length} فایلونه چمتو دي`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fd = new FormData();

      const payload = {
        name: formData.name?.trim() || "",
        fatherName: formData.fatherName?.trim() || null,
        incommingDate: convertHijriToGregorian(formData.incommingDate),
        outgoingDate: convertHijriToGregorian(formData.outgoingDate),
        org: { id: Number(formData.org) },
        cabinetFile: selectedFile ? { id: parseInt(selectedFile) } : null,
        description: formData.description?.trim() || null,
        pageQuantity:
          !isSawanih && formData.pageQuantity
            ? parseInt(convertToEnglishNumbers(formData.pageQuantity))
            : null,
        isSawanih: isSawanih,
      };

      fd.append("sawanih", JSON.stringify(payload));

      if (!isSawanih) {
        formData.files.forEach((file) => fd.append("fileURL", file));
      }
      fd.append("scannerFiles", JSON.stringify(scannerFiles));
      await createSawanih(fd);
      toast.success(texts.saveSuccess || "ثبت په بریالیتوب ترسره شو");
      navigate("/sawanih");
    } catch (err) {
      console.error(err);
      toast.error(texts.saveError || "د ثبت پر مهال ستونزه رامنځته شوه");
    } finally {
      setIsSubmitting(false);
    }
  };

  const recordTypeLabel = isSawanih
    ? texts.newSawanih || "نوې سوانح"
    : texts.newIsteqdam || "نوې استخدام";

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/sawanih")}
          sx={{ color: "text.secondary" }}
        >
          {texts.back || "بیرته"}
        </Button>
        <Typography variant="h4" fontWeight="bold">
          {recordTypeLabel}
        </Typography>
      </Box>

      <Card
        sx={{
          borderRadius: 2,
          boxShadow:
            "0px 4px 15px rgba(0,0,0,0.07), 0px 8px 10px rgba(0,0,0,0.04)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* File section – only for istekhdam */}
              {!isSawanih && (
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    {/* Scanner Card */}
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
                          {texts.scannerFolderPath || "secnner folder "}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 3 }}
                        >
                          {detectedFiles.length
                            ? `${detectedFiles.length} ${texts.filesFound || "فایلونه وموندل شول"}`
                            : texts.clickToScan || "د سکین لپاره کلیک وکړئ"}
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
                              {texts.scanning || "په سکین کولو کې..."}
                            </>
                          ) : (
                            texts.scanButton || "فولډر سکین کړئ"
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
                          {texts.loadFiles || "فایلونه لېږدول"}
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
                          {texts.detectedFiles || "موندل شوي فایلونه"}
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
                          د سکینر فایلونه ({scannerFiles.length})
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
                    {/* Manual Upload */}
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<AttachFileIcon />}
                    >
                      {texts.manualUpload || "دوهمه فایل اپلوډ کړئ"}
                      <input
                        type="file"
                        hidden
                        multiple
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </Button>

                    {/* Selected / Ready Files */}
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
                            {texts.readyToUpload || "د اپلوډ لپاره چمتو"} (
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
                                  justifyContent: "space-between",
                                  "& .MuiChip-deleteIcon": {
                                    color: "#ffffff",
                                    "&:hover": { color: "#e0e0e0" },
                                  },
                                  "& .MuiChip-label": {
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    maxWidth: 180,
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
              )}

              {/* Form Fields */}
              <Grid item xs={12} md={!isSawanih ? 8 : 12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      required
                      name="name"
                      label={texts.name || "نوم"}
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="fatherName"
                      label={texts.fatherName || "د پلار نوم"}
                      value={formData.fatherName}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      size="small"
                      required
                      error={!formData.org}
                    >
                      <InputLabel>{texts.org || "اداره"}</InputLabel>
                      <Select
                        name="org"
                        value={formData.org}
                        onChange={handleInputChange}
                        label={texts.org || "اداره"}
                      >
                        {orgs.length === 0 ? (
                          <MenuItem disabled>په بار کې دی...</MenuItem>
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

                  <Grid item xs={12} sm={6}>
                    <HijriDatePicker
                      label={texts.incommingDate || "تاریخ وارده"}
                      value={formData.incommingDate}
                      onChange={handleHijriDateChange("incommingDate")}
                      required
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <HijriDatePicker
                      label={texts.outgoingDate || "تاریخ صادره"}
                      value={formData.outgoingDate}
                      onChange={handleHijriDateChange("outgoingDate")}
                      required
                      size="small"
                    />
                  </Grid>

                  {!isSawanih && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        name="pageQuantity"
                        label={texts.pageQuantity || "تعداد صفحات"}
                        value={convertToPersianNumbers(formData.pageQuantity)}
                        onChange={(e) => {
                          const eng = convertToEnglishNumbers(e.target.value);
                          if (eng === "" || /^\d+$/.test(eng)) {
                            setFormData((p) => ({ ...p, pageQuantity: eng }));
                          }
                        }}
                        inputProps={{ inputMode: "numeric", dir: "rtl" }}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      sx={{ mb: 1 }}
                    >
                      {texts.cabinetAddress || "د آلماري پته"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{texts.cabinet || "کابینه"}</InputLabel>
                      <Select
                        value={String(selectedCabinet)} // ✅ String()
                        onChange={handleCabinetChange}
                        label={texts.cabinet || "کابینه"}
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
                      <InputLabel>{texts.floor || "پوړ (Floor)"}</InputLabel>
                      <Select
                        value={String(selectedFloor)} // ✅ String()
                        onChange={handleFloorChange}
                        label={texts.floor || "پوړ (Floor)"}
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
                      <InputLabel>{texts.shelf || "شیلف (Shelf)"}</InputLabel>
                      <Select
                        value={String(selectedShelf)} // ✅ String()
                        onChange={handleShelfChange}
                        label={texts.shelf || "شیلف (Shelf)"}
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
                      <InputLabel>{texts.file || "فایل (File)"}</InputLabel>
                      <Select
                        value={String(selectedFile)} // ✅ String()
                        onChange={(e) => setSelectedFile(e.target.value)}
                        label={texts.file || "فایل (File)"}
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
                      name="description"
                      label={texts.description || "ملاحظات / توضیحات"}
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

                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 2,
                        mt: 3,
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => navigate("/sawanih")}
                        disabled={isSubmitting}
                      >
                        {texts.cancel || "لغوه کول"}
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
                          "&:hover": { bgcolor: "#1976d2" },
                        }}
                      >
                        {isSubmitting
                          ? texts.saving || "په ثبت کولو کې..."
                          : texts.save || "ثبت کړئ"}
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
