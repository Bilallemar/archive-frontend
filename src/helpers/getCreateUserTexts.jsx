const getCreateUserTexts = (t) => ({
  // Dialog Title
  title: t("createUser"),

  // Form Labels
  username: t("username"),
  email: t("email"),
  password: t("password"),
  role: t("role"),
  profileImage: t("profileImage"),

  // Buttons
  create: t("create"),
  cancel: t("cancel"),

  // Validation
  requiredFields: t("requiredFields"),

  // Success Messages
  successCreate: t("successCreate"),

  // Errors
  error: t("error"),
  usernamePlaceholder: t("usernamePlaceholder"),
  emailPlaceholder: t("emailPlaceholder"),
  passwordPlaceholder: t("passwordPlaceholder"),
});

export default getCreateUserTexts;
