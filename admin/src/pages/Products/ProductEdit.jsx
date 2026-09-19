import ProductForm from "./ProductForm";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../components/ui/sheet";

const ProductEdit = ({
  open,
  onOpenChange,
  product,
  categories,
  loadingCategories,
  saving,
  onSubmit,
}) => {
  if (!product) return null;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col p-0 sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 border-b px-6 py-5">
          <SheetTitle>
            Edit Product
          </SheetTitle>

          <SheetDescription>
            Update product information.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 px-6">
          <ProductForm
            initialData={product}
            categories={categories}
            loadingCategories={
              loadingCategories
            }
            saving={saving}
            onSubmit={onSubmit}
            onCancel={() =>
              onOpenChange(false)
            }
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProductEdit;