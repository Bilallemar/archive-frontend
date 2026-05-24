import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl, // ← ADD
  InputLabel, // ← ADD
  MenuItem, // ← ADD
  Paper,
  Select, // ← ADD
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import moment from "moment";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  assignUserToManagement,
  getAllManagements,
  getManagementStatistics,
} from "../../services/ManagementApi";
import api from "../../services/api";
import CreateUserDialog from "../AuditLogs/CreateUserDialog";
import { getUserManagementTexts } from "./userManagementTexts";

const UserManagementPanel = () => {
  const { t } = useTranslation("userManagement");
  const texts = getUserManagementTexts(t);

  const [users, setUsers] = useState([]);
  const [managements, setManagements] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedManagements, setSelectedManagements] = useState({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Load data function
  const loadData = async () => {
    try {
      setLoading(true);

      const usersRes = await api.get("/admin/users");
      const managementsRes = await getAllManagements();
      const statsRes = await getManagementStatistics();

      const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
      const managementsData = Array.isArray(managementsRes)
        ? managementsRes
        : [];

      setUsers(usersData);
      setManagements(managementsData);
      setStatistics(statsRes);

      // Initialize selected managements
      const initialSelections = {};
      usersData.forEach((user) => {
        initialSelections[user.userId] = user.management?.managementId || "";
      });
      setSelectedManagements(initialSelections);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error(texts.errorLoadData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);
  const handleToggleUserStatus = (userId, currentStatus) => {
    setSelectedUser({ userId, currentStatus });
    setConfirmOpen(true);
  };
  const handleManagementChange = (userId, managementId) => {
    setSelectedManagements((prev) => ({ ...prev, [userId]: managementId }));
  };

  const handleAssignManagement = async (userId) => {
    const managementId = selectedManagements[userId];
    if (!managementId) {
      toast.error(texts.errorSelectManagement);
      return;
    }

    try {
      await assignUserToManagement(userId, managementId);
      toast.success(texts.successAssign);
      loadData();
    } catch (error) {
      console.error("Failed to assign management:", error);
      toast.error(texts.errorAssign);
    }
  };
  const confirmToggleUserStatus = async () => {
    if (!selectedUser) return;

    const { userId, currentStatus } = selectedUser;
    const action = currentStatus ? "غیر فعال" : "فعال";

    try {
      const formData = new URLSearchParams();
      formData.append("userId", userId);
      formData.append("enabled", !currentStatus);

      await api.put("/admin/update-enabled-status", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      toast.success(`کاربر ${action} شو`);
      loadData();
    } catch (error) {
      toast.error("ستونزه پېښه شوه");
    } finally {
      setConfirmOpen(false);
      setSelectedUser(null);
    }
  };
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight={600}>
          {texts.pageTitle}
        </Typography>
        <Button
          variant="contained"
          onClick={() => setCreateDialogOpen(true)}
          startIcon={<AddIcon />}
          sx={{ bgcolor: "#2196F3", "&:hover": { bgcolor: "#1976D2" } }}
        >
          {texts.newUser}
        </Button>
      </Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        {texts.assignInfo}
      </Alert>
      {/* Statistics Cards */}
      {statistics && (
        <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
          {statistics.managementStatistics?.map((stat) => (
            <Card
              key={stat.managementId}
              sx={{ padding: 2, minWidth: 200, boxShadow: 2 }}
            >
              <Typography variant="h6" color="primary">
                {stat.managementName}
              </Typography>
              <Typography variant="h4">{stat.userCount}</Typography>
              <Typography variant="caption" color="text.secondary">
                {texts.statisticsUsersAssigned}
              </Typography>
            </Card>
          ))}
          <Card
            sx={{
              padding: 2,
              minWidth: 200,
              bgcolor: "warning.light",
              boxShadow: 2,
            }}
          >
            <Typography variant="h6">{texts.unassignedLabel}</Typography>
            <Typography variant="h4">
              {statistics.unassignedUserCount}
            </Typography>
            <Typography variant="caption">
              {texts.statisticsUnassignedUsers}
            </Typography>
          </Card>
        </Box>
      )}
      {/* Users Table */}
      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: 600 }}>{texts.username}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{texts.email}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{texts.role}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  {texts.currentManagement}
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  {texts.assignNewManagement}
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  {texts.createdDate}
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{texts.actions}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => {
                const roleString = user.role?.roleName || "";
                const isAdmin =
                  roleString === "ROLE_ADMIN" ||
                  roleString === "ADMIN" ||
                  user.role?.isAdmin;

                const currentManagement = user.management;
                const displayRole = roleString.replace("ROLE_", "");
                const formattedDate = user.createdDate
                  ? moment(user.createdDate).format("MMM DD, YYYY")
                  : "—";

                return (
                  <TableRow key={user.userId} hover>
                    {/* Username */}
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography>{user.userName}</Typography>
                        {isAdmin && (
                          <Chip
                            label={texts.adminLabel}
                            size="small"
                            color="error"
                          />
                        )}
                      </Box>
                    </TableCell>

                    {/* Email */}
                    <TableCell>{user.email}</TableCell>

                    {/* Role */}
                    <TableCell>
                      <Chip
                        label={displayRole}
                        size="small"
                        color={isAdmin ? "error" : "default"}
                      />
                    </TableCell>

                    {/* Current Management */}
                    <TableCell>
                      {isAdmin ? (
                        <Chip
                          label={texts.allManagementsLabel}
                          color="success"
                          size="small"
                        />
                      ) : currentManagement ? (
                        <Chip
                          label={currentManagement.managementName}
                          color="primary"
                          size="small"
                        />
                      ) : (
                        <Typography sx={{ color: "text.secondary" }}>
                          {texts.unassignedLabel}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Assign New Management */}
                    <TableCell>
                      {isAdmin ? (
                        <Typography
                          sx={{ color: "text.secondary", fontStyle: "italic" }}
                        >
                          {texts.adminAccessNote}
                        </Typography>
                      ) : (
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                          <InputLabel>{texts.selectManagement}</InputLabel>
                          <Select
                            value={selectedManagements[user.userId] || ""}
                            onChange={(e) =>
                              handleManagementChange(
                                user.userId,
                                e.target.value,
                              )
                            }
                          >
                            <MenuItem value="">
                              <em>None</em>
                            </MenuItem>
                            {managements.map((mgmt) => (
                              <MenuItem
                                key={mgmt.managementId}
                                value={mgmt.managementId}
                              >
                                {mgmt.managementName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </TableCell>

                    {/* Created Date */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        {formattedDate}
                      </Typography>
                    </TableCell>

                    {/* Actions — assign + disable */}
                    <TableCell>
                      {isAdmin ? (
                        <Typography
                          sx={{ color: "text.secondary", fontSize: "0.875rem" }}
                        >
                          {texts.adminAccessNote}
                        </Typography>
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            flexDirection: "column",
                          }}
                        >
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleAssignManagement(user.userId)}
                            disabled={
                              !selectedManagements[user.userId] ||
                              selectedManagements[user.userId] ===
                                currentManagement?.managementId
                            }
                          >
                            {texts.assignButton}
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            color={user.enabled ? "error" : "success"}
                            onClick={() =>
                              handleToggleUserStatus(user.userId, user.enabled)
                            }
                          >
                            {user.enabled ? "غیر فعال کول" : "فعال کول"}
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      <CreateUserDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => {
          setCreateDialogOpen(false);
          loadData(); // ← refreshes the user list
        }}
      />
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>تایید</DialogTitle>

        <DialogContent>
          <Typography>
            {selectedUser &&
              `ایا تاسو ډاډه یاست چې دا کاربر ${
                selectedUser.currentStatus ? "غیر فعال" : "فعال"
              } کړئ؟`}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>لغوه</Button>
          <Button
            onClick={confirmToggleUserStatus}
            color="error"
            variant="contained"
          >
            تایید
          </Button>
        </DialogActions>
      </Dialog>
      ;
    </Box>
  );
};

export default UserManagementPanel;
