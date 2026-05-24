import { DataGrid } from "@mui/x-data-grid";
import moment from "moment";
import { useCallback, useEffect, useMemo, useState } from "react"; // ← add useCallback
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Blocks } from "react-loader-spinner";
import api from "../../services/api.jsx";
import Errors from "../Errors.jsx";
import CreateUserDialog from "./CreateUserDialog.jsx"; // ← add this
import { getUserListColumns } from "./userListColumns.jsx";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { t } = useTranslation("users");
  const columns = useMemo(() => getUserListColumns(t), [t]);

  // ← only one fetchUsers, outside useEffect
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/getusers");
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err?.response?.data?.message);
      toast.error(t("messages.fetchError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const rows = users.map((item) => ({
    id: item.userId,
    username: item.userName,
    email: item.email,
    created: moment(item.createdDate).format("MMMM DD, YYYY, hh:mm A"),
    status: item.enabled ? t("status.active") : t("status.inactive"),
  }));

  if (error) return <Errors message={error} />;

  return (
    <div className="p-4">
      {/* ← only one header div */}
      <div className="py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 uppercase">
          {t("title")}
        </h1>
        <button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-btnColor px-4 py-2 rounded-md text-white font-semibold"
        >
          + نوی کاربر
        </button>
      </div>

      <CreateUserDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => {
          setCreateDialogOpen(false);
          fetchUsers();
        }}
      />

      <div className="overflow-x-auto w-full mx-auto">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-72">
            <Blocks
              height="70"
              width="70"
              color="#4fa94d"
              ariaLabel="blocks-loading"
              visible
            />
            <span className="mt-2">{t("messages.loading")}</span>
          </div>
        ) : (
          <DataGrid
            className="w-fit mx-auto"
            rows={rows}
            columns={columns}
            initialState={{ pagination: { paginationModel: { pageSize: 6 } } }}
            disableRowSelectionOnClick
            pageSizeOptions={[6]}
            disableColumnResize
          />
        )}
      </div>
    </div>
  );
};

export default UserList;
