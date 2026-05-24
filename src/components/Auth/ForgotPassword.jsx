import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useForm } from "react-hook-form";
import InputField from "../InputField/InputField";
import Buttons from "../../utils/Buttons";
import { Divider } from "@mui/material";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useMyContext } from "../../store/ContextApi";
import { useTranslation } from "react-i18next";
import { getForgotPasswordTexts } from "./forgotPasswordTexts";

const ForgotPassword = () => {
  const { t } = useTranslation("forgotPassword");
  const texts = getForgotPasswordTexts(t); // ✅ use function here

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useMyContext();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  const onPasswordForgotHandler = async (data) => {
    const { email } = data;
    try {
      setLoading(true);

      const formData = new URLSearchParams();
      formData.append("email", email);

      await api.post("/auth/public/forgot-password", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      reset();
      toast.success(texts.messages.success); // ✅ toast uses translation
    } catch (error) {
      toast.error(texts.messages.error); // ✅ toast uses translation
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) navigate("/");
  }, [token, navigate]);

  return (
    <div className="min-h-[calc(100vh-74px)] flex justify-center items-center">
      <form
        onSubmit={handleSubmit(onPasswordForgotHandler)}
        className="sm:w-[450px] w-[360px] shadow-custom py-8 sm:px-8 px-4"
      >
        <div>
          <h1 className="font-montserrat text-center font-bold text-2xl">
            {texts.title}
          </h1>
          <p className="text-slate-600 text-center">{texts.description}</p>
        </div>

        <Divider className="font-semibold pb-4" />

        <div className="flex flex-col gap-2 mt-4">
          <InputField
            label={texts.emailLabel}
            required
            id="email"
            type="email"
            message={texts.emailRequired}
            placeholder={texts.emailPlaceholder}
            register={register}
            errors={errors}
          />
        </div>

        <Buttons
          disabled={loading}
          onClickhandler={() => {}}
          className="bg-customRed font-semibold text-white w-full py-2 hover:text-slate-400 transition-colors duration-100 rounded-sm my-3"
          type="text"
        >
          {loading ? texts.loading : texts.sendButton}
        </Buttons>

        <p className="text-sm text-slate-700">
          <Link className="underline hover:text-black" to="/login">
            {texts.backToLogin}
          </Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
