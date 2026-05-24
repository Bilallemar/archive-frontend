import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Inventory2 as FileBoxIcon,
  FolderOpen as FolderOpenIcon,
  Layers as LayersIcon,
  Storage as StorageIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import { useTranslation } from "react-i18next";
import { t } from "i18next";

// ─── API helpers ────────────────────────────────────────────────────────────
const cabinetAPI = {
  getAll: () => api.get("/cabinet"),
  create: (data) => api.post("/cabinet", data),
  update: (id, data) => api.put(`/cabinet/${id}`, data),
  delete: (id) => api.delete(`/cabinet/${id}`),

  getFloors: (cabinetId) => api.get(`/cabinet/${cabinetId}/floors`),
  createFloor: (data) => api.post("/cabinet/floors", data),
  updateFloor: (id, data) => api.put(`/cabinet/floors/${id}`, data),
  deleteFloor: (id) => api.delete(`/cabinet/floors/${id}`),

  getShelves: (floorId) => api.get(`/cabinet/floors/${floorId}/shelves`),
  createShelf: (data) => api.post("/cabinet/shelves", data),
  updateShelf: (id, data) => api.put(`/cabinet/shelves/${id}`, data),
  deleteShelf: (id) => api.delete(`/cabinet/shelves/${id}`),

  getFiles: (shelfId) => api.get(`/cabinet/shelves/${shelfId}/files`),
  createFile: (data) => api.post("/cabinet/files", data),
  updateFile: (id, data) => api.put(`/cabinet/files/${id}`, data),
  deleteFile: (id) => api.delete(`/cabinet/files/${id}`),
};

// ─── Small reusable dialog ───────────────────────────────────────────────────
function FormDialog({ open, onClose, title, fields, onSave, loading }) {
  const [values, setValues] = useState({});
    const { t } = useTranslation("CabinetManagement");
  

  useEffect(() => {
    if (open) {
      const init = {};
      fields.forEach((f) => (init[f.name] = f.defaultValue || ""));
      setValues(init);
    }
  }, [open, fields]);

  const handleSave = () => {
    for (const f of fields) {
      if (f.required && !values[f.name]?.toString().trim()) {
        toast.error(`${f.label} ${t("is required")}`);
        return;
      }
    }
    onSave(values);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", pb: 1 }}>{title}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {fields.map((f) => (
            <TextField
              key={f.name}
              fullWidth
              size="small"
              label={f.label}
              value={values[f.name] || ""}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [f.name]: e.target.value }))
              }
              required={f.required}
              type={f.type || "text"}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>
          {t("Cancel")}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {t("Save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Delete confirm dialog ───────────────────────────────────────────────────
function DeleteDialog({ open, onClose, onConfirm, name, loading }) {
    const { t } = useTranslation("CabinetManagement");
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ color: "error.main", fontWeight: "bold" }}>
       {t("confirmDelete")}
      </DialogTitle>
      <DialogContent>
        <Typography>
         {t("notRecoverable")} <strong>{name}</strong> {t("confirmDelete")}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>
          {t("Cancel")}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {t("Delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Files section ───────────────────────────────────────────────────────────
function ShelfFiles({ shelfId, shelfName }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const { t } = useTranslation("CabinetManagement");

  const load = async () => {
    setLoading(true);
    try {
      const res = await cabinetAPI.getFiles(shelfId);
      setFiles(res.data || []);
    } catch {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = () => {
    if (!expanded) load();
    setExpanded(!expanded);
  };

  const handleAdd = async (values) => {
    setSaving(true);
    try {
      await cabinetAPI.createFile({
        name: values.name,
        fileNumber: values.fileNumber,
        shelf: { id: shelfId },
      });
      toast.success(t("addFile"));
      setAddOpen(false);
      load();
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (values) => {
    setSaving(true);
    try {
      await cabinetAPI.updateFile(selected.id, {
        name: values.name,
        fileNumber: values.fileNumber,
        shelf: { id: shelfId },
      });
      toast.success(t("successUpdate"));
      setEditOpen(false);
      load();
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await cabinetAPI.deleteFile(selected.id);
      toast.success(t("successDelete"));
      setDeleteOpen(false);
      load();
    } catch {
      toast.error(t("deleteError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          ml: 2,
          mt: 1,
          border: "1px dashed",
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1,
            bgcolor: "grey.50",
            cursor: "pointer",
            "&:hover": { bgcolor: "grey.100" },
          }}
          onClick={handleExpand}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FileBoxIcon sx={{ fontSize: 16, color: "warning.main" }} />
            <Typography variant="body2" fontWeight={500}>
              {t("files")}
            </Typography>
            {files.length > 0 && (
              <Chip
                label={files.length}
                size="small"
                color="warning"
                sx={{ height: 18, fontSize: "0.7rem" }}
              />
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title={t("newFile")}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setAddOpen(true);
                }}
                sx={{ color: "warning.main" }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <ExpandMoreIcon
              sx={{
                fontSize: 18,
                color: "text.secondary",
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          </Box>
        </Box>

        {expanded && (
          <Box sx={{ p: 1 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={20} />
              </Box>
            ) : files.length === 0 ? (
              <Alert severity="info" sx={{ py: 0.5, fontSize: "0.8rem" }}>
                {t("noFile")}

              </Alert>
            ) : (
              <List dense disablePadding>
                {files.map((file) => (
                  <ListItem
                    key={file.id}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      py: 0.5,
                    }}
                    secondaryAction={
                      <Box>
                        <Tooltip title={t("editFile")}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelected(file);
                              setEditOpen(true);
                            }}
                            sx={{ color: "primary.main" }}
                          >
                            <EditIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("deleteFile")}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelected(file);
                              setDeleteOpen(true);
                            }}
                            sx={{ color: "error.main" }}
                          >
                            <DeleteIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={500}>
                          {file.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {file.fileNumber}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </Box>

      <FormDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={t("addFile")}
        loading={saving}
        onSave={handleAdd}
        fields={[
          { name: "name", label: t("name"), required: true },
          { name: "fileNumber", label: t("fileNumber") },
        ]}
      />
      <FormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={t("editFile")}
        loading={saving}
        onSave={handleEdit}
        fields={[
          {
            name: "name",
            label: t("name"),
            required: true,
            defaultValue: selected?.name,
          },
          {
            name: "fileNumber",
            label: t("fileNumber"),
            defaultValue: selected?.fileNumber,
          },
        ]}
      />
      <DeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        name={selected?.name}
        loading={saving}
      />
    </>
  );
}

// ─── Shelves section ─────────────────────────────────────────────────────────
function FloorShelves({ floorId }) {
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

 const { t } = useTranslation("CabinetManagement");
  const load = async () => {
    setLoading(true);
    try {
      const res = await cabinetAPI.getShelves(floorId);
      setShelves(res.data || []);
    } catch {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = () => {
    if (!expanded) load();
    setExpanded(!expanded);
  };

  const handleAdd = async (values) => {
    setSaving(true);
    try {
      await cabinetAPI.createShelf({
        name: values.name,
        floor: { id: floorId },
      });
      toast.success(t("successAdd"));
      setAddOpen(false);
      load();
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (values) => {
    setSaving(true);
    try {
      await cabinetAPI.updateShelf(selected.id, {
        name: values.name,
        floor: { id: floorId },
      });
      toast.success(t("successUpdate"));
      setEditOpen(false);
      load();
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await cabinetAPI.deleteShelf(selected.id);
      toast.success(t("successDelete"));
      setDeleteOpen(false);
      load();
    } catch {
      toast.error(t("deleteError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Box sx={{ ml: 2, mt: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1,
            bgcolor: "info.lighter",
            borderRadius: 1,
            cursor: "pointer",
            border: "1px solid",
            borderColor: "info.light",
            "&:hover": { bgcolor: "info.light", "& *": { color: "white" } },
          }}
          onClick={handleExpand}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LayersIcon sx={{ fontSize: 16, color: "info.main" }} />
            <Typography variant="body2" fontWeight={500} color="info.dark">
              {t("shelfs")}
            </Typography>
            {shelves.length > 0 && (
              <Chip
                label={shelves.length}
                size="small"
                color="info"
                sx={{ height: 18, fontSize: "0.7rem" }}
              />
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title={t("addShelf")}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setAddOpen(true);
                }}
                sx={{ color: "info.main" }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <ExpandMoreIcon
              sx={{
                fontSize: 18,
                color: "info.main",
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          </Box>
        </Box>

        {expanded && (
          <Box sx={{ mt: 1 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={20} />
              </Box>
            ) : shelves.length === 0 ? (
              <Alert severity="info" sx={{ ml: 2, py: 0.5 }}>
                {t("noShelf")}
              </Alert>
            ) : (
              shelves.map((shelf) => (
                <Box
                  key={shelf.id}
                  sx={{
                    ml: 2,
                    mb: 1,
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    bgcolor: "background.paper",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LayersIcon sx={{ fontSize: 14, color: "info.main" }} />
                      <Typography variant="body2" fontWeight={600}>
                        {shelf.name}
                      </Typography>
                      <Chip
                        label={`ID: ${shelf.id}`}
                        size="small"
                        variant="outlined"
                        sx={{ height: 18, fontSize: "0.65rem" }}
                      />
                    </Box>
                    <Box>
                      <Tooltip title={t("editShelf")}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelected(shelf);
                            setEditOpen(true);
                          }}
                          sx={{ color: "primary.main" }}
                        >
                          <EditIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("deleteShelf")}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelected(shelf);
                            setDeleteOpen(true);
                          }}
                          sx={{ color: "error.main" }}
                        >
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <ShelfFiles shelfId={shelf.id} shelfName={shelf.name} />
                </Box>
              ))
            )}
          </Box>
        )}
      </Box>

      <FormDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={t("newShelf")}
        loading={saving}
        onSave={handleAdd}
        fields={[{ name: "name", label: t("name"), required: true }]}
      />
      <FormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={t("editShelf")}
        loading={saving}
        onSave={handleEdit}
        fields={[
          {
            name: "name",
            label: t("name"),
            required: true,
            defaultValue: selected?.name,
          },
        ]}
      />
      <DeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        name={selected?.name}
        loading={saving}
      />
    </>
  );
}

// ─── Cabinet Card ─────────────────────────────────────────────────────────────
function CabinetCard({ cabinet, onEdit, onDelete, onReload }) {
  const [floors, setFloors] = useState([]);
  const [loadingFloors, setLoadingFloors] = useState(false);
  const [addFloorOpen, setAddFloorOpen] = useState(false);
  const [editFloorOpen, setEditFloorOpen] = useState(false);
  const [deleteFloorOpen, setDeleteFloorOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const { t } = useTranslation("CabinetManagement");

  const loadFloors = async () => {
    setLoadingFloors(true);
    try {
      const res = await cabinetAPI.getFloors(cabinet.id);
      setFloors(res.data || []);
    } catch {
      toast.error(t("loadError"));
    } finally {
      setLoadingFloors(false);
    }
  };

  const handleExpand = () => {
    if (!expanded) loadFloors();
    setExpanded(!expanded);
  };

  const handleAddFloor = async (values) => {
    setSaving(true);
    try {
      await cabinetAPI.createFloor({
        name: values.name,
        cabinet: { id: cabinet.id },
      });
      toast.success(t("successAdd"));
      setAddFloorOpen(false);
      loadFloors();
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleEditFloor = async (values) => {
    setSaving(true);
    try {
      await cabinetAPI.updateFloor(selectedFloor.id, {
        name: values.name,
        cabinet: { id: cabinet.id },
      });
      toast.success(t("successEdit"));
      setEditFloorOpen(false);
      loadFloors();
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFloor = async () => {
    setSaving(true);
    try {
      await cabinetAPI.deleteFloor(selectedFloor.id);
      toast.success(t("successDelete"));
      setDeleteFloorOpen(false);
      loadFloors();
    } catch {
      toast.error(t("deleteError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Paper
        elevation={2}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          transition: "box-shadow 0.2s",
          "&:hover": { boxShadow: 4 },
        }}
      >
        {/* Cabinet Header */}
        <Box
          sx={{
            p: 2,
            background: "linear-gradient(135deg, #1565C0 0%, #1976D2 100%)",
            color: "white",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <StorageIcon sx={{ fontSize: 28 }} />
              <Box>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ lineHeight: 1.2 }}
                >
                  {cabinet.name}
                </Typography>
                {cabinet.location && (
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    📍 {cabinet.location}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box>
              <Tooltip title={t("edit")}>
                <IconButton
                  size="small"
                  onClick={() => onEdit(cabinet)}
                  sx={{ color: "white" }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("delete")}>
                <IconButton
                  size="small"
                  onClick={() => onDelete(cabinet)}
                  sx={{ color: "white" }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          {cabinet.description && (
            <Typography
              variant="caption"
              sx={{ opacity: 0.75, mt: 0.5, display: "block" }}
            >
              {cabinet.description}
            </Typography>
          )}
        </Box>

        {/* Floors toggle */}
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: expanded ? 2 : 0,
            }}
          >
            <Button
              size="small"
              startIcon={<FolderOpenIcon />}
              endIcon={
                <ExpandMoreIcon
                  sx={{
                    transform: expanded ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                />
              }
              onClick={handleExpand}
              variant={expanded ? "contained" : "outlined"}
              sx={{ borderRadius: 2 }}
            >
              {t("floors")} {floors.length > 0 && `(${floors.length})`}
            </Button>
            <Tooltip title={t("addFloor")}>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setAddFloorOpen(true)}
                variant="outlined"
                color="success"
                sx={{ borderRadius: 2 }}
              >
                {t("addFloor")}
              </Button>
            </Tooltip>
          </Box>

          {expanded && (
            <>
              {loadingFloors ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : floors.length === 0 ? (
                <Alert severity="info" sx={{ mt: 1 }}>
                  {t("noFloor")}
                </Alert>
              ) : (
                floors.map((floor) => (
                  <Box
                    key={floor.id}
                    sx={{
                      mb: 1.5,
                      p: 1.5,
                      bgcolor: "success.lighter",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "success.light",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <FolderOpenIcon
                          sx={{ fontSize: 16, color: "success.main" }}
                        />
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="success.dark"
                        >
                          {floor.name}
                        </Typography>
                        <Chip
                          label={`ID: ${floor.id}`}
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ height: 18, fontSize: "0.65rem" }}
                        />
                      </Box>
                      <Box>
                        <Tooltip title={t("edit")}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedFloor(floor);
                              setEditFloorOpen(true);
                            }}
                            sx={{ color: "primary.main" }}
                          >
                            <EditIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("delete")}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedFloor(floor);
                              setDeleteFloorOpen(true);
                            }}
                            sx={{ color: "error.main" }}
                          >
                            <DeleteIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <FloorShelves floorId={floor.id} />
                  </Box>
                ))
              )}
            </>
          )}
        </Box>
      </Paper>

      <FormDialog
        open={addFloorOpen}
        onClose={() => setAddFloorOpen(false)}
        title={t("addFloor")}
        loading={saving}
        onSave={handleAddFloor}
        fields={[{ name: "name", label: t("name"), required: true }]}
      />
      <FormDialog
        open={editFloorOpen}
        onClose={() => setEditFloorOpen(false)}
        title={t("editFloor")}
        loading={saving}
        onSave={handleEditFloor}
        fields={[
          {
            name: "name",
            label: t("name"),
            required: true,
            defaultValue: selectedFloor?.name,
          },
        ]}
      />
      <DeleteDialog
        open={deleteFloorOpen}
        onClose={() => setDeleteFloorOpen(false)}
        onConfirm={handleDeleteFloor}
        name={selectedFloor?.name}
        loading={saving}
      />
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CabinetManagement() {
  const [cabinets, setCabinets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation("CabinetManagement");

  const load = async () => {
    setLoading(true);
    try {
      const res = await cabinetAPI.getAll();
      setCabinets(res.data || []);
    } catch {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (values) => {
    setSaving(true);
    try {
      await cabinetAPI.create({
        name: values.name,
        location: values.location,
        description: values.description,
      });
      toast.success(t("successAdd"));
      setAddOpen(false);
      load();
    } catch {
      toast.error(t("addError"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (values) => {
    setSaving(true);
    try {
      await cabinetAPI.update(selected.id, {
        name: values.name,
        location: values.location,
        description: values.description,
      });
      toast.success(t("successEdit"));
      setEditOpen(false);
      load();
    } catch {
      toast.error(t("editError"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await cabinetAPI.delete(selected.id);
      toast.success(t("successDelete"));
      setDeleteOpen(false);
      load();
    } catch {
      toast.error(t("deleteError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          pb: 2,
          borderBottom: "2px solid",
          borderColor: "primary.main",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <StorageIcon sx={{ fontSize: 36, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              {t("cabinetManagement")}

            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("cabinet")} → {t("floor")} → {t("shelf")} → {t("file")}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddOpen(true)}
          size="large"
          sx={{ borderRadius: 2, px: 3 }}
        >
          {t("addCabinet")}        </Button>
      </Box>

      {/* Legend */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        {[
          {
            icon: <StorageIcon sx={{ fontSize: 14 }} />,
            label: t("cabinet"),
            color: "primary",
          },
          {
            icon: <FolderOpenIcon sx={{ fontSize: 14 }} />,
            label: t("floor"),
            color: "success",
          },
          {
            icon: <LayersIcon sx={{ fontSize: 14 }} />,
            label: t("shelf"),
            color: "info",
          },
          {
            icon: <FileBoxIcon sx={{ fontSize: 14 }} />,
            label: t("file"),
            color: "warning",
          },
        ].map((item) => (
          <Chip
            key={item.label}
            icon={item.icon}
            label={item.label}
            color={item.color}
            size="small"
            variant="outlined"
          />
        ))}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ alignSelf: "center" }}
        >
          {t("clickToExpand")}        </Typography>
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={48} />
        </Box>
      ) : cabinets.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          {t("noCabinet")}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {cabinets.map((cabinet) => (
            <Grid item xs={12} md={6} lg={4} key={cabinet.id}>
              <CabinetCard
                cabinet={cabinet}
                onEdit={(c) => {
                  setSelected(c);
                  setEditOpen(true);
                }}
                onDelete={(c) => {
                  setSelected(c);
                  setDeleteOpen(true);
                }}
                onReload={load}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Cabinet Dialog */}
      <FormDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={t("addCabinet")}
        loading={saving}
        onSave={handleAdd}
        fields={[
          { name: "name", label: t("cabinetName"), required: true },
          { name: "location", label: t("location") },
          { name: "description", label: t("description") },
        ]}
      />

      {/* Edit Cabinet Dialog */}
      <FormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={t("editCabinet")}
        loading={saving}
        onSave={handleEdit}
        fields={[
          {
            name: "name",
            label: t("cabinetName"),
            required: true,
            defaultValue: selected?.name,
          },
          { name: "location", label: t("location"), defaultValue: selected?.location },
          {
            name: "description",
            label: t("description"),
            defaultValue: selected?.description,
          },
        ]}
      />

      {/* Delete Cabinet Dialog */}
      <DeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        name={selected?.name}
        loading={saving}
      />
    </Box>
  );
}
