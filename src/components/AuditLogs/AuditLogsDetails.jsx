import { ArrowBack } from "@mui/icons-material";
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
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import getAuditLogsDetailsTexts from "../../helpers/getAuditLogsDetailsTexts"; // adjust path

const AuditLogsDetails = () => {
  const { recordId } = useParams();
  const { t } = useTranslation("auditLogsDetails"); // ← change namespace if you used different name
  const texts = getAuditLogsDetailsTexts(t);

  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/audit/note/${recordId}`);
      setAuditLogs(res.data || []);
    } catch (err) {
      const errMsg = err?.response?.data?.message || texts.error.fetch;
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recordId) fetchLogs();
  }, [recordId]);

  const getActionColor = (action) => {
    switch (action?.toUpperCase()) {
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
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const displayedLogs = auditLogs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button
          startIcon={<ArrowBack />}
          variant="outlined"
          onClick={() => navigate(-1)}
        >
          {texts.backButton}
        </Button>
      </Box>

      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        {texts.pageTitle.replace("{{recordId}}", recordId)}
      </Typography>

      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
        {loading ? (
          <Box
            sx={{
              height: 400,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              {texts.loading}
            </Typography>
          </Box>
        ) : auditLogs.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="info">{texts.noLogsFound}</Alert>
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
                      {texts.table.tableName}
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedLogs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        <Chip
                          label={log.action || texts.unknown}
                          size="small"
                          color={getActionColor(log.action)}
                        />
                      </TableCell>
                      <TableCell>{log.username || texts.unknown}</TableCell>
                      <TableCell>{log.tableName || texts.unknown}</TableCell>
                      <TableCell>{log.recordId || texts.unknown}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {log.recordContent || texts.unknown}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {log.timestamp
                            ? moment(log.timestamp).format(
                                "MMM DD, YYYY hh:mm A",
                              )
                            : texts.unknown}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={auditLogs.length}
              page={page}
              onPageChange={(e, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
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

export default AuditLogsDetails;
