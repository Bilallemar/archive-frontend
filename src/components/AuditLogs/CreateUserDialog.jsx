import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function CreateUserDialog({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "ROLE_USER",
  });
  const [roles, setRoles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (open) {
      api
        .get("/admin/roles")
        .then((res) => setRoles(res.data || []))
        .catch(() => {});
    } else {
      // reset on close
      setFormData({ username: "", email: "", password: "", role: "ROLE_USER" });
      setProfileImage(null);
      setImagePreview(null);
    }
  }, [open]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      toast.error("ټول اړین فیلډونه ډک کړئ");
      return;
    }
    setIsSubmitting(true);
    try {
      // Step 1 — create user
      const res = await api.post("/admin/create-user", formData);
      const newUserId = res.data?.userId;

      // Step 2 — upload profile image if selected
      if (profileImage && newUserId) {
        const fd = new FormData();
        fd.append("file", profileImage);
        await api.post(`/user-management/${newUserId}/profile-image`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.success("کاربر بریالیتوب سره جوړ شو");
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || "ستونزه پیښه شوه");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableRestoreFocus
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ fontWeight: "bold" }}>نوی کاربر جوړول</DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {/* Profile Image Upload */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Avatar
              src={imagePreview}
              sx={{ width: 80, height: 80, bgcolor: "#2196F3", fontSize: 32 }}
            >
              {formData.username?.[0]?.toUpperCase() || "?"}
            </Avatar>
            <Button variant="outlined" component="label" size="small">
              د پروفایل انځور (اختیاري)
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
          </Box>

          <TextField
            label="نوم کاربر *"
            name="username"
            value={formData.username}
            onChange={handleChange}
            size="small"
            fullWidth
            required
          />
          <TextField
            label="ایمیل *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            size="small"
            fullWidth
            required
          />
          <TextField
            label="پاسورډ *"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            size="small"
            fullWidth
            required
            inputProps={{ minLength: 6 }}
          />
          <FormControl size="small" fullWidth>
            <InputLabel>رول</InputLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              label="رول"
            >
              {roles.map((role) => (
                <MenuItem
                  key={role.roleId}
                  value={role.roleName?.name || role.roleName}
                >
                  {role.roleName?.name || role.roleName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={isSubmitting}>
          لغوه
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          sx={{ bgcolor: "#2196F3", "&:hover": { bgcolor: "#1976D2" } }}
        >
          {isSubmitting ? <CircularProgress size={20} /> : "جوړول"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
