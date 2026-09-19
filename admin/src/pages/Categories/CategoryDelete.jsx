import { useState } from "react";
import { toast } from "sonner";

import api from "../../api/axios";

import ConfirmDialog from "../../components/common/ConfirmDialog";

const CategoryDelete = ({
  category,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!category?.id) {
      return;
    }

    try {
      setDeleting(true);

      await api.delete(
        `/categories/${category.id}`
      );

      toast.success(
        "Category deleted successfully"
      );

      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(
        "DELETE CATEGORY ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete category"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Category"
      description={
        category
          ? `Are you sure you want to delete "${category.name}"? This action cannot be undone.`
          : "Are you sure you want to delete this category?"
      }
      confirmText="Delete Category"
      onConfirm={handleDelete}
      loading={deleting}
    />
  );
};

export default CategoryDelete;