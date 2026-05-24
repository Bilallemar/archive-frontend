import { Visibility } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
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
import moment from "moment";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import getAuditLogsTexts from "../../helpers/getAuditLogsTexts"; // ← adjust path

const AdminAuditLogs = () => {
  const { t } = useTranslation("adminAuditLogs");
  const texts = getAuditLogsTexts(t);

  const [auditLogs, setAuditLogs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/audit");
      setAuditLogs(response.data || []);
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || texts.error.fetchFailed;
      setError(errorMessage);
      toast.error(texts.error.fetchFailed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return texts.unknown;
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const getActionColor = (action) => {
    const upper = (action || "").toUpperCase();
    switch (upper) {
      case "CREATE":
        return "success";
      case "UPDATE":
        return "info";
      case "DELETE":
        return "error";
      default:
        return "default";
    }
  };

  if (error) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const createCount = auditLogs.filter((log) => log.action === "CREATE").length;
  const updateCount = auditLogs.filter((log) => log.action === "UPDATE").length;
  const deleteCount = auditLogs.filter((log) => log.action === "DELETE").length;
  const totalCount = auditLogs.length;

  const displayedLogs = auditLogs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        {texts.title}
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        {texts.description}
      </Alert>

      {/* Statistics Cards */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Card sx={{ padding: 2, minWidth: 150, boxShadow: 2 }}>
          <Typography variant="h6" color="success.main">
            {texts.stats.create}
          </Typography>
          <Typography variant="h4">{createCount}</Typography>
          <Typography variant="caption" color="text.secondary">
            {texts.stats.createLabel}
          </Typography>
        </Card>

        <Card sx={{ padding: 2, minWidth: 150, boxShadow: 2 }}>
          <Typography variant="h6" color="info.main">
            {texts.stats.update}
          </Typography>
          <Typography variant="h4">{updateCount}</Typography>
          <Typography variant="caption" color="text.secondary">
            {texts.stats.updateLabel}
          </Typography>
        </Card>

        <Card sx={{ padding: 2, minWidth: 150, boxShadow: 2 }}>
          <Typography variant="h6" color="error.main">
            {texts.stats.delete}
          </Typography>
          <Typography variant="h4">{deleteCount}</Typography>
          <Typography variant="caption" color="text.secondary">
            {texts.stats.deleteLabel}
          </Typography>
        </Card>

        <Card
          sx={{
            padding: 2,
            minWidth: 150,
            boxShadow: 2,
            bgcolor: "primary.light",
          }}
        >
          <Typography variant="h6">{texts.stats.total}</Typography>
          <Typography variant="h4">{totalCount}</Typography>
          <Typography variant="caption">{texts.stats.totalLabel}</Typography>
        </Card>
      </Box>

      {/* Audit Logs Table */}
      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "400px",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              {texts.loading}
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {texts.table.action}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {texts.table.username}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {texts.table.tableModel}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {texts.table.recordId}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {texts.table.content}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {texts.table.timestamp}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>
                      {texts.table.actions}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                        <Typography variant="body1" color="text.secondary">
                          {texts.noData}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedLogs.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell>
                          <Chip
                            label={log.action || texts.unknown}
                            size="small"
                            color={getActionColor(log.action)}
                          />
                        </TableCell>
                        <TableCell>{log.username || texts.unknown}</TableCell>
                        <TableCell>
                          <Chip
                            label={log.tableName || texts.unknown}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>{log.recordId || texts.unknown}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {truncateText(log.recordContent)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary" }}
                          >
                            {log.timestamp
                              ? moment(log.timestamp).format(
                                  "MMM DD, YYYY hh:mm A",
                                )
                              : texts.unknown}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() =>
                              navigate(`/admin/audit-logs/${log.recordId}`)
                            }
                            disabled={!log.recordId}
                          >
                            {texts.button.view}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={auditLogs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage={texts.pagination.rowsPerPage}
              labelDisplayedRows={({ from, to, count }) =>
                texts.pagination.displayedRows({ from, to, count })
              }
            />
          </>
        )}
      </Card>
    </Box>
  );
};

export default AdminAuditLogs;
