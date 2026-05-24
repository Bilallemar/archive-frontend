import AccountTreeIcon from "@mui/icons-material/AccountTree"; // departments
import AddIcon from "@mui/icons-material/Add";
import BusinessIcon from "@mui/icons-material/Business"; // organizations
import CategoryIcon from "@mui/icons-material/Category"; // types
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description"; // docTypes
import EditIcon from "@mui/icons-material/Edit";
import Inventory2Icon from "@mui/icons-material/Inventory2"; // cabinetManagement
import LocationOnIcon from "@mui/icons-material/LocationOn"; // locations
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight"; // subTypes

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import api from "../../services/api";
import LocationManagement from "../LocationManagement";
import CabinetManagement from "./Cabinetmanagement";

export default function MasterDataManagement() {
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useTranslation("MasterDataManagement");

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        {t("title")}
      </Typography>
      <Card>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            icon={<BusinessIcon sx={{ color: "#4A90D9" }} />}
            iconPosition="start"
            label={t("organizations")}
          />

          <Tab
            icon={<AccountTreeIcon sx={{ color: "#6C63FF" }} />}
            iconPosition="start"
            label={t("departments")}
          />

          <Tab
            icon={<CategoryIcon sx={{ color: "#FFAB00" }} />}
            iconPosition="start"
            label={t("types")}
          />

          <Tab
            icon={<SubdirectoryArrowRightIcon sx={{ color: "#FF5630" }} />}
            iconPosition="start"
            label={t("subTypes")}
          />

          <Tab
            icon={<DescriptionIcon sx={{ color: "#10B981" }} />}
            iconPosition="start"
            label={t("docTypes")}
          />

          <Tab
            icon={<LocationOnIcon sx={{ color: "#00B8D9" }} />}
            iconPosition="start"
            label={t("locations")}
          />

          <Tab
            icon={<Inventory2Icon sx={{ color: "#6554C0" }} />}
            iconPosition="start"
            label={t("cabinetManagement")}
          />
        </Tabs>
        <CardContent>
          {activeTab === 0 && <OrgManagement t={t} />}
          {activeTab === 1 && <DepartmentManagement t={t} />}
          {activeTab === 2 && <TypeManagement t={t} />}
          {activeTab === 3 && <SubTypeManagement t={t} />}
          {activeTab === 4 && <DocTypeManagement t={t} />}
          {activeTab === 5 && <LocationManagement t={t} />}
          {activeTab === 6 && <CabinetManagement />}
        </CardContent>
      </Card>
    </Box>
  );
}

// ================ DOC TYPE MANAGEMENT ================
function DocTypeManagement({ t }) {
  const [docTypes, setDocTypes] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDocType, setEditingDocType] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  useEffect(() => {
    loadDocTypes();
  }, []);

  const loadDocTypes = async () => {
    try {
      const response = await api.get("/doc-type");
      setDocTypes(response.data);
    } catch (error) {
      console.error("Error loading doc types:", error);
      toast.error(t("loadError"));
    }
  };
  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setOpenDeleteDialog(true);
  };
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error(t("requiredName"));
      return;
    }
    setLoading(true);
    try {
      if (editingDocType) {
        await api.put(`/doc-type/${editingDocType.id}`, formData);
        toast.success(t("docTypeUpdated"));
      } else {
        await api.post("/doc-type", formData);
        toast.success(t("docTypeAdded"));
      }
      await loadDocTypes();
      handleCloseDialog();
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("operationFailed"));
    } finally {
      setLoading(false);
    }
  };

  // const handleDelete = async (id) => {
  //   if (window.confirm(t("confirmDelete"))) {
  //     try {
  //       await api.delete(`/doc-type/${id}`);
  //       toast.success(t("docTypeDeleted"));
  //       await loadDocTypes();
  //     } catch (error) {
  //       console.error("Error:", error);
  //       toast.error(t("deleteFailed"));
  //     }
  //   }
  // };
  const handleDelete = async () => {
    try {
      await api.delete(`/doc-type/${selectedId}`);
      toast.success(t("docTypeDeleted"));
      await loadDocTypes();
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("deleteFailed"));
    } finally {
      setOpenDeleteDialog(false);
      setSelectedId(null);
    }
  };
  const handleToggleActive = async (id) => {
    try {
      await api.put(`/doc-type/${id}/toggle-active`);
      toast.success(t("toggleStatusSuccess"));
      await loadDocTypes();
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("toggleStatusFailed"));
    }
  };

  const handleEdit = (docType) => {
    setEditingDocType(docType);
    setFormData({
      name: docType.name,
      description: docType.description || "",
      isActive: docType.isActive !== undefined ? docType.isActive : true,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingDocType(null);
    setFormData({ name: "", description: "", isActive: true });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">{t("docTypes")}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ bgcolor: "primary.main", "&:hover": { bgcolor: "#1d252e" } }}
        >
          {t("newDocType")}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("id")}</TableCell>
              <TableCell>{t("name")}</TableCell>
              <TableCell>{t("description")}</TableCell>
              <TableCell>{t("status")}</TableCell>
              <TableCell align="right">{t("actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {docTypes.map((docType) => (
              <TableRow key={docType.id}>
                <TableCell>{docType.id}</TableCell>
                <TableCell>{docType.name}</TableCell>
                <TableCell>{docType.description || "-"}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    color={docType.isActive ? "success" : "error"}
                    onClick={() => handleToggleActive(docType.id)}
                    sx={{ minWidth: 80 }}
                  >
                    {docType.isActive ? t("active") : t("inactive")}
                  </Button>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleEdit(docType)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteClick(docType.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingDocType ? t("editDocTypeTitle") : t("newDocTypeTitle")}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t("docTypeNameLabel")}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label={t("description")}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            margin="normal"
            multiline
            rows={2}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>{t("status")}</InputLabel>
            <Select
              value={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.value })
              }
              label={t("status")}
            >
              <MenuItem value={true}>{t("active")}</MenuItem>
              <MenuItem value={false}>{t("inactive")}</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t("cancel")}</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{ bgcolor: "primary", "&:hover": { bgcolor: "#1d252e" } }}
          >
            {loading ? <CircularProgress size={20} /> : t("save")}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>{t("confirmDelete")}</DialogTitle>

        <DialogContent>
          <DialogContentText>{t("deleteMessage")}</DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>
            {t("cancel")}
          </Button>

          <Button onClick={handleDelete} color="error" variant="contained">
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ================ ORGANIZATION MANAGEMENT ================
function OrgManagement({ t }) {
  const [orgs, setOrgs] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [loading, setLoading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    loadOrgs();
  }, []);

  const loadOrgs = async () => {
    try {
      const response = await api.get("/org");
      setOrgs(response.data);
    } catch (error) {
      console.error("Error loading orgs:", error);
      toast.error(t("loadOrgsError"));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error(t("requiredName"));
      return;
    }
    setLoading(true);
    try {
      if (editingOrg) {
        await api.put(`/org/${editingOrg.id}`, formData);
        toast.success(t("organizationUpdated"));
      } else {
        await api.post("/org", formData);
        toast.success(t("organizationAdded"));
      }
      await loadOrgs();
      handleCloseDialog();
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("operationFailed"));
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setOpenDeleteDialog(true);
  };
  // const handleDelete = async (id) => {
  //   if (window.confirm(t("confirmDelete"))) {
  //     try {
  //       await api.delete(`/org/${id}`);
  //       toast.success(t("organizationDeleted"));
  //       await loadOrgs();
  //     } catch (error) {
  //       console.error("Error:", error);
  //       toast.error(t("deleteFailed"));
  //     }
  //   }
  // };
  const handleDelete = async () => {
    try {
      await api.delete(`/org/${selectedId}`);
      toast.success(t("organizationDeleted"));
      await loadOrgs();
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("deleteFailed"));
    } finally {
      setOpenDeleteDialog(false);
      setSelectedId(null);
    }
  };
  const handleEdit = (org) => {
    setEditingOrg(org);
    setFormData({ name: org.name });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingOrg(null);
    setFormData({ name: "" });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">{t("organizations")}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ bgcolor: "primary", "&:hover": { bgcolor: "#1d252e" } }}
        >
          {t("newOrganization")}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("id")}</TableCell>
              <TableCell>{t("name")}</TableCell>
              <TableCell align="right">{t("actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orgs.map((org) => (
              <TableRow key={org.id}>
                <TableCell>{org.id}</TableCell>
                <TableCell>{org.name}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(org)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteClick(org.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingOrg ? t("editOrganizationTitle") : t("newOrganizationTitle")}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t("orgNameLabel")}
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t("cancel")}</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{ bgcolor: "primary", "&:hover": { bgcolor: "#1d252e" } }}
          >
            {loading ? <CircularProgress size={20} /> : t("save")}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>{t("confirmDelete")}</DialogTitle>

        <DialogContent>
          <DialogContentText>{t("deleteMessage")}</DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>
            {t("cancel")}
          </Button>

          <Button onClick={handleDelete} color="error" variant="contained">
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ================ DEPARTMENT MANAGEMENT ================
function DepartmentManagement({ t }) {
  const [departments, setDepartments] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ name: "", orgId: "" });
  const [loading, setLoading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [deptRes, orgRes] = await Promise.all([
        api.get("/departments"),
        api.get("/org"),
      ]);
      setDepartments(deptRes.data);
      setOrgs(orgRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error(t("loadDepartmentsError"));
    }
  };
  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setOpenDeleteDialog(true);
  };
  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.orgId) {
      toast.error(t("nameAndOrgRequired"));
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        org: { id: formData.orgId },
      };
      if (editingDept) {
        await api.put(`/departments/${editingDept.id}`, payload);
        toast.success(t("departmentUpdated"));
      } else {
        await api.post("/departments", payload);
        toast.success(t("departmentAdded"));
      }
      await loadData();
      handleCloseDialog();
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("operationFailed"));
    } finally {
      setLoading(false);
    }
  };

  // const handleDelete = async (id) => {
  //   if (window.confirm(t("confirmDelete"))) {
  //     try {
  //       await api.delete(`/departments/${id}`);
  //       toast.success(t("departmentDeleted"));
  //       await loadData();
  //     } catch (error) {
  //       console.error("Error:", error);
  //       toast.error(t("deleteFailed"));
  //     }
  //   }
  // };
  const handleDelete = async () => {
    try {
      await api.delete(`/departments/${selectedId}`);
      toast.success(t("departmentDeleted"));
      await loadData();
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("deleteFailed"));
    } finally {
      setOpenDeleteDialog(false);
      setSelectedId(null);
    }
  };
  const handleEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      orgId: dept.org?.id || "",
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingDept(null);
    setFormData({ name: "", orgId: "" });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">{t("departments")}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ bgcolor: "primary", "&:hover": { bgcolor: "#1d252e" } }}
        >
          {t("newDepartment")}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("id")}</TableCell>
              <TableCell>{t("name")}</TableCell>
              <TableCell>{t("organization")}</TableCell>
              <TableCell align="right">{t("actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departments.map((dept) => (
              <TableRow key={dept.id}>
                <TableCell>{dept.id}</TableCell>
                <TableCell>{dept.name}</TableCell>
                <TableCell>{dept.org?.name || "-"}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(dept)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteClick(dept.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingDept ? t("editDepartmentTitle") : t("newDepartmentTitle")}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t("departmentNameLabel")}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>{t("organization")}</InputLabel>
            <Select
              value={formData.orgId}
              onChange={(e) =>
                setFormData({ ...formData, orgId: e.target.value })
              }
              label={t("organization")}
            >
              {orgs.map((org) => (
                <MenuItem key={org.id} value={org.id}>
                  {org.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t("cancel")}</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{ bgcolor: "primary", "&:hover": { bgcolor: "#1d252e" } }}
          >
            {loading ? <CircularProgress size={20} /> : t("save")}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>{t("confirmDelete")}</DialogTitle>

        <DialogContent>
          <DialogContentText>{t("deleteMessage")}</DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>
            {t("cancel")}
          </Button>

          <Button onClick={handleDelete} color="error" variant="contained">
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ================ TYPE MANAGEMENT ================
function TypeManagement({ t }) {
  const [types, setTypes] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [loading, setLoading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      const response = await api.get("/type");
      setTypes(response.data);
    } catch (error) {
      console.error("Error loading types:", error);
      toast.error(t("loadTypesError"));
    }
  };
  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setOpenDeleteDialog(true);
  };
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error(t("requiredName"));
      return;
    }
    setLoading(true);
    try {
      if (editingType) {
        await api.put(`/type/${editingType.id}`, formData);
        toast.success(t("typeUpdated"));
      } else {
        await api.post("/type", formData);
        toast.success(t("typeAdded"));
      }
      await loadTypes();
      handleCloseDialog();
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("operationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/type/${selectedId}`);
      toast.success(t("typeDeleted"));
      await loadTypes();
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting type:", error);
      toast.error(t("deleteTypeError"));
    } finally {
      setOpenDeleteDialog(false);
      setSelectedId(null);
    }
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({ name: type.name });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingType(null);
    setFormData({ name: "" });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">{t("types")}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ bgcolor: "primary", "&:hover": { bgcolor: "#1d252e" } }}
        >
          {t("newType")}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("id")}</TableCell>
              <TableCell>{t("name")}</TableCell>
              <TableCell align="right">{t("actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {types.map((type) => (
              <TableRow key={type.id}>
                <TableCell>{type.id}</TableCell>
                <TableCell>{type.name}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(type)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteClick(type.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingType ? t("editTypeTitle") : t("newTypeTitle")}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t("typeNameLabel")}
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t("cancel")}</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{ bgcolor: "primary", "&:hover": { bgcolor: "#1d252e" } }}
          >
            {loading ? <CircularProgress size={20} /> : t("save")}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>{t("confirmDelete")}</DialogTitle>

        <DialogContent>
          <DialogContentText>{t("deleteMessage")}</DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>
            {t("cancel")}
          </Button>

          <Button onClick={handleDelete} color="error" variant="contained">
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ================ SUBTYPE MANAGEMENT ================
function SubTypeManagement({ t }) {
  const [subTypes, setSubTypes] = useState([]);
  const [types, setTypes] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubType, setEditingSubType] = useState(null);
  const [formData, setFormData] = useState({ name: "", typeId: "" });
  const [loading, setLoading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [subTypeRes, typeRes] = await Promise.all([
        api.get("/sub-type"),
        api.get("/type"),
      ]);
      setSubTypes(subTypeRes.data);
      setTypes(typeRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error(t("loadTypesError"));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.typeId) {
      toast.error(t("nameAndTypeRequired"));
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        type: { id: formData.typeId },
      };
      if (editingSubType) {
        await api.put(`/sub-type/${editingSubType.id}`, payload);
        toast.success(t("subTypeUpdated"));
      } else {
        await api.post("/sub-type", payload);
        toast.success(t("subTypeAdded"));
      }
      await loadData();
      handleCloseDialog();
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("operationFailed"));
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/sub-type/${selectedId}`);
      toast.success(t("subTypeDeleted"));
      await loadData();
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting sub-type:", error);
      toast.error(t("operationFailed"));
    } finally {
      setOpenDeleteDialog(false);
      setSelectedId(null);
    }
  };

  const handleEdit = (subType) => {
    setEditingSubType(subType);
    setFormData({
      name: subType.name,
      typeId: subType.type?.id || "",
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSubType(null);
    setFormData({ name: "", typeId: "" });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">{t("subTypes")}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ bgcolor: "primary", "&:hover": { bgcolor: "#1d252e" } }}
        >
          {t("newSubType")}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("id")}</TableCell>
              <TableCell>{t("name")}</TableCell>
              <TableCell>{t("type")}</TableCell>
              <TableCell align="right">{t("actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subTypes.map((subType) => (
              <TableRow key={subType.id}>
                <TableCell>{subType.id}</TableCell>
                <TableCell>{subType.name}</TableCell>
                <TableCell>{subType.type?.name || "-"}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleEdit(subType)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteClick(subType.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingSubType ? t("editSubTypeTitle") : t("newSubTypeTitle")}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t("subTypeNameLabel")}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>{t("type")}</InputLabel>
            <Select
              value={formData.typeId}
              onChange={(e) =>
                setFormData({ ...formData, typeId: e.target.value })
              }
              label={t("type")}
            >
              {types.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t("cancel")}</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{ bgcolor: "primary", "&:hover": { bgcolor: "#1d252e" } }}
          >
            {loading ? <CircularProgress size={20} /> : t("save")}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>{t("confirmDelete")}</DialogTitle>

        <DialogContent>
          <DialogContentText>{t("deleteMessage")}</DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>
            {t("cancel")}
          </Button>

          <Button onClick={handleDelete} color="error" variant="contained">
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
