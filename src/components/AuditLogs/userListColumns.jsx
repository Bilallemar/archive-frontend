// src/components/users/userListColumns.js
export const getUserListColumns = (t) => [
  {
    field: "username",
    headerName: t("columns.username"),
    minWidth: 200,
    align: "center",
    headerAlign: "center",
    disableColumnMenu: true,
  },
  {
    field: "email",
    headerName: t("columns.email"),
    width: 260,
    align: "center",
    headerAlign: "center",
    disableColumnMenu: true,
  },
  {
    field: "created",
    headerName: t("columns.createdAt"),
    width: 220,
    align: "center",
    headerAlign: "center",
    disableColumnMenu: true,
  },
  {
    field: "status",
    headerName: t("columns.status"),
    width: 200,
    align: "center",
    headerAlign: "center",
    disableColumnMenu: true,
  },
  {
    field: "action",
    headerName: t("columns.action"),
    width: 200,
    align: "center",
    headerAlign: "center",
    sortable: false,
  },
];
