import { Add, Delete, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
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
import getLocationManagementTexts from "../helpers/getLocationManagementTexts";
import api from "../services/api";

export default function LocationManagement() {
  const [tab, setTab] = useState("provinces");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation("locationManagement");
  const texts = getLocationManagementTexts(t);

  // Add/Edit modal
  const [modal, setModal] = useState(null); // { type, mode, data }
  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete confirm dialog
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type, id }

  useEffect(() => {
    loadProvinces();
  }, []);

  useEffect(() => {
    if (selectedProvinceId) loadDistricts(selectedProvinceId);
    else setDistricts([]);
  }, [selectedProvinceId]);

  const loadProvinces = async () => {
    setLoading(true);
    try {
      const res = await api.get("/locations/provinces");
      setProvinces(res.data || []);
    } catch {
      toast.error(texts.loadError);
    } finally {
      setLoading(false);
    }
  };

  const loadDistricts = async (provinceId) => {
    setLoading(true);
    try {
      const res = await api.get(`/locations/districts/${provinceId}`);
      setDistricts(res.data || []);
    } catch {
      toast.error(texts.loadError);
    } finally {
      setLoading(false);
    }
  };

  // ── Add / Edit ──
  const openModal = (type, mode, data = {}) => {
    setModal({ type, mode, data });
    setNameInput(data.name || "");
  };

  const closeModal = () => {
    setModal(null);
    setNameInput("");
  };

  const handleSave = async () => {
    if (!nameInput.trim()) {
      toast.error(texts.requiredName);
      return;
    }
    setSaving(true);
    try {
      if (modal.type === "province") {
        if (modal.mode === "add") {
          await api.post("/locations/provinces", { name: nameInput.trim() });
          toast.success(texts.provinceAdded);
        } else {
          await api.put(`/locations/provinces/${modal.data.id}`, {
            name: nameInput.trim(),
          });
          toast.success(texts.provinceUpdated);
        }
        closeModal();
        loadProvinces();
      } else {
        if (modal.mode === "add") {
          await api.post(
            `/locations/provinces/${selectedProvinceId}/districts`,
            {
              name: nameInput.trim(),
            },
          );
          toast.success(texts.districtAdded);
        } else {
          await api.put(`/locations/districts/${modal.data.id}`, {
            name: nameInput.trim(),
            province: { id: parseInt(selectedProvinceId) },
          });
          toast.success(texts.districtUpdated);
        }
        closeModal();
        loadDistricts(selectedProvinceId);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || texts.operationFailed);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const openDeleteDialog = (type, id) => {
    setDeleteTarget({ type, id });
    setDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialog(false);
    setDeleteTarget(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteTarget.type === "province") {
        await api.delete(`/locations/provinces/${deleteTarget.id}`);
        toast.success(texts.provinceDeleted);
        if (selectedProvinceId == deleteTarget.id) setSelectedProvinceId("");
        loadProvinces();
      } else {
        await api.delete(`/locations/districts/${deleteTarget.id}`);
        toast.success(texts.districtDeleted);
        loadDistricts(selectedProvinceId);
      }
    } catch {
      toast.error(texts.deleteFailed);
    } finally {
      closeDeleteDialog();
    }
  };

  // dialog title helper
  const getModalTitle = () => {
    if (modal?.mode === "add") {
      return modal?.type === "province"
        ? texts.newProvinceTitle
        : texts.newDistrictTitle;
    }
    return modal?.type === "province"
      ? texts.editProvinceTitle
      : texts.editDistrictTitle;
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      {/* Tab Buttons */}

      <Stack direction="row" spacing={3} mb={4} alignItems="center">
        <Button
          variant={tab === "provinces" ? "contained" : "outlined"}
          onClick={() => setTab("provinces")}
          sx={{
            bgcolor: tab === "provinces" ? "primary" : "transparent",
            borderColor: "primary",
            color: tab === "provinces" ? "white" : "primary",
            "&:hover": {
              bgcolor: tab === "provinces" ? "#1d252e" : "rgba(0,0,0,0.05)",
              borderColor: "primary",
            },
          }}
        >
          {texts.provinces}
        </Button>

        <Divider orientation="vertical" flexItem />

        <Button
          variant={tab === "districts" ? "contained" : "outlined"}
          onClick={() => setTab("districts")}
          sx={{
            bgcolor: tab === "districts" ? "primary" : "transparent",
            borderColor: "primary",
            color: tab === "districts" ? "white" : "primary",
            "&:hover": {
              bgcolor: tab === "districts" ? "#1d252e" : "rgba(0,0,0,0.05)",
              borderColor: "primary",
            },
          }}
        >
          {texts.districts}
        </Button>
      </Stack>

      {loading && (
        <Box display="flex" justifyContent="center" mb={3}>
          <CircularProgress size={28} />
        </Box>
      )}

      {/* ── PROVINCES TAB ── */}
      {tab === "provinces" && (
        <Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h6" fontWeight={500}>
              {texts.provinces} ({provinces.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => openModal("province", "add")}
              sx={{ bgcolor: "primary", "&:hover": { bgcolor: "#1d252e" } }}
            >
              {texts.newProvince}
            </Button>
          </Box>

          <Stack spacing={1.5}>
            {provinces.map((p) => (
              <Card key={p.id} sx={{ borderRadius: 2 }}>
                <CardContent
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1.5,
                    "&:last-child": { pb: 1.5 },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Typography fontWeight={500}>{p.name}</Typography>
                    <Chip label={`ID: ${p.id}`} size="small" />
                  </Box>
                  <Box display="flex" gap={0.5}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => openModal("province", "edit", p)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => openDeleteDialog("province", p.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      )}

      {/* ── DISTRICTS TAB ── */}
      {tab === "districts" && (
        <Box>
          {/* Province selector */}
          <FormControl fullWidth size="small" sx={{ mb: 4 }}>
            <InputLabel>{texts.selectProvince}</InputLabel>
            <Select
              value={selectedProvinceId}
              label={texts.selectProvince}
              onChange={(e) => setSelectedProvinceId(e.target.value)}
            >
              <MenuItem value="">
                <em>{texts.selectProvince}</em>
              </MenuItem>
              {provinces.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedProvinceId && (
            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h6" fontWeight={500}>
                  {texts.districts} ({districts.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => openModal("district", "add")}
                  sx={{ bgcolor: "primary", "&:hover": { bgcolor: "#1d252e" } }}
                >
                  {texts.newDistrict}
                </Button>
              </Box>

              <Stack spacing={1.5}>
                {districts.map((d) => (
                  <Card key={d.id} sx={{ borderRadius: 2 }}>
                    <CardContent
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 1.5,
                        "&:last-child": { pb: 1.5 },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Typography fontWeight={500}>{d.name}</Typography>
                        <Chip label={`ID: ${d.id}`} size="small" />
                      </Box>
                      <Box display="flex" gap={0.5}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => openModal("district", "edit", d)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => openDeleteDialog("district", d.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          )}

          {/* No province selected hint */}
          {!selectedProvinceId && !loading && (
            <Box
              sx={{
                textAlign: "center",
                py: 6,
                color: "text.secondary",
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Typography variant="body2">
                {texts.selectProvinceFirst}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* ── ADD / EDIT DIALOG ── */}
      <Dialog open={!!modal} onClose={closeModal} maxWidth="xs" fullWidth>
        <DialogTitle>{getModalTitle()}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label={
              modal?.type === "province"
                ? texts.provinceName
                : texts.districtName
            }
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>{texts.cancel}</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ bgcolor: "primary", "&:hover": { bgcolor: "#1d252e" } }}
          >
            {saving ? <CircularProgress size={18} /> : texts.save}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── DELETE CONFIRM DIALOG ── */}
      <Dialog open={deleteDialog} onClose={closeDeleteDialog}>
        <DialogTitle>{texts.confirmDelete}</DialogTitle>
        <DialogContent>
          <DialogContentText>{texts.deleteMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>{texts.cancel}</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            {texts.delete}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
