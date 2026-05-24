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
import { red } from "@mui/material/colors";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import getMakzanAnnualReportTexts from "../../../helpers/Storage/MakzanAnnualReport/MakzanAnnualReportText";
import {
  deleteAnnualReport,
  getAnnualReportById,
  gitAllAnnualReports,
} from "../../../services/StorageManagement/MakzanAnnualReportAPI";
import PageBreadcrumbs from "../../Breadcrumbs/PageBreadcrumbs";
import Filter from "../../Filter";
import EditMakzanAnnualReportDialog from "./EditMakzanAnnualReportDialog";
import ViewMakzanAnnualReport from "./ViewMakzanAnnualReport";

export default function MakzanAnnualReportList() {
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [field, setField] = useState("district");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // ← was missing

  const { t } = useTranslation("makzanAnnualReport");
  const texts = getMakzanAnnualReportTexts(t);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const columns = [
    { id: "province", label: texts.province || "ولایت", minWidth: 140 },
    { id: "district", label: texts.district || "ولسوالي", minWidth: 140 },
    { id: "year", label: texts.year, minWidth: 100 },
    { id: "actions", label: texts.actions, minWidth: 120 },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = { page, size: rowsPerPage, field, term: debouncedTerm };
      const response = await gitAllAnnualReports(params);
      setReports(response.data.content);
      setTotalCount(response.data.totalElements);
    } catch (error) {
      toast.error(texts.loadError || "د معلوماتو د بارولو کې ستونزه");
    } finally {
      setIsLoading(false);
    }
  }, [page, rowsPerPage, field, debouncedTerm]); // ← removed tabValue, this list has no tabs

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleFieldChange = (e) => setField(e.target.value);
  const handleClose = () => setAnchorEl(null);

  const handleClick = (event, report) => {
    setAnchorEl(event.currentTarget);
    setSelectedReport(report);
  };

  const handleView = async () => {
    try {
      const response = await getAnnualReportById(selectedReport.id);
      setSelectedReport(response.data);
      setOpenViewDialog(true);
    } catch (error) {
      toast.error("د معلوماتو د بارولو کې ستونزه");
    }
    handleClose();
  };

  const handleEdit = async () => {
    try {
      const response = await getAnnualReportById(selectedReport.id);
      setSelectedReport(response.data);
      setOpenEditDialog(true);
    } catch (error) {
      toast.error("د معلوماتو د بارولو کې ستونزه");
    }
    handleClose();
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
    handleClose();
  };

  const handleDelete = async () => {
    try {
      await deleteAnnualReport(selectedReport.id);
      toast.success(texts.deleteSuccess || "راپور له منځه ولاړ");
      loadReports();
    } catch (error) {
      toast.error(texts.deleteError || "د له منځه وړلو ستونزه");
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/makzan-annual-reports/add")}
            color="primary"
          >
            {texts.addNewReport || "نوی راپور ثبت کړئ"}
          </Button>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <PageBreadcrumbs />
          </Box>
        </Box>

        {/* Filter */}
        <Paper sx={{ p: 2, mb: 4, borderRadius: 2 }}>
          <Filter
            value={searchTerm}
            onChange={handleSearch}
            field={field}
            onFieldChange={handleFieldChange}
            fields={[
              { value: "province", label: texts.province || "ولایت" },
              { value: "district", label: texts.district || "ولسوالي" },
              { value: "year", label: texts.year },
            ]}
          />
        </Paper>

        {/* Table */}
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
                        minWidth: col.minWidth,
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
                {reports.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell align="center">
                      {row.provinceName || "N/A"}
                    </TableCell>
                    <TableCell align="center">
                      {row.districtName || "N/A"}
                    </TableCell>
                    <TableCell align="center">{row.year || "N/A"}</TableCell>
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
            labelRowsPerPage={texts.rowsPerPage || "Rows per page:"}
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} ${texts.of} ${count !== -1 ? count : `${to}+`}`
            }
          />
        </Paper>
      </Box>

      {/* Dialogs */}
      <ViewMakzanAnnualReport
        open={openViewDialog}
        onClose={() => {
          setOpenViewDialog(false);
          setSelectedReport(null);
        }}
        report={selectedReport}
      />
      <EditMakzanAnnualReportDialog
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
          setSelectedReport(null);
        }}
        report={selectedReport}
        onSuccess={() => {
          loadReports();
          setOpenEditDialog(false);
        }}
      />
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>
          {texts.deleteDialogTitle || "د راپور له منځه وړل"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {texts.deleteDialogContent ||
              "ایا تاسو غواړئ دا راپور له منځه یوسئ؟"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>
            {texts.cancel || "نه"}
          </Button>
          <Button onClick={handleDelete} color="error">
            {texts.delete || "هو"}
          </Button>
        </DialogActions>
      </Dialog>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleView}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          {texts.view || "لیدل"}
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          {texts.edit || "تعدیل"}
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: red[600] }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1, color: red[600] }} />
          {texts.delete || "له منځه وړل"}
        </MenuItem>
      </Menu>
    </>
  );
}
