import { useEffect, useState } from "react";
import {
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import api from "../../api/axios";

import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";

import { Button } from "../../components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../components/ui/sheet";

import ProductForm from "./ProductForm";
import ProductDelete from "./ProductDelete";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [deleting, setDeleting] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await api.get("/products");

      console.log(
        "PRODUCT API RESPONSE:",
        response.data
      );

      setProducts(
        response.data?.products || []
      );
    } catch (error) {
      console.error(
        "Fetch products error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load products"
      );

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);

      const response =
        await api.get("/categories");

      console.log(
        "CATEGORY API RESPONSE:",
        response.data
      );

      /*
       * Support both possible backend responses:
       *
       * {
       *   success: true,
       *   categories: [...]
       * }
       *
       * OR
       *
       * {
       *   success: true,
       *   data: [...]
       * }
       */

      const categoryList =
        response.data?.categories ||
        response.data?.data ||
        [];

      setCategories(
        Array.isArray(categoryList)
          ? categoryList
          : []
      );
    } catch (error) {
      console.error(
        "Fetch categories error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load categories"
      );

      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // =========================================================
  // PRODUCT SAVE SUCCESS
  // =========================================================

  const handleProductSuccess = async (
    product
  ) => {
    console.log(
      "PRODUCT SAVED:",
      product
    );

    await fetchProducts();

    setAddOpen(false);
    setEditOpen(false);
    setSelectedProduct(null);
  };

  // =========================================================
  // EDIT PRODUCT
  // =========================================================

  const handleEditClick = async (
    product
  ) => {
    try {
      const response = await api.get(
        `/products/${product.id}`
      );

      console.log(
        "PRODUCT DETAILS RESPONSE:",
        response.data
      );

      const productData =
        response.data?.product;

      if (!productData) {
        toast.error(
          "Product details not found"
        );
        return;
      }

      setSelectedProduct(productData);
      setEditOpen(true);
    } catch (error) {
      console.error(
        "Get product error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load product"
      );
    }
  };

  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  const handleDeleteClick = (
    product
  ) => {
    setSelectedProduct(product);
    setDeleteOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) {
      return;
    }

    try {
      setDeleting(true);

      await api.delete(
        `/products/${selectedProduct.id}`
      );

      toast.success(
        "Product deleted successfully"
      );

      setDeleteOpen(false);
      setSelectedProduct(null);

      await fetchProducts();
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete product"
      );
    } finally {
      setDeleting(false);
    }
  };

  // =========================================================
  // IMAGE URL
  // =========================================================

  const getImageUrl = (image) => {
    if (!image) {
      return null;
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `http://localhost:5000${image}`;
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = [
    {
      key: "image",
      header: "Image",

      render: (product) => {
        const imageUrl = getImageUrl(
          product.image
        );

        return imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
            No image
          </div>
        );
      },
    },

    {
      key: "name",
      header: "Product",

      render: (product) => (
        <div className="min-w-[160px]">
          <p className="font-medium text-slate-900">
            {product.name}
          </p>

          {product.sku && (
            <p className="mt-1 text-xs text-slate-500">
              SKU: {product.sku}
            </p>
          )}
        </div>
      ),
    },

    {
      key: "category",
      header: "Category",

      render: (product) => (
        <span>
          {product.category?.name || "-"}
        </span>
      ),
    },

    {
      key: "price",
      header: "Price",

      render: (product) => (
        <div>
          <p className="font-medium text-slate-900">
            ₹
            {Number(
              product.price || 0
            ).toFixed(2)}
          </p>

          {product.discount_price && (
            <p className="text-xs text-green-600">
              ₹
              {Number(
                product.discount_price
              ).toFixed(2)}
            </p>
          )}
        </div>
      ),
    },

    {
      key: "stock",
      header: "Stock",

      render: (product) => (
        <span>
          {product.stock ?? 0}
        </span>
      ),
    },

    {
      key: "status",
      header: "Status",

      render: (product) => (
        <StatusBadge
          status={product.status}
        />
      ),
    },

    {
      key: "actions",
      header: "Actions",

      render: (product) => (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() =>
              handleEditClick(product)
            }
            title="Edit product"
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() =>
              handleDeleteClick(product)
            }
            title="Delete product"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="w-full">
      <PageHeader
        title="Products"
        description="Manage your Halal Mart products."
        action={
          <Button
            onClick={() => {
              setSelectedProduct(null);
              setAddOpen(true);
            }}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        }
      />

      {/* =====================================================
          PRODUCTS TABLE
      ===================================================== */}

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        emptyMessage="No products found."
      />

      {/* =====================================================
          ADD PRODUCT
      ===================================================== */}

      <Sheet
        open={addOpen}
        onOpenChange={setAddOpen}
      >
        <SheetContent
          side="right"
          className="flex h-full w-full flex-col p-0 sm:max-w-xl"
        >
          <SheetHeader className="shrink-0 border-b px-6 py-5">
            <SheetTitle>
              Add Product
            </SheetTitle>

            <SheetDescription>
              Add a new product to Halal Mart.
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-hidden px-6">
            <ProductForm
              key="add-product"
              categories={categories}
              initialData={null}
              onSuccess={
                handleProductSuccess
              }
              onCancel={() =>
                setAddOpen(false)
              }
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* =====================================================
          EDIT PRODUCT
      ===================================================== */}

      <Sheet
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);

          if (!open) {
            setSelectedProduct(null);
          }
        }}
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

          <div className="min-h-0 flex-1 overflow-hidden px-6">
            {selectedProduct && (
              <ProductForm
                key={`edit-product-${selectedProduct.id}`}
                initialData={
                  selectedProduct
                }
                categories={categories}
                onSuccess={
                  handleProductSuccess
                }
                onCancel={() =>
                  setEditOpen(false)
                }
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* =====================================================
          DELETE PRODUCT
      ===================================================== */}

      <ProductDelete
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);

          if (!open) {
            setSelectedProduct(null);
          }
        }}
        product={selectedProduct}
        deleting={deleting}
        onConfirm={
          handleDeleteProduct
        }
      />
    </div>
  );
};

export default Products;