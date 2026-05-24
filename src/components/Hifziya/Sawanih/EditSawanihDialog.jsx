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
import getSawanihTexts from "../../../helpers/hifziya/sawanih/sawanihText";
import { updateSawanih } from "../../../services/RepositoryManagement/SawanihAPI";
import api from "../../../services/api";
import {
  convertGregorianToHijri,
  convertHijriToGregorian,
} from "../../../utils/hijriDateUtils";
import {
  convertToEnglishNumbers,
  convertToPersianNumbers,
} from "../../../utils/numberUtils";
import HijriDatePicker from "../../HijriDatePicker";

export default function EditSawanihDialog({
  open,
  onClose,
  sawanih,
  onSuccess,
}) {
  const { t } = useTranslation("sawanih");
  const texts = getSawanihTexts(t);

  const isSawanih = sawanih?.isSawanih === true;

  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    incommingDate: "",
    outgoingDate: "",
    org: "",
    description: "",
    pageQuantity: "",
    newFiles: [],
  });

  const [orgs, setOrgs] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [scannerFolderPath, setScannerFolderPath] = useState("");
  const [detectedFiles, setDetectedFiles] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
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
  const [scannerFiles, setScannerFiles] = useState([]);
  useEffect(() => {
    api.get("/cabinet").then((res) => setCabinets(res.data || []));
  }, []);
  useEffect(() => {
    if (!open) return;

    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [orgsRes, scannerPathRes] = await Promise.all([
          api.get("/org"),
          api.get("/scanner-folder/path").catch(() => ({ data: { path: "" } })),
        ]);

        setOrgs(orgsRes.data || []);
        setScannerFolderPath(scannerPathRes.data.path || "");

        if (sawanih) {
          setFormData({
            name: sawanih.name || "",
            fatherName: sawanih.fatherName || "",
            incommingDate: convertGregorianToHijri(sawanih.incommingDate),
            outgoingDate: convertGregorianToHijri(sawanih.outgoingDate),
            org: sawanih.org?.id || "",
            description: sawanih.description || "",
            pageQuantity: sawanih.pageQuantity || "",
            newFiles: [],
          });

          setExistingFiles(sawanih.files || []);
          if (sawanih.cabinetFile) {
            const cf = sawanih.cabinetFile;
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
          }
        }
      } catch (err) {
        console.error("Failed to load initial data", err);
        toast.error(texts.loadError || "د معلوماتو لوستلو کې ستونزه");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [open, sawanih, texts.loadError]);

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

  const handleHijriDateChange = (field) => (hijriDate) => {
    setFormData((prev) => ({ ...prev, [field]: hijriDate }));
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
      toast.error(texts.scanError || "د سکینر فولډر لوستلو کې ستونزه");
    } finally {
      setIsScanning(false);
    }
  };

  const handleLoadFromScanner = () => {
    if (!detectedFiles.length)
      return toast.error(texts.noFiles || "هیڅ فایل نشته");
    setScannerFiles(detectedFiles.map((f) => f.name)); // ✅
    setDetectedFiles([]);
    toast.success(`${detectedFiles.length} فایلونه چمتو دي`);
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      newFiles: [...prev.newFiles, ...newFiles],
    }));
  };

  const handleRemoveNewFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      newFiles: prev.newFiles.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveExistingFile = (fileId) => {
    setExistingFiles((prev) => prev.filter((f) => f.id !== fileId));
    toast.info(
      texts.fileRemovedLocally ||
        "فایل له لست څخه لیرې شو (تر اوسه له سرور نه دی لیرې شوی)",
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.name.trim()) {
      toast.error(texts.nameRequired || "نوم اړین دی");
      setIsSubmitting(false);
      return;
    }

    try {
      const fd = new FormData();

      const payload = {
        name: formData.name.trim(),
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
      };

      fd.append("sawanih", JSON.stringify(payload));

      // Add only new files (for istekhdam)
      if (!isSawanih) {
        formData.newFiles.forEach((file) => fd.append("fileURL", file));
      }
      fd.append("scannerFiles", JSON.stringify(scannerFiles));
      await updateSawanih(sawanih.id, fd);

      toast.success(texts.updateSuccess || "ریکارډ په بریالیتوب تازه شو");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(texts.updateError || "تازه کولو کې ستونزه رامنځته شوه");
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
            {texts.editRecord || "د معلوماتو سمول"}
          </Typography>
          <Box
            sx={{
              px: 2,
              py: 0.5,
              borderRadius: "999px",
              fontSize: "0.9rem",
              fontWeight: 600,
              backgroundColor: isSawanih ? "#FF9800" : "#2196F3",
              color: "white",
            }}
          >
            {isSawanih
              ? texts.sawanih || "سوانح"
              : texts.istekhdam || "استخدام"}
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
              {/* Left: File & Scanner Section — only for Istekhdam */}
              {!isSawanih && (
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
                            {texts.scannerStatus || "د سکینر حالت"}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            {detectedFiles.length > 0
                              ? `${detectedFiles.length} ${texts.filesFound || "فایلونه وموندل شول"}`
                              : texts.clickToScan || "د سکین لپاره کلیک وکړئ"}
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
                                {texts.scanning || "په سکین کولو کې..."}
                              </>
                            ) : (
                              texts.scan || "سکین کړئ"
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
                    )}

                    {/* Detected Files */}
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
                    {/* Existing Files */}
                    {existingFiles.length > 0 && (
                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          gutterBottom
                        >
                          {texts.existingFiles || "موجود فایلونه"} (
                          {existingFiles.length})
                        </Typography>
                        <Stack
                          spacing={0.8}
                          sx={{ maxHeight: 180, overflowY: "auto" }}
                        >
                          {existingFiles.map((file) => (
                            <Chip
                              key={file.id}
                              label={file.fileName || file.name || "فایل"}
                              size="small"
                              icon={<AttachFileIcon />}
                              onDelete={() => handleRemoveExistingFile(file.id)}
                              color="default"
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
                      {texts.addNewFiles || "نوی فایل اضافه کړئ"}
                      <input
                        type="file"
                        hidden
                        multiple
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </Button>

                    {/* New Files to Upload */}
                    {formData.newFiles.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          {texts.newFilesAdded || "نوي فایلونه د اپلوډ لپاره"} (
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
                          {texts.noFilesAttached ||
                            "تر اوسه هیڅ فایل ضمیمه شوی نه دی"}
                        </Alert>
                      )}
                  </Stack>
                </Grid>
              )}

              {/* Right: Form Fields */}
              <Grid item xs={12} md={!isSawanih ? 8 : 12}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      required
                      name="name"
                      label={texts.name || "نوم"}
                      value={formData.name}
                      onChange={handleInputChange}
                      error={!formData.name.trim()}
                      helperText={!formData.name.trim() ? texts.required : ""}
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
                        label={texts.org || "اداره"}
                        onChange={handleInputChange}
                      >
                        {orgs.map((o) => (
                          <MenuItem key={o.id} value={o.id}>
                            {o.name}
                          </MenuItem>
                        ))}
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
                          const en = convertToEnglishNumbers(e.target.value);
                          if (en === "" || /^\d+$/.test(en)) {
                            setFormData((p) => ({ ...p, pageQuantity: en }));
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
                      {texts.cabinetAddress || "د کابینه موقعیت"}
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
                      <InputLabel>{texts.shelf || "شیلف (Shelf)"}</InputLabel>
                      <Select
                        value={String(selectedShelf)}
                        onChange={handleShelfChange}
                        label={texts.shelf || "شیلف (Shelf)"}
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

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={isSubmitting}>
          {texts.cancel || "لغوه کول"}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />
          }
          sx={{
            bgcolor: isSawanih ? "#FF9800" : "#2196F3",
            "&:hover": { bgcolor: isSawanih ? "#F57C00" : "#1976D2" },
          }}
        >
          {isSubmitting
            ? texts.saving || "په ثبت کولو کې..."
            : texts.saveChanges || "تازه کړئ"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
