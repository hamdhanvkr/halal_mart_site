import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import api from "../../api/axios";

import ConfirmDialog from "../../components/common/ConfirmDialog";

const OrderCancel = ({
  open,
  onOpenChange,
  order,
  onSuccess,
}) => {
  const [saving, setSaving] = useState(false);

  const handleCancel = async () => {
    if (!order) {
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(
        `/orders/${order.id}/status`,
        {
          status: "cancelled",
        }
      );

      onSuccess(response.data.data);

      onOpenChange(false);
    } catch (error) {
      console.error(
        "Failed to cancel order:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to cancel order"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!order) {
    return null;
  }

  const isConfirmed =
    order.status === "confirmed";

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Cancel Order"
      description={
        isConfirmed
          ? `Are you sure you want to cancel ${order.order_number}? The stock used by this order will be restored automatically.`
          : `Are you sure you want to cancel ${order.order_number}?`
      }
      confirmText={
        saving ? "Cancelling..." : "Cancel Order"
      }
      cancelText="Keep Order"
      destructive
      onConfirm={handleCancel}
      disabled={saving}
    />
  );
};

export default OrderCancel;