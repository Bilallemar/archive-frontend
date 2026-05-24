import { Box, Paper } from "@mui/material";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useMyContext } from "../../store/ContextApi";
import Buttons from "../../utils/Buttons";
import InputField from "../InputField/InputField";

const Signup = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [role, setRole] = useState();
  const [loading, setLoading] = useState(false);
  const { token, mode } = useMyContext();
  const navigate = useNavigate();
  const theme = useTheme();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    setRole("ROLE_USER");
  }, []);

  const onSubmitHandler = async (data) => {
    const { username, email, password } = data;
    const sendData = {
      username,
      email,
      password,
      role: [role],
    };

    try {
      setLoading(true);
      const response = await api.post("/auth/public/signup", sendData);
      toast.success("Register Successful");
      reset();
      if (response.data) {
        navigate("/login");
      }
    } catch (error) {
      if (
        error?.response?.data?.message === "Error: Username is already taken!"
      ) {
        setError("username", { message: "username is already taken" });
      } else if (
        error?.response?.data?.message === "Error: Email is already in use!"
      ) {
        setError("email", { message: "Email is already in use" });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) navigate("/");
  }, [navigate, token]);

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 74px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: theme.palette.background.default,
        px: 2,
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit(onSubmitHandler)}
        sx={{
          width: { xs: 360, sm: 450 },
          p: { xs: 3, sm: 4 },
          bgcolor: theme.palette.background.paper,
          boxShadow: theme.shadows[3],
          borderRadius: 2,
        }}
      >
        <Box sx={{ mb: 3 }}>
          <h1
            style={{
              fontFamily: "Montserrat",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "2rem",
              color: theme.palette.text.primary,
            }}
          >
            Register Here
          </h1>
          <p
            style={{
              color: theme.palette.text.secondary,
              textAlign: "center",
              fontSize: "0.875rem",
            }}
          >
            Enter your credentials to create new account
          </p>

          {/* OAuth Buttons */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              py: 3,
            }}
          >
            <a
              href={`${apiUrl}/oauth2/authorization/google`}
              style={{
                display: "flex",
                gap: "0.25rem",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                border: `1px solid ${theme.palette.divider}`,
                padding: "0.5rem",
                borderRadius: "0.375rem",
                backgroundColor: theme.palette.background.paper,
                transition: "all 0.3s",
              }}
            >
              <FcGoogle style={{ fontSize: "1.5rem" }} />
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: theme.palette.text.primary,
                }}
              >
                Login with Google
              </span>
            </a>

            <a
              href={`${apiUrl}/oauth2/authorization/github`}
              style={{
                display: "flex",
                gap: "0.25rem",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                border: `1px solid ${theme.palette.divider}`,
                padding: "0.5rem",
                borderRadius: "0.375rem",
                backgroundColor: theme.palette.background.paper,
                transition: "all 0.3s",
              }}
            >
              <FaGithub
                style={{
                  fontSize: "1.5rem",
                  color: theme.palette.text.primary,
                }}
              />
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: theme.palette.text.primary,
                }}
              >
                Login with Github
              </span>
            </a>
          </Box>

          <Divider
            sx={{ fontWeight: 600, color: theme.palette.text.secondary }}
          >
            OR
          </Divider>
        </Box>

        {/* Form Fields */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <InputField
            label="UserName"
            required
            id="username"
            type="text"
            message="*UserName is required"
            placeholder="type your username"
            register={register}
            errors={errors}
          />
          <InputField
            label="Email"
            required
            id="email"
            type="email"
            message="*Email is required"
            placeholder="type your email"
            register={register}
            errors={errors}
          />
          <InputField
            label="Password"
            required
            id="password"
            type="password"
            message="*Password is required"
            placeholder="type your password"
            register={register}
            errors={errors}
            min={6}
          />
        </Box>

        {/* Submit Button */}
        <Buttons
          disabled={loading}
          onClickhandler={() => {}}
          className="bg-customRed font-semibold flex justify-center text-white w-full py-2 hover:text-slate-400 transition-colors duration-100 rounded-sm my-3"
          type="text"
        >
          {loading ? <span>Loading...</span> : "Register"}
        </Buttons>

        {/* Login Link */}
        <p
          style={{
            textAlign: "center",
            fontSize: "0.875rem",
            color: theme.palette.text.secondary,
            marginTop: "0.5rem",
          }}
        >
          Already have an account?{" "}
          <Link
            style={{
              fontWeight: 600,
              textDecoration: "underline",
              color: theme.palette.text.primary,
            }}
            to="/login"
          >
            Login
          </Link>
        </p>
      </Paper>
    </Box>
  );
};

export default Signup;
