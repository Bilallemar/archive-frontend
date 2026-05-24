// ─── MinotMakatibList.jsx ───────────────────────────────────────────────────
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
} from "@mui/material";
import PageBreadcrumbs from "../../Breadcrumbs/PageBreadcrumbs";

import { red } from "@mui/material/colors";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import getMinotMakatibTexts from "../../../helpers/hifziya/MinotMakatib/MinotMakatibTexts";
import {
  deleteMinotMakatib,
  getAllMinotMakatibs,
  getMinotMakatibById,
} from "../../../services/RepositoryManagement/MinotMakatibAPI";
import Filter from "../../Filter";
import EditMinotMakatibDialog from "./EditMinotMakatibDialog";
import ViewMinotMakatib from "./ViewMinotMakatib";

export default function MinotMakatibList() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [field, setField] = useState("cartonNumber");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selected, setSelected] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const { t } = useTranslation("minotMakatib");
  const text = getMinotMakatibTexts(t);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const load = useCallback(async () => {
    try {
      const res = await getAllMinotMakatibs({
        page,
        size: rowsPerPage,
        field,
        term: debouncedTerm,
      });
      setRecords(res.data.content);
      setTotalCount(res.data.totalElements);
    } catch {
      toast.error(text.loadError || "د معلوماتو د بارولو کې ستونزه");
    }
  }, [page, rowsPerPage, field, debouncedTerm]);

  useEffect(() => {
    load();
  }, [load]);

  const handleClick = (e, row) => {
    setAnchorEl(e.currentTarget);
    setSelected(row);
  };
  const handleClose = () => setAnchorEl(null);
  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleFieldChange = (e) => setField(e.target.value);
  const handleView = async () => {
    try {
      const res = await getMinotMakatibById(selected.id);
      setSelected(res.data);
      setOpenViewDialog(true);
    } catch {
      toast.error(text.loadError || "د معلوماتو د بارولو کې ستونزه");
    }
    handleClose();
  };

  const handleEdit = async () => {
    try {
      const res = await getMinotMakatibById(selected.id);
      setSelected(res.data);
      setOpenEditDialog(true);
    } catch {
      toast.error(text.loadError || "د معلوماتو د بارولو کې ستونزه");
    }
    handleClose();
  };

  const handleDelete = async () => {
    try {
      await deleteMinotMakatib(selected.id);
      toast.success(text.deleteSuccess || "ریکارډ حذف شو");
      load();
    } catch {
      toast.error(text.deleteError || "حذف کولو کې ستونزه");
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const columns = [
    { id: "cartonNumber", label: text.headercartonNumber || "د کارتن شمېره" },
    { id: "letterNumber", label: text.headerLetterNumber || "د مکتوب شمېره" },
    { id: "year", label: text.headeryear || "کال" },
    { id: "subject", label: text.subject || "موضوع" },
    { id: "orgName", label: text.headerOrg || "اداره" },
    { id: "actions", label: text.headerActions || "عملیات" },
  ];

  return (
    <>
      <Box sx={{ width: "100%", p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/minot-makatib/add")}
          >
            {text.newRecord || "ریکارډ جدید"}
          </Button>
          <Box sx={{ textAlign: "right" }}>
            <PageBreadcrumbs />
          </Box>
        </Box>

        {/* Search */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Filter
            value={searchTerm}
            onChange={handleSearch}
            field={field}
            onFieldChange={handleFieldChange}
            fields={[
              {
                value: "cartonNumber",
                label: text.headercartonNumber || "د کارتن شمېره",
              },
              {
                value: "letterNumber",
                label: text.headerLetterNumber || "د مکتوب شمېره",
              },
              { value: "subject", label: text.subject || "موضوع" },
              { value: "org", label: text.headerOrg || "اداره" },
            ]}
          />
        </Paper>

        <Paper sx={{ overflow: "hidden", borderRadius: 2 }}>
          <TableContainer sx={{ maxHeight: 520 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      align="center"
                      style={{
                        backgroundColor: "#f5f7fa",
                        fontWeight: "bold",
                        fontSize: "0.875rem",
                      }}
                    >
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell align="center">
                      {row.cartonNumber || "—"}
                    </TableCell>
                    <TableCell align="center">
                      {row.letterNumber || "—"}
                    </TableCell>
                    <TableCell align="center">{row.year || "—"}</TableCell>
                    <TableCell align="center">{row.subject || "—"}</TableCell>
                    <TableCell align="center">{row.orgName || "—"}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={(e) => handleClick(e, row)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                      >
                        <MenuItem onClick={handleView}>
                          <VisibilityIcon
                            fontSize="small"
                            style={{ marginRight: 8 }}
                          />{" "}
                          {text.view || "کتل"}
                        </MenuItem>
                        <MenuItem onClick={handleEdit}>
                          <EditIcon
                            fontSize="small"
                            style={{ marginRight: 8 }}
                          />{" "}
                          {text.edit || "سمول"}
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setOpenDeleteDialog(true);
                            handleClose();
                          }}
                          style={{ color: red[500] }}
                        >
                          <DeleteIcon
                            fontSize="small"
                            style={{ marginRight: 8, color: red[500] }}
                          />{" "}
                          {text.delete || "حذف"}
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))}
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
            labelRowsPerPage={text.rowsPerPage || "Rows per page:"}
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} ${text.of} ${count !== -1 ? count : `${to}+`}`
            }
          />
        </Paper>
      </Box>

      <ViewMinotMakatib
        open={openViewDialog}
        onClose={() => {
          setOpenViewDialog(false);
          setSelected(null);
        }}
        report={selected}
      />
      <EditMinotMakatibDialog
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
          setSelected(null);
        }}
        minotMakatib={selected}
        onSuccess={load}
      />

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>{text.deleteConfirm || "حذف تایید"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {text.deleteMessage || "ایا غواړئ دا ریکارډ حذف کړئ؟"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>
            {text.cancel || "لغوه"}
          </Button>
          <Button onClick={handleDelete} color="error">
            {text.delete || "حذف"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
