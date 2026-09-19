import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import api from "../../api/axios";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import StatusBadge from "../../components/common/StatusBadge";

const StockHistory = ({
  open,
  onOpenChange,
  product,
  movements = [],
  loading = false,
  onEdit,
  onDeleteSuccess,
}) => {
  const [deleting, setDeleting] =
    useState(false);

  const [deleteMovement, setDeleteMovement] =
    useState(null);

  const filteredMovements = useMemo(() => {
    if (!product?.id) {
      return movements;
    }

    return movements.filter(
      (movement) =>
        Number(movement.product_id) ===
        Number(product.id)
    );
  }, [movements, product]);

  const handleDelete = async () => {
    if (!deleteMovement) {
      return;
    }

    try {
      setDeleting(true);

      await api.delete(
        `/stock-movements/${deleteMovement.id}`
      );

      toast.success(
        "Stock movement deleted successfully"
      );

      setDeleteMovement(null);

      if (onDeleteSuccess) {
        await onDeleteSuccess();
      }
    } catch (error) {
      console.error(
        "DELETE STOCK MOVEMENT ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete stock movement"
      );
    } finally {
      setDeleting(false);
    }
  };

  const getMovementLabel = (type) => {
    if (type === "IN") {
      return "Stock In";
    }

    if (type === "OUT") {
      return "Stock Out";
    }

    if (type === "ADJUSTMENT") {
      return "Adjustment";
    }

    return type || "-";
  };

  const getMovementStatus = (type) => {
    if (type === "IN") {
      return "active";
    }

    if (type === "OUT") {
      return "out_of_stock";
    }

    return "pending";
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  if (!open) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 z-50">
        {/* Overlay */}
        <button
          type="button"
          aria-label="Close"
          onClick={() =>
            !deleting &&
            onOpenChange(false)
          }
          className="absolute inset-0 h-full w-full cursor-default bg-black/40"
        />

        {/* Sheet */}
        <div className="absolute right-0 top-0 flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Stock History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {product?.name
                  ? product.name
                  : "All stock movements"}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                onOpenChange(false)
              }
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Current Stock */}
          {product && (
            <div className="shrink-0 border-b border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Current Stock
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {product.stock ?? 0}
              </p>
            </div>
          )}

          {/* History */}
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {loading ? (
              <div className="flex min-h-40 items-center justify-center text-sm text-slate-500">
                Loading stock history...
              </div>
            ) : filteredMovements.length ===
              0 ? (
              <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                No stock movements found.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMovements.map(
                  (movement) => {
                    const isIn =
                      movement.type === "IN";

                    return (
                      <div
                        key={movement.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex min-w-0 gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                isIn
                                  ? "bg-emerald-50"
                                  : "bg-red-50"
                              }`}
                            >
                              {isIn ? (
                                <ArrowUpToLineIcon />
                              ) : (
                                <ArrowDownToLine
                                  className="h-5 w-5 text-red-600"
                                />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-slate-900">
                                  {getMovementLabel(
                                    movement.type
                                  )}
                                </p>

                                <StatusBadge
                                  status={getMovementStatus(
                                    movement.type
                                  )}
                                />
                              </div>

                              <p className="mt-1 text-sm text-slate-500">
                                Quantity:{" "}
                                <span className="font-semibold text-slate-900">
                                  {movement.quantity}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                onEdit?.(
                                  movement
                                )
                              }
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDeleteMovement(
                                  movement
                                )
                              }
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                          <div>
                            <p className="text-xs text-slate-400">
                              Reason
                            </p>

                            <p className="mt-1 text-sm text-slate-700">
                              {movement.reason ||
                                "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Reference
                            </p>

                            <p className="mt-1 text-sm text-slate-700">
                              {movement.reference ||
                                "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Date
                            </p>

                            <p className="mt-1 text-sm text-slate-700">
                              {formatDate(
                                movement.created_at ||
                                  movement.createdAt
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Movement ID
                            </p>

                            <p className="mt-1 text-sm text-slate-700">
                              #{movement.id}
                            </p>
                          </div>
                        </div>

                        {movement.notes && (
                          <div className="mt-3 rounded-lg bg-slate-50 p-3">
                            <p className="text-xs text-slate-400">
                              Notes
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              {movement.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteMovement)}
        onOpenChange={(value) => {
          if (!value && !deleting) {
            setDeleteMovement(null);
          }
        }}
        title="Delete Stock Movement"
        description={
          deleteMovement
            ? `Are you sure you want to delete this ${getMovementLabel(
                deleteMovement.type
              )} movement of ${deleteMovement.quantity} item(s)?`
            : "Are you sure you want to delete this stock movement?"
        }
        confirmText="Delete Movement"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
};

const ArrowUpToLineIcon = () => (
  <ArrowUpFromLine className="h-5 w-5 text-emerald-600" />
);

export default StockHistory;