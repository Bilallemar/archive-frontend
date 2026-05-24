export const getUserDetailsTexts = (t) => ({
  // Profile Information
  profileTitle: t("profileInformation.title"),
  usernameLabel: t("profileInformation.username.label"),
  usernamePlaceholder: t("profileInformation.username.placeholder"),
  usernameRequired: t("profileInformation.username.requiredMessage"),
  emailLabel: t("profileInformation.email.label"),
  emailPlaceholder: t("profileInformation.email.placeholder"),
  emailRequired: t("profileInformation.email.requiredMessage"),
  passwordLabel: t("profileInformation.password.label"),
  passwordPlaceholder: t("profileInformation.password.placeholder"),
  passwordRequired: t("profileInformation.password.requiredMessage"),
  passwordSave: t("profileInformation.password.saveButton"),
  passwordEdit: t("profileInformation.password.editButton"),
  passwordCancel: t("profileInformation.password.cancelButton"),
  passwordUpdateSuccess: t("profileInformation.password.updateSuccess"),

  // Admin Actions
  adminTitle: t("adminActions.title"),
  roleLabel: t("adminActions.role.label"),
  roleUpdateButton: t("adminActions.role.updateButton"),
  roleUpdateSuccess: t("adminActions.role.updateSuccess"),
  roleUpdateError: t("adminActions.role.updateError"),

  // Checkboxes
  lockLabel: t("adminActions.checkboxes.lock.label"),
  lockSuccess: t("adminActions.checkboxes.lock.successMessage"),
  expireLabel: t("adminActions.checkboxes.expire.label"),
  expireSuccess: t("adminActions.checkboxes.expire.successMessage"),
  enabledLabel: t("adminActions.checkboxes.enabled.label"),
  enabledSuccess: t("adminActions.checkboxes.enabled.successMessage"),
  credentialsExpireLabel: t("adminActions.checkboxes.credentialsExpire.label"),
  credentialsExpireSuccess: t(
    "adminActions.checkboxes.credentialsExpire.successMessage"
  ),

  // Other
  loading: t("loading"),
  errorFetching: t("errorFetching"),
});
