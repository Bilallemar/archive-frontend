import { useTranslation } from "react-i18next";
import getSawanihTexts from "../../../helpers/hifziya/sawanih/sawanihText";
import {
  deleteSawanih,
  getAllSawanih,
  getSawanihById,
} from "../../../services/RepositoryManagement/SawanihAPI";
import { formatHijriDateForDisplay } from "../../../utils/hijriDateUtils";
import PageBreadcrumbs from "../../Breadcrumbs/PageBreadcrumbs";
import Filter from "../../Filter";
import EditSawanihDialog from "./EditSawanihDialog";
import ViewSawanih from "./ViewSawanih";

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
import { useNavigate } from "react-router-dom";

export default function SawanihList() {
  const [sawanih, setSawanih] = useState([]);
  const [tabValue, setTabValue] = useState(0); // 0 = All, 1 = Sawanih, 2 = Istekhdam
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSawanih, setSelectedSawanih] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [field, setField] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const { t } = useTranslation("sawanih");
  const text = getSawanihTexts(t);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const columns = [
    { id: "name", label: text.name, minWidth: 120 },
    { id: "fatherName", label: text.fatherName, minWidth: 120 },
    { id: "org", label: text.org, minWidth: 120 },
    { id: "incommingDate", label: text.incommingDate, minWidth: 120 },
    { id: "direction", label: text.direction || "نوع", minWidth: 100 },

    { id: "actions", label: text.actions, minWidth: 120 },
  ];

  // const loadSawanih = useCallback(async () => {
  //   try {
  //     const response = await getAllSawanih();
  //     console.log(response.data);
  //     setSawanih(response.data);
  //   } catch (error) {
  //     console.error(error);
  //     toast.error(text.loadError);
  //   }
  // }, [text.loadError]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadSawanih = useCallback(async () => {
    try {
      const params = {
        page,
        size: rowsPerPage,
        field,
        term: debouncedTerm,
        ...(tabValue === 1 && { isSawanih: true }),
        ...(tabValue === 2 && { isSawanih: false }),
      };
      const response = await getAllSawanih(params);
      setSawanih(response.data.content);
      setTotalCount(response.data.totalElements);
    } catch (error) {
      toast.error(text.loadError || "د معلوماتو د بارولو کې ستونزه");
    }
  }, [page, rowsPerPage, field, debouncedTerm, tabValue]);
  useEffect(() => {
    loadSawanih();
  }, [loadSawanih]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFieldChange = (e) => {
    setField(e.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleView = async () => {
    try {
      const response = await getSawanihById(selectedSawanih.id); // ← fetch full record
      setSelectedSawanih(response.data); // ← replace summary with full entity
      setOpenViewDialog(true);
    } catch (error) {
      toast.error("د معلوماتو د بارولو کې ستونزه");
    }
    handleClose();
  };

  const handleCloseView = () => {
    setOpenViewDialog(false);
    setSelectedSawanih(null);
  };

  const handleClick = (event, report) => {
    setAnchorEl(event.currentTarget);
    setSelectedSawanih(report);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = async () => {
    try {
      const response = await getSawanihById(selectedSawanih.id); // ← fetch full record
      setSelectedSawanih(response.data); // ← replace DTO with full entity
      setOpenEditDialog(true);
    } catch (error) {
      toast.error("د معلوماتو د بارولو کې ستونزه");
    }
    handleClose();
  };
  const handleCloseEdit = () => {
    setOpenEditDialog(false);
    setSelectedSawanih(null);
  };

  const handleEditSuccess = () => {
    loadSawanih();
  };

  // const filteredReport = useMemo(() => {
  //   let data = [...sawanih];

  //   // Tab filter
  //   if (tabValue === 1) {
  //     data = data.filter((r) => r.isSawanih === true); // Sawanih
  //   } else if (tabValue === 2) {
  //     data = data.filter((r) => r.isSawanih === false); // Istekhdam
  //   }

  //   // Search filter
  //   if (searchTerm?.trim()) {
  //     const searchValue = searchTerm.toLowerCase().trim();

  //     data = data.filter((row) => {
  //       switch (field) {
  //         case "name":
  //           return row.name?.toLowerCase()?.includes(searchValue) ?? false;
  //         case "fatherName":
  //           return (
  //             row.fatherName?.toLowerCase()?.includes(searchValue) ?? false
  //           );
  //         case "org":
  //           return row.org?.name?.toLowerCase()?.includes(searchValue) ?? false;
  //         default:
  //           return true;
  //       }
  //     });
  //   }

  //   // Newest first
  //   data.sort((a, b) => b.id - a.id);

  //   return data;
  // }, [sawanih, tabValue, searchTerm, field]);

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
    handleClose();
  };

  const handleNewSawanih = () => {
    navigate("/sawanih/add-sawanih?type=sawanih");
  };

  const handleNewIstekhdam = () => {
    navigate("/sawanih/add-sawanih?type=istekhdam");
  };

  const handleDelete = async () => {
    try {
      await deleteSawanih(selectedSawanih.id);
      loadSawanih();
      toast.success(text.deleteSuccess);
    } catch (error) {
      console.error("Failed to delete sawanih", error);
      toast.error(text.deleteError);
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

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
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleNewSawanih}
            >
              {text.newSawanih || "نوې سوانح"}
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              onClick={handleNewIstekhdam}
            >
              {text.newIsteqdam || "نوې استخدام"}
            </Button>
          </Box>

          <Box sx={{ textAlign: "right" }}>
            <PageBreadcrumbs />
          </Box>
        </Box>

        {/* Tabs: All / Sawanih / Istekhdam */}
        <Paper elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label={text.all || "ټول"} />
            <Tab label={text.sawanih || "سوانح"} />
            <Tab label={text.isteqdam || "استخدام"} />
          </Tabs>
        </Paper>

        <Paper sx={{ p: 2, mb: 4, borderRadius: 2 }}>
          <Filter
            value={searchTerm}
            onChange={handleSearch}
            field={field}
            onFieldChange={handleFieldChange}
            fields={[
              { value: "name", label: text.name },
              { value: "fatherName", label: text.fatherName },
              { value: "org", label: text.org },
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
                {sawanih.map((row) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    <TableCell align="center">{row.name || "N/A"}</TableCell>
                    <TableCell align="center">
                      {row.fatherName || "N/A"}
                    </TableCell>
                    <TableCell align="center">{row.orgName || "N/A"}</TableCell>
                    <TableCell align="center">
                      {formatHijriDateForDisplay(row.incommingDate) || "N/A"}
                    </TableCell>

                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "inline-block",
                          px: 2,
                          py: 0.5,
                          borderRadius: "999px",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          backgroundColor: row.isSawanih
                            ? "#2196F3"
                            : "#4CAF50",
                          color: "white",
                        }}
                      >
                        {row.isSawanih ? "سوانح" : "استخدام"}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={(e) => handleClick(e, row)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                      >
                        <MenuItem onClick={handleView}>
                          <VisibilityIcon
                            fontSize="small"
                            style={{ marginRight: 8 }}
                          />
                          {text.view}
                        </MenuItem>
                        <MenuItem onClick={handleEdit}>
                          <EditIcon
                            fontSize="small"
                            style={{ marginRight: 8 }}
                          />
                          {text.edit}
                        </MenuItem>
                        <MenuItem
                          onClick={handleDeleteClick}
                          style={{ color: red[500] }}
                        >
                          <DeleteIcon
                            fontSize="small"
                            style={{ marginRight: 8, color: red[500] }}
                          />
                          {text.delete}
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

      {/* View Dialog */}
      <ViewSawanih
        open={openViewDialog}
        onClose={handleCloseView}
        report={selectedSawanih}
      />

      {/* Edit Dialog */}
      <EditSawanihDialog
        open={openEditDialog}
        onClose={handleCloseEdit}
        sawanih={selectedSawanih}
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
          {text.deleteDialogTitle}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {text.deleteDialogText}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>
            {text.cancel}
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            {text.delete}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
