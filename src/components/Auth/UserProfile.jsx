// import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useMyContext } from "../../store/ContextApi";
import Avatar from "@mui/material/Avatar";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import InputField from "../InputField/InputField";
import { useForm } from "react-hook-form";
import Buttons from "../../utils/Buttons";
import Switch from "@mui/material/Switch";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { Blocks } from "react-loader-spinner";
import moment from "moment";
import Errors from "../Errors";
import { Chip, Box, Typography, Card } from "@mui/material";
import { getUserManagement } from "../../utils/managementUtils";
import { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { Paper } from "@mui/material";
import { getUserProfileTexts } from "./userProfileTexts";
import { useTranslation } from "react-i18next";

const UserProfile = () => {
  const { t } = useTranslation("userProfile");
  const texts = getUserProfileTexts(t);

  const { currentUser, token, isAdmin, mode } = useMyContext();
  const theme = useTheme();

  const [loginSession, setLoginSession] = useState(null);
  const [credentialExpireDate, setCredentialExpireDate] = useState(null);
  const [pageError, setPageError] = useState(false);
  const [userManagement, setUserManagement] = useState(null);

  const [accountExpired, setAccountExpired] = useState();
  const [accountLocked, setAccountLock] = useState();
  const [accountEnabled, setAccountEnabled] = useState();
  const [credentialExpired, setCredentialExpired] = useState();

  const [openAccount, setOpenAccount] = useState(false);
  const [openSetting, setOpenSetting] = useState(false);

  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);
  const [pageLoader, setPageLoader] = useState(false);
  const [disabledLoader, setDisabledLoader] = useState(false);
  const [twofaCodeLoader, setTwofaCodeLoader] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: currentUser?.username,
      email: currentUser?.email,
      password: "",
    },
    mode: "onTouched",
  });

  // Load user management info
  useEffect(() => {
    const management = getUserManagement();
    setUserManagement(management);
  }, []);

  // Load 2FA status
  useEffect(() => {
    setPageLoader(true);
    const fetch2FAStatus = async () => {
      try {
        const response = await api.get(`/auth/user/2fa-status`);
        setIs2faEnabled(response.data.is2faEnabled);
      } catch (error) {
        setPageError(error?.response?.data?.message || texts.updateFailed);
        toast.error(texts.updateFailed);
      } finally {
        setPageLoader(false);
      }
    };
    fetch2FAStatus();
  }, [texts.updateFailed]);

  // Populate user credentials
  useEffect(() => {
    if (currentUser?.id) {
      setValue("username", currentUser.username);
      setValue("email", currentUser.email);
      setAccountExpired(!currentUser.accountNonExpired);
      setAccountLock(!currentUser.accountNonLocked);
      setAccountEnabled(currentUser.enabled);
      setCredentialExpired(!currentUser.credentialsNonExpired);

      const expiredFormatDate = moment(
        currentUser?.credentialsExpiryDate
      ).format("D MMMM YYYY");
      setCredentialExpireDate(expiredFormatDate);
    }
  }, [currentUser, setValue]);

  // Decode token for last login
  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      const lastLoginSession = moment
        .unix(decodedToken.iat)
        .format("dddd, D MMMM YYYY, h:mm A");
      setLoginSession(lastLoginSession);
    }
  }, [token]);

  const enable2FA = async () => {
    setDisabledLoader(true);
    try {
      const response = await api.post(`/auth/enable-2fa`);
      setQrCodeUrl(response.data);
      setStep(2);
    } catch (error) {
      toast.error(texts.updateFailed);
    } finally {
      setDisabledLoader(false);
    }
  };

  const disable2FA = async () => {
    setDisabledLoader(true);
    try {
      await api.post(`/auth/disable-2fa`);
      setIs2faEnabled(false);
      setQrCodeUrl("");
    } catch (error) {
      toast.error(texts.updateFailed);
    } finally {
      setDisabledLoader(false);
    }
  };

  const verify2FA = async () => {
    if (!code || code.trim().length === 0)
      return toast.error(texts.enter2FACode);

    setTwofaCodeLoader(true);
    try {
      const formData = new URLSearchParams();
      formData.append("code", code);

      const response = await api.post(`/auth/verify-2fa`, formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      if (response.data?.token)
        localStorage.setItem("token", response.data.token);

      toast.success(texts.twoFAVerifySuccess);
      setIs2faEnabled(true);
      setStep(1);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 400 || status === 422) toast.error(texts.twoFAVerifyFail);
      else if (status === 401) toast.error(texts.twoFAError);
      else toast.error(texts.updateFailed);
    } finally {
      setTwofaCodeLoader(false);
    }
  };

  const handleUpdateCredential = async (data) => {
    try {
      setLoading(true);
      const formData = new URLSearchParams();
      formData.append("token", token);
      formData.append("newUsername", data.username);
      formData.append("newPassword", data.password);

      await api.post("/auth/update-credentials", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      toast.success(texts.updateSuccess);
    } catch (error) {
      toast.error(texts.updateFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountStatus = async (type, value) => {
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("token", token);
      formData.append(type, value);

      let url = "";
      switch (type) {
        case "expire":
          url = "/auth/update-expiry-status";
          break;
        case "lock":
          url = "/auth/update-lock-status";
          break;
        case "enabled":
          url = "/auth/update-enabled-status";
          break;
        case "credentialExpire":
          url = "/auth/update-credentials-expiry-status";
          break;
      }

      await api.put(url, formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      toast.success(texts.updateSuccess);
    } catch (error) {
      toast.error(texts.updateFailed);
    } finally {
      setLoading(false);
    }
  };

  if (pageError) return <Errors message={pageError} />;

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 74px)",
        py: 5,
        bgcolor: theme.palette.background.default,
      }}
    >
      {pageLoader ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "18rem",
          }}
        >
          <Blocks
            height="70"
            width="70"
            color={theme.palette.success.main}
            ariaLabel="blocks-loading"
            visible
          />
          <Typography sx={{ color: theme.palette.text.secondary }}>
            {texts.pleaseWait}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            width: { xl: "70%", lg: "80%", sm: "90%", xs: "100%" },
            mx: "auto",
            px: { sm: 0, xs: 2 },
            minHeight: 500,
            display: "flex",
            flexDirection: { lg: "row", xs: "column" },
            gap: 2,
          }}
        >
          {/* Left Panel */}
          <Paper
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              p: 3,
              bgcolor: theme.palette.background.paper,
              boxShadow: theme.shadows[3],
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Avatar
                alt={currentUser?.username}
                src="/static/images/avatar/1.jpg"
                sx={{ width: 80, height: 80 }}
              />
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, color: theme.palette.text.primary }}
              >
                {currentUser?.username}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {isAdmin ? (
                  <Chip
                    label={texts.accountSetting}
                    color="error"
                    sx={{ fontWeight: 600, fontFamily: "B nazanin" }}
                  />
                ) : userManagement ? (
                  <Chip
                    label={userManagement.managementName}
                    color="primary"
                    sx={{ fontFamily: "B nazanin", fontWeight: 600 }}
                  />
                ) : (
                  <Chip
                    label={texts.accountLocked}
                    color="warning"
                    sx={{ fontFamily: "B nazanin", fontWeight: 600 }}
                  />
                )}
              </Box>
            </Box>

            {/* Management Info Card */}
            {userManagement && !isAdmin && (
              <Card
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: mode === "dark" ? "#2e2e2e" : "#f5f5f5",
                  boxShadow: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: "B nazanin",
                    fontWeight: 600,
                    mb: 1,
                    color: theme.palette.text.primary,
                  }}
                >
                  {texts.accountSetting}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "B nazanin",
                    color: theme.palette.text.primary,
                  }}
                >
                  څانګه: {userManagement.managementName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: "B nazanin",
                    color: theme.palette.text.secondary,
                  }}
                >
                  {texts.credentialExpireInfo.replace(
                    "{date}",
                    credentialExpireDate
                  )}
                </Typography>
              </Card>
            )}

            {/* User Credential Form */}
            <Box sx={{ my: 2 }}>
              <Accordion
                expanded={openAccount}
                onChange={() => setOpenAccount(!openAccount)}
                sx={{
                  bgcolor: theme.palette.background.paper,
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ArrowDropDownIcon />}
                  sx={{ bgcolor: theme.palette.background.paper }}
                >
                  <Typography
                    sx={{
                      color: theme.palette.text.primary,
                      fontSize: "1.125rem",
                      fontWeight: 600,
                    }}
                  >
                    {texts.updateUserCredentials}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <form
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                    onSubmit={handleSubmit(handleUpdateCredential)}
                  >
                    <InputField
                      label={texts.usernameLabel}
                      required
                      id="username"
                      type="text"
                      placeholder={texts.usernamePlaceholder}
                      register={register}
                      errors={errors}
                    />
                    <InputField
                      label={texts.emailLabel}
                      required
                      id="email"
                      type="email"
                      placeholder={texts.emailPlaceholder}
                      register={register}
                      errors={errors}
                      readOnly
                    />
                    <InputField
                      label={texts.passwordLabel}
                      id="password"
                      type="password"
                      placeholder={texts.passwordPlaceholder}
                      register={register}
                      errors={errors}
                      min={6}
                    />
                    <Buttons
                      disabled={loading}
                      className="font-semibold text-white w-full py-2 rounded-sm"
                      style={{
                        backgroundColor:
                          mode === "dark" ? "#1e1e1e" : "#212B36",
                      }}
                      type="submit"
                    >
                      {loading ? texts.pleaseWait : texts.updateButton}
                    </Buttons>
                  </form>
                </AccordionDetails>
              </Accordion>

              {/* Account Settings */}
              <Accordion
                expanded={openSetting}
                onChange={() => setOpenSetting(!openSetting)}
                sx={{
                  bgcolor: theme.palette.background.paper,
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ArrowDropDownIcon />}
                  sx={{ bgcolor: theme.palette.background.paper }}
                >
                  <Typography
                    sx={{
                      color: theme.palette.text.primary,
                      fontSize: "1.125rem",
                      fontWeight: 600,
                    }}
                  >
                    {texts.accountSetting}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        {texts.accountExpired}
                      </Typography>
                      <Switch
                        checked={accountExpired}
                        onChange={(e) => {
                          setAccountExpired(e.target.checked);
                          handleAccountStatus("expire", e.target.checked);
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        {texts.accountLocked}
                      </Typography>
                      <Switch
                        checked={accountLocked}
                        onChange={(e) => {
                          setAccountLock(e.target.checked);
                          handleAccountStatus("lock", e.target.checked);
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        {texts.accountEnabled}
                      </Typography>
                      <Switch
                        checked={accountEnabled}
                        onChange={(e) => {
                          setAccountEnabled(e.target.checked);
                          handleAccountStatus("enabled", e.target.checked);
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        {texts.credentialExpired}
                      </Typography>
                      <Switch
                        checked={credentialExpired}
                        onChange={(e) => {
                          setCredentialExpired(e.target.checked);
                          handleAccountStatus(
                            "credentialExpire",
                            e.target.checked
                          );
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: theme.palette.text.secondary, mt: 1 }}
                      >
                        {texts.credentialExpireInfo.replace(
                          "{date}",
                          credentialExpireDate
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Last Login */}
              <Box sx={{ pt: 5 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  {texts.lastLoginSession}
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: theme.palette.background.paper,
                    boxShadow: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    {texts.lastLoginSession}: <span>{loginSession}</span>
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </Paper>

          {/* Right Panel - 2FA */}
          <Paper
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              p: 3,
              bgcolor: theme.palette.background.paper,
              boxShadow: theme.shadows[3],
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: theme.palette.text.primary,
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontWeight: 700,
              }}
            >
              <span>{texts.mfaTitle}</span>
              <Chip
                label={is2faEnabled ? texts.mfaEnabled : texts.mfaDisabled}
                color={is2faEnabled ? "success" : "error"}
                size="small"
                sx={{ fontFamily: "B nazanin" }}
              />
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                mt: 1,
                fontFamily: "B nazanin",
              }}
            >
              {texts.mfaDescription}
            </Typography>

            <Buttons
              disabled={disabledLoader}
              onClickhandler={is2faEnabled ? disable2FA : enable2FA}
              className="px-5 py-1 mt-2 text-white rounded-sm"
              style={{ backgroundColor: is2faEnabled ? "#d32f2f" : "#212B36" }}
            >
              {disabledLoader
                ? texts.pleaseWait
                : is2faEnabled
                ? texts.disableMFA
                : texts.enableMFA}
            </Buttons>

            {step === 2 && (
              <Accordion
                sx={{
                  mt: 2,
                  bgcolor: theme.palette.background.paper,
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.125rem",
                      color: theme.palette.text.primary,
                      fontFamily: "B nazanin",
                    }}
                  >
                    {texts.enter2FACode}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    style={{ marginBottom: "1rem" }}
                  />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <input
                      type="text"
                      placeholder={texts.enter2FACode}
                      value={code}
                      required
                      onChange={(e) => setCode(e.target.value)}
                      style={{
                        border: `1px solid ${theme.palette.divider}`,
                        padding: "0.5rem",
                        borderRadius: "0.375rem",
                        flex: 1,
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                      }}
                    />
                    <button
                      onClick={verify2FA}
                      style={{
                        backgroundColor: theme.palette.primary.main,
                        color: "#fff",
                        padding: "0.5rem 0.75rem",
                        height: "2.5rem",
                        borderRadius: "0.375rem",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {twofaCodeLoader ? texts.pleaseWait : texts.verify2FA}
                    </button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default UserProfile;
