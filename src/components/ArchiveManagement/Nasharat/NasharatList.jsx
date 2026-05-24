import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { red } from "@mui/material/colors";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  deleteNasharat,
  getAllNasharats,
  getNasharatById,
} from "../../../services/ArchiveManagement/NasharatAPI";
import { formatHijriDateForDisplay } from "../../../utils/hijriDateUtils";
import PageBreadcrumbs from "../../Breadcrumbs/PageBreadcrumbs";
import Filter from "../../Filter";
import EditNasharatDialog from "./EditNasharatDialog";
import ViewNasharat from "./ViewNasharat";

export default function NasharatList() {
  const { t } = useTranslation("nasharat");
  const navigate = useNavigate();

  const [nasharats, setNasharats] = useState([]);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNasharat, setSelectedNasharat] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [field, setField] = useState("docNo");
  const [totalCount, setTotalCount] = useState(0);

  const open = Boolean(anchorEl);

  const columns = useMemo(
    () => [
      { id: "docNo", label: t("docNo", "نمبر مکتوب / پارسل"), minWidth: 130 },
      { id: "receiveDate", label: t("incomingDate", "تاریخ دریافت"), minWidth: 120 },
      { id: "sendDate", label: t("sendDate", "تاریخ ارسال"), minWidth: 120 },
      { id: "senderOrg", label: t("sender", "مرسل"), minWidth: 180 },
      { id: "receiverOrg", label: t("receiver", "مرسل الیه"), minWidth: 180 },
      { id: "docType", label: t("docType", "نوعیت"), minWidth: 130 },
      { id: "actions", label: t("actions", "عملیات"), minWidth: 100 },
    ],
    [t],
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadNasharats = useCallback(async () => {
    try {
      const params = {
        page,
        size: rowsPerPage,
        field,
        term: debouncedTerm,
      };
      const response = await getAllNasharats(params);
      setNasharats(response.data.content);
      setTotalCount(response.data.totalElements);
    } catch (error) {
      console.error("Error loading nasharats:", error);
      toast.error(t("loadError", "د معلوماتو لوستل ناکام شول"));
    }
  }, [page, rowsPerPage, field, debouncedTerm, t]);

  useEffect(() => {
    loadNasharats();
  }, [loadNasharats]);

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleFieldChange = (e) => setField(e.target.value);

  const handleClick = (event, nasharat) => {
    setAnchorEl(event.currentTarget);
    setSelectedNasharat(nasharat);
  };

  const handleClose = () => setAnchorEl(null);

  const handleView = async () => {
    try {
      const response = await getNasharatById(selectedNasharat.id);
      setSelectedNasharat(response.data);
      setOpenViewDialog(true);
    } catch (error) {
      toast.error(t("loadError", "د معلوماتو د بارولو کې ستونزه"));
    }
    handleClose();
  };

  const handleEdit = async () => {
    try {
      const response = await getNasharatById(selectedNasharat.id);
      setSelectedNasharat(response.data);
      setOpenEditDialog(true);
    } catch (error) {
      toast.error(t("loadError", "د معلوماتو د بارولو کې ستونزه"));
    }
    handleClose();
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
    handleClose();
  };

  const handleDelete = async () => {
    try {
      await deleteNasharat(selectedNasharat.id);
      toast.success(t("deleteSuccess", "نشرات ړنګ شول"));
      loadNasharats();
    } catch (err) {
      toast.error(t("deleteError", "ړنګول ناکام شول"));
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate("/nasharat/add")}
        >
          {t("newNasharat", "نوی نشرات")}
        </Button>

        <Box>
          <PageBreadcrumbs />
        </Box>
      </Box>

      {/* Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Filter
          value={searchTerm}
          onChange={handleSearch}
          field={field}
          onFieldChange={handleFieldChange}
          fields={[
            { value: "docNo", label: t("docNo", "نمبر مکتوب") },
            { value: "sender", label: t("sender", "مرسل") },
            { value: "receiver", label: t("receiver", "مرسل الیه") },
            { value: "docType", label: t("docType", "نوعیت") },
          ]}
        />
      </Paper>

      {/* Table */}
      <Paper sx={{ overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    align="center"
                    sx={{
                      minWidth: col.minWidth,
                      backgroundColor: "#f5f7fa",
                      fontWeight: "bold",
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {nasharats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      {t("noData", "هیڅ ډیټا موجود نه ده")}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                nasharats.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell align="center">{row.docNo || "—"}</TableCell>
                    <TableCell align="center">
                      {formatHijriDateForDisplay(row.receiveDate) || "—"}
                    </TableCell>
                    <TableCell align="center">
                      {formatHijriDateForDisplay(row.sendDate) || "—"}
                    </TableCell>
                    <TableCell align="center">{row.senderOrgName || "—"}</TableCell>
                    <TableCell align="center">{row.receiverOrgName || "—"}</TableCell>
                    <TableCell align="center">{row.docTypeName || "—"}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={(e) => handleClick(e, row)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>


          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(+e.target.value);
              setPage(0);
            }}
            labelRowsPerPage={t("rowsPerPage", "په هره پاڼه کې قطارونه")}
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} ${t("of", "له")} ${count !== -1 ? count : `${to}+`}`
            }
          />
      </Paper>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleView}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          {t("view", "کتل")}
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          {t("edit", "سمول")}
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: red[700] }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          {t("delete", "ړنګول")}
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <ViewNasharat
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        nasharat={selectedNasharat}
      />
      <EditNasharatDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        nasharat={selectedNasharat}
        onSuccess={loadNasharats}
      />
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>{t("deleteConfirm", "ډاډمن یاست؟")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              "deleteMessage",
              "ایا مطمئن یاست چې دا نشرات ړنګ کړئ؟ دا کار بیرته نه شي کیدلی."
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>
            {t("cancel", "لغوه")}
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            {t("delete", "ړنګول")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}