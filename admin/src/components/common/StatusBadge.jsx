import { cn } from "../../lib/utils";

const StatusBadge = ({ status }) => {
  const normalizedStatus = String(
    status || ""
  ).toLowerCase();

  const styles = {
    active:
      "bg-emerald-100 text-emerald-700",
    inactive:
      "bg-slate-100 text-slate-600",
    out_of_stock:
      "bg-red-100 text-red-700",
    pending:
      "bg-yellow-100 text-yellow-700",
    confirmed:
      "bg-blue-100 text-blue-700",
    processing:
      "bg-purple-100 text-purple-700",
    completed:
      "bg-emerald-100 text-emerald-700",
    cancelled:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        styles[normalizedStatus] ||
          "bg-slate-100 text-slate-600"
      )}
    >
      {normalizedStatus.replaceAll("_", " ") || "-"}
    </span>
  );
};

export default StatusBadge;