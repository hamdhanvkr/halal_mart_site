import { useEffect, useState } from "react";
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    X,
} from "lucide-react";
import { toast } from "sonner";

import api from "../../api/axios";

import StockForm from "./StockForm";

const StockAdjustment = ({
    open,
    onOpenChange,
    product,
    products = [],
    movement,
    onSuccess,
}) => {
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) {
            setSaving(false);
        }
    }, [open]);

    if (!open) {
        return null;
    }

    const isEdit = Boolean(movement);

    const handleSubmit = async (formData) => {
        try {
            setSaving(true);

            if (isEdit) {
                await api.put(
                    `/stock-movements/${movement.id}`,
                    formData
                );

                toast.success(
                    "Stock movement updated successfully"
                );
            } else {
                await api.post(
                    "/stock-movements",
                    formData
                );

                toast.success(
                    "Stock movement created successfully"
                );
            }

            if (onSuccess) {
                await onSuccess();
            }
        } catch (error) {
            console.error(
                "STOCK MOVEMENT SAVE ERROR:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to save stock movement"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <button
                type="button"
                aria-label="Close"
                onClick={() =>
                    !saving && onOpenChange(false)
                }
                className="absolute inset-0 h-full w-full cursor-default bg-black/40"
            />

            {/* Right Sheet */}
            <div className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            {isEdit
                                ? "Edit Stock Movement"
                                : "Manage Stock"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {product?.name ||
                                movement?.product?.name ||
                                "Product"}
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled={saving}
                        onClick={() =>
                            onOpenChange(false)
                        }
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Current stock */}
                <div className="shrink-0 border-b border-slate-200 bg-slate-50 px-5 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Current Stock
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                {product?.stock ??
                                    movement?.product?.stock ??
                                    0}
                            </p>
                        </div>

                        <div className="rounded-xl bg-white p-3 shadow-sm">
                            {movement?.type === "OUT" ? (
                                <ArrowDownToLine className="h-6 w-6 text-red-500" />
                            ) : (
                                <ArrowUpFromLine className="h-6 w-6 text-emerald-500" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                    <StockForm
                        product={product}
                        products={products}
                        movement={movement}
                        saving={saving}
                        onSubmit={handleSubmit}
                        onCancel={() =>
                            onOpenChange(false)
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default StockAdjustment;