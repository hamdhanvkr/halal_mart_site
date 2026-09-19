import ConfirmDialog from "../../components/common/ConfirmDialog";

const ProductDelete = ({
  open,
  onOpenChange,
  product,
  deleting,
  onConfirm,
}) => {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Product"
      description={
        product
          ? `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
          : "Are you sure you want to delete this product?"
      }
      confirmText="Delete Product"
      onConfirm={onConfirm}
      loading={deleting}
    />
  );
};

export default ProductDelete;