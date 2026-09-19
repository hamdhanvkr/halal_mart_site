import { useState } from "react";
import { toast } from "sonner";

import api from "../../api/axios";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const StaffDelete = ({
  open,
  staff,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] =
    useState(false);

  if (!open || !staff) {
    return null;
  }

  const handleDelete = async () => {
    try {
      setLoading(true);

      await api.delete(
        `/admin/staff/${staff.id}`
      );

      toast.success(
        "Staff deleted successfully"
      );

      onSuccess();
    } catch (error) {
      console.error(
        "Delete staff error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete staff"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      title="Delete Staff"
      description={`Are you sure you want to delete ${staff.name}? This action cannot be undone.`}
      confirmText={
        loading ? "Deleting..." : "Delete"
      }
      cancelText="Cancel"
      onConfirm={handleDelete}
      onCancel={onClose}
    />
  );
};

export default StaffDelete;