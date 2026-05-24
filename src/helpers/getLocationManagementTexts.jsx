const getLocationManagementTexts = (t) => ({
  // Page
  title: t("title"),
  // Tabs
  provinces: t("provinces"),
  districts: t("districts"),
  // Buttons
  newProvince: t("newProvince"),
  newDistrict: t("newDistrict"),
  // Table headers
  id: t("id"),
  name: t("name"),
  actions: t("actions"),
  province: t("province"),
  // Dialog titles
  editProvinceTitle: t("editProvinceTitle"),
  newProvinceTitle: t("newProvinceTitle"),
  editDistrictTitle: t("editDistrictTitle"),
  newDistrictTitle: t("newDistrictTitle"),
  // Form labels
  provinceName: t("provinceName"),
  districtName: t("districtName"),
  selectProvince: t("selectProvince"),
  // Actions
  save: t("save"),
  cancel: t("cancel"),
  delete: t("delete"),
  // Delete dialog
  confirmDelete: t("confirmDelete"),
  deleteMessage: t("deleteMessage"),
  // Toast messages
  provinceAdded: t("provinceAdded"),
  provinceUpdated: t("provinceUpdated"),
  provinceDeleted: t("provinceDeleted"),
  districtAdded: t("districtAdded"),
  districtUpdated: t("districtUpdated"),
  districtDeleted: t("districtDeleted"),
  // Errors
  loadError: t("loadError"),
  requiredName: t("requiredName"),
  operationFailed: t("operationFailed"),
  deleteFailed: t("deleteFailed"),
  selectProvinceFirst: t("selectProvinceFirst"),
});

export default getLocationManagementTexts;