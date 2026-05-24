import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
} from "@mui/material";
import { red } from "@mui/material/colors";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import getMakhzanWaradaSaderaTexts from "../../../helpers/Storage/MakhzanwSaradasSadera/getMakhzanWaradaSaderaTexts";
import {
  deleteMakhzanWaradaSadera,
  getAllMakhzanWaradaSadera,
  getMakhzanWaradaSaderaById,
} from "../../../services/StorageManagement/MakhzanWaradaSaderaAPI";
import { formatHijriDateForDisplay } from "../../../utils/hijriDateUtils";
import PageBreadcrumbs from "../../Breadcrumbs/PageBreadcrumbs";
import Filter from "../../Filter";
import EditMakhzanWaradaSaderaDialog from "./EditMakhzanWaradaSaderaDialog";
import ViewMakhzanWaradaSadera from "./ViewMakhzanWaradaSadera";

export default function MakhzanWaradaSaderaList() {
  const { t } = useTranslation("makhzanWaradaSadera");
  const text = getMakhzanWaradaSaderaTexts(t);
  const navigate = useNavigate();

  const [makhzanWaradaSadera, setMakhzanWaradaSadera] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [field, setField] = useState("no");
  const [searchTerm, setSearchTerm] = useState("");

  const open = Boolean(anchorEl);

  const columns = [
    { id: "org", label: text.org || "اداره", minWidth: 150 },
    {
      id: "letterNumber",
      label: text.letterNumber || "شمېره مکتوب",
      minWidth: 120,
    },
    {
      id: "subjectType",
      label: text.subjectType || "د لاسند ډول",
      minWidth: 120,
    },
    {
      id: "incommingDate",
      label: text.incommingDate || "تاریخ وارده",
      minWidth: 130,
    },
    { id: "direction", label: text.direction || "نوع", minWidth: 100 },
    { id: "actions", label: text.actions || "عملیات", minWidth: 100 },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadMakhzanWaradaSadera = useCallback(async () => {
    try {
      setIsLoading(true); // ← start loading
      const params = {
        page,
        size: rowsPerPage,
        field,
        term: debouncedTerm,
        ...(tabValue === 1 && { direction: "INCOMING" }),
        ...(tabValue === 2 && { direction: "OUTGOING" }),
      };
      const response = await getAllMakhzanWaradaSadera(params);
      setMakhzanWaradaSadera(response.data.content);
      setTotalCount(response.data.totalElements);
    } catch (error) {
      toast.error(text.loadError || "د معلوماتو د بارولو کې ستونزه");
    } finally {
      setIsLoading(false); // ← stop loading — always runs
    }
  }, [page, rowsPerPage, field, debouncedTerm, tabValue]);

  useEffect(() => {
    loadMakhzanWaradaSadera();
  }, [loadMakhzanWaradaSadera]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFieldChange = (e) => {
    setField(e.target.value);
  };

  const handleView = async () => {
    try {
      const response = await getMakhzanWaradaSaderaById(selectedRecord.id); // ← fetch full record
      setSelectedRecord(response.data); // ← replace summary with full entity
      setOpenViewDialog(true);
    } catch (error) {
      toast.error("د معلوماتو د بارولو کې ستونزه");
    }
    handleClose();
  };

  const handleCloseView = () => {
    setOpenViewDialog(false);
    setSelectedRecord(null);
  };

  const handleClick = (event, record) => {
    setAnchorEl(event.currentTarget);
    setSelectedRecord(record);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = async () => {
    try {
      const response = await getMakhzanWaradaSaderaById(selectedRecord.id); // ← fetch full record
      setSelectedRecord(response.data); // ← replace DTO with full entity
      setOpenEditDialog(true);
    } catch (error) {
      toast.error("د معلوماتو د بارولو کې ستونزه");
    }
    handleClose();
  };

  const handleCloseEdit = () => {
    setOpenEditDialog(false);
    setSelectedRecord(null);
  };

  const handleEditSuccess = () => {
    loadMakhzanWaradaSadera();
  };

  // Filter records based on search

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
    handleClose();
  };

  const handleNewRecord = (direction = null) => {
    const url = direction
      ? `/makhzan-warada-sadera/add?direction=${direction}`
      : "/makhzan-warada-sadera/add";
    navigate(url);
  };
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleDelete = async () => {
    try {
      await deleteMakhzanWaradaSadera(selectedRecord.id);
      loadMakhzanWaradaSadera();
      toast.success(text.deleteSuccess || "Record deleted successfully");
    } catch (error) {
      console.error("Failed to delete record", error);
      toast.error(text.deleteError || "Failed to delete record");
    } finally {
      setOpenDeleteDialog(false);
      setSelectedRecord(null);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
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
    <>
      <Box sx={{ width: "100%", p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              onClick={() => handleNewRecord("INCOMING")}
              sx={{ borderRadius: "10px" }}
            >
              {text.newWareda || "نوی وارده"}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleNewRecord("OUTGOING")}
              sx={{ borderRadius: "10px" }}
            >
              {text.newSadera || "نوی صادره"}
            </Button>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              textAlign: "right",
            }}
          >
            {/* <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {text.title || "Makhzan Warada Sadera Records"}
            </Typography> */}
            <PageBreadcrumbs />
          </Box>
        </Box>
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label={text.all || "ټولې"} />
            <Tab label={text.incoming || "وارده"} />
            <Tab label={text.outgoing || "صادره"} />
          </Tabs>
        </Paper>
        {/* Table */}

        {/* Filter */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Filter
            value={searchTerm}
            onChange={handleSearch}
            field={field}
            onFieldChange={handleFieldChange}
            fields={[
              { value: "no", label: text.no || "شمېره" },
              { value: "org", label: text.org || "اداره" },
              {
                value: "letterNumber",
                label: text.letterNumber || "شمېره مکتوب",
              },
              {
                value: "subjectType",
                label: text.subjectType || "د لاسند ډول",
              },
            ]}
          />
        </Paper>
        <Paper sx={{ overflow: "hidden", borderRadius: 2 }}>
          <TableContainer sx={{ maxHeight: 520 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align="center"
                      style={{
                        minWidth: column.minWidth,
                        backgroundColor: "#f5f7fa",
                        fontWeight: "bold",
                        fontSize: "0.875rem",
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {makhzanWaradaSadera.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell align="center">{row.orgName || "—"}</TableCell>{" "}
                    {/* ← not row.org?.name */}
                    <TableCell align="center">
                      {row.letterNumber || "—"}
                    </TableCell>
                    <TableCell align="center">
                      {row.subjectType || "—"}
                    </TableCell>
                    <TableCell align="center">
                      {formatHijriDateForDisplay(row.incommingDate) || "—"}
                    </TableCell>
                    {/* ✅ Direction badge using isIncoming */}
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "inline-block",
                          px: 2,
                          py: 0.5,
                          borderRadius: "999px",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          backgroundColor:
                            row.direction === "INCOMING"
                              ? "#4CAF50"
                              : "#2196F3",
                          color: "white",
                        }}
                      >
                        {row.direction === "INCOMING" ? "وارده" : "صادره"}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={(e) => handleClick(e, row)}>
                        <MoreVertIcon />
                      </IconButton>
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

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleView}>
          <VisibilityIcon fontSize="small" style={{ marginRight: 8 }} />
          {text.view || "View"}
        </MenuItem>

        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" style={{ marginRight: 8 }} />
          {text.edit || "Edit"}
        </MenuItem>

        <MenuItem onClick={handleDeleteClick} style={{ color: red[500] }}>
          <DeleteIcon
            fontSize="small"
            style={{ marginRight: 8, color: red[500] }}
          />
          {text.delete || "Delete"}
        </MenuItem>
      </Menu>

      {/* View Dialog */}
      <ViewMakhzanWaradaSadera
        open={openViewDialog}
        onClose={handleCloseView}
        record={selectedRecord}
      />

      {/* Edit Dialog */}
      <EditMakhzanWaradaSaderaDialog
        open={openEditDialog}
        onClose={handleCloseEdit}
        record={selectedRecord}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {text.deleteRecord || "Delete Record"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {text.deleteText ||
              "Are you sure you want to delete this record? This action cannot be undone."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>
            {text.cancel || "Cancel"}
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            {text.delete || "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
