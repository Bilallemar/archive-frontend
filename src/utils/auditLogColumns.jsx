import { Link } from "react-router-dom";
import { auditLogsTruncateTexts } from "./truncateText.js";

export const auditLogcolumns = [
  {
    field: "action",
    headerName: "Action",
    width: 160,
    headerAlign: "center",
    align: "center",
    headerClassName: "text-black font-semibold border",
    cellClassName: "text-slate-700 font-normal border",
  },
  {
    field: "username",
    headerName: "UserName",
    width: 150,
    headerAlign: "center",
    align: "center",
    headerClassName: "text-black font-semibold border",
    cellClassName: "text-slate-700 font-normal border",
  },
  {
    field: "tableName",
    headerName: "Table/Model",
    width: 180,
    headerAlign: "center",
    align: "center",
    headerClassName: "text-black font-semibold border",
    cellClassName: "text-slate-700 font-normal border",
  },
  {
    field: "timestamp",
    headerName: "TimeStamp",
    width: 220,
    headerAlign: "center",
    align: "center",
    headerClassName: "text-black font-semibold border",
    cellClassName: "text-slate-700 font-normal border",
  },
  {
    field: "recordId",
    headerName: "Record ID",
    width: 160,
    headerAlign: "center",
    align: "center",
    headerClassName: "text-black font-semibold border",
    cellClassName: "text-slate-700 font-normal border",
  },
  {
    field: "recordContent",
    headerName: "Aarchive Content",
    width: 260,
    headerAlign: "center",
    align: "center",
    headerClassName: "text-black font-semibold border",
    cellClassName: "text-slate-700 font-normal border",
    renderCell: (params) => (
      <p className="text-slate-700 text-center">
        {auditLogsTruncateTexts(params?.value || "—")}
      </p>
    ),
  },
  {
    field: "view",
    headerName: "Action",
    width: 150,
    headerAlign: "center",
    align: "center",
    sortable: false,
    renderCell: (params) => (
      <Link
        to={`/admin/audit-logs/${params.row.recordId}`}
        className="h-full flex justify-center items-center"
      >
        <button className="bg-btnColor text-white px-4 h-9 rounded-md">
          View
        </button>
      </Link>
    ),
  },
];
