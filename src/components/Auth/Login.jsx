import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useMyContext } from "../../store/ContextApi";
import { setUserManagement } from "../../utils/managementUtils";
import { getLoginTexts } from "./loginTexts";

const Login = () => {
  const { t } = useTranslation("login");
  const texts = getLoginTexts(t);

  const [step, setStep] = useState(1);
  const [tempJwtToken, setTempJwtToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { token, setToken, setCurrentUser, setIsAdmin, mode } = useMyContext();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { username: "", password: "", code: "" },
    mode: "onTouched",
  });

  /* ================= LOGIN SUCCESS ================= */
  const handleSuccessfulLogin = async (data) => {
    try {
      const { jwtToken, username, roles, management, isAdmin } = data;

      localStorage.setItem("JWT_TOKEN", jwtToken);
      const user = { username, roles: roles || [] };
      localStorage.setItem("USER", JSON.stringify(user));
      localStorage.setItem("IS_ADMIN", Boolean(isAdmin));

      if (management) setUserManagement(management);

      setToken(jwtToken);
      setCurrentUser(user);
      setIsAdmin(Boolean(isAdmin));

      toast.success(
        management
          ? `${texts.welcomeBack} ${management.managementName}`
          : texts.welcomeBack,
      );
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error(texts.signIn);
    }
  };

  /* ================= LOGIN HANDLER ================= */
  const onLoginHandler = async (data) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/public/signin", data);

      if (response.status === 200 && response.data.jwtToken) {
        const decodedToken = jwtDecode(response.data.jwtToken);

        if (decodedToken.is2faEnabled) {
          setTempJwtToken(response.data.jwtToken);
          toast.success(texts.verify2FADescription);
          setStep(2);
        } else {
          handleSuccessfulLogin(response.data);
        }

        reset();
      }
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(texts.dontHaveAccount);
      } else {
        toast.error(texts.signIn);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY 2FA HANDLER ================= */
  const onVerify2FaHandler = async (data) => {
    try {
      setLoading(true);
      const formData = new URLSearchParams();
      formData.append("code", data.code);
      formData.append("jwtToken", tempJwtToken);

      const response = await api.post(
        "/auth/public/verify-2fa-login",
        formData,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      );

      handleSuccessfulLogin(response.data);
    } catch {
      toast.error(texts.codeRequired);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) navigate("/");
  }, [token, navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: mode === "dark" ? "#1a1a1a" : "#fff",
      }}
    >
      {/* Left Side - Welcome Section */}
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: 6,
        }}
      >
        {/* Welcome Text */}
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
          {texts.welcomeBack}
        </Typography>
        <Typography variant="body1">{texts.welcomeDescription}</Typography>

        {/* Illustration */}
        <Box sx={{ mt: 4 }}>
          <img
            src="login1.jpg"
            alt="Login Illustration"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </Box>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Paper elevation={0} sx={{ width: "100%", maxWidth: 480, p: 5 }}>
          {step === 1 ? (
            <Box component="form" onSubmit={handleSubmit(onLoginHandler)}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                {texts.info}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 400, mb: 2 }}>
                {texts.signIn}
              </Typography>
              {/* 
              <Typography variant="body2" sx={{ mb: 3 }}>
                {texts.dontHaveAccount}{" "}
                <Link
                  to="/signup"
                  style={{ textDecoration: "none", color: "#1976d2" }}
                >
                  {texts.getStarted}
                </Link>
              </Typography> */}

              {/* Demo Info */}
              {/* <Alert severity="info" sx={{ mb: 3 }}>
                Use <strong>admin</strong> / <strong>adminPass</strong>
              </Alert> */}

              {/* Username Field */}
              <TextField
                {...register("username", { required: texts.usernameRequired })}
                fullWidth
                label={texts.usernameLabel}
                placeholder={texts.usernamePlaceholder}
                error={!!errors.username}
                helperText={errors.username?.message}
                sx={{ mb: 3 }}
              />

              {/* Password Field */}
              <TextField
                {...register("password", { required: texts.passwordRequired })}
                fullWidth
                label={texts.passwordLabel}
                placeholder={texts.passwordPlaceholder}
                type={showPassword ? "text" : "password"}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {/* <Box sx={{ textAlign: "right", mb: 3 }}>
                <Link
                  to="/forgot-password"
                  style={{ textDecoration: "none", fontSize: "0.875rem" }}
                >
                  {texts.forgotPassword}
                </Link>
              </Box> */}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
              >
                {loading ? texts.loading : texts.signInButton}
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit(onVerify2FaHandler)}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                {texts.verify2FAButton}
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                {texts.verify2FADescription}
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <TextField
                {...register("code", { required: texts.codeRequired })}
                fullWidth
                label={texts.codeRequired}
                placeholder={texts.codeRequired}
                error={!!errors.code}
                helperText={errors.code?.message}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
              >
                {loading ? texts.loading : texts.verify2FAButton}
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
