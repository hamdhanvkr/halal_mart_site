import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import api from "../../api/axios";

import FormField from "../../components/common/FormField";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

const ProductForm = ({
  initialData = null,
  categories = [],
  onSuccess,
  onCancel,
}) => {
  const isEdit = Boolean(initialData?.id);

  // =========================================================
  // FORM DATA
  // =========================================================

  const [formData, setFormData] = useState({
    category_id: initialData?.category_id
      ? String(initialData.category_id)
      : "",

    name: initialData?.name || "",

    sku: initialData?.sku || "",

    description: initialData?.description || "",

    price:
      initialData?.price !== undefined &&
      initialData?.price !== null
        ? String(initialData.price)
        : "",

    discount_price:
      initialData?.discount_price !== undefined &&
      initialData?.discount_price !== null
        ? String(initialData.discount_price)
        : "",

    stock:
      initialData?.stock !== undefined &&
      initialData?.stock !== null
        ? String(initialData.stock)
        : "",

    status: initialData?.status || "active",
  });

  // =========================================================
  // IMAGE
  // =========================================================

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState(() => {
      if (!initialData?.image) {
        return null;
      }

      if (
        initialData.image.startsWith(
          "http://"
        ) ||
        initialData.image.startsWith(
          "https://"
        )
      ) {
        return initialData.image;
      }

      return `http://localhost:5000${initialData.image}`;
    });

  // =========================================================
  // SAVING
  // =========================================================

  const [saving, setSaving] = useState(false);

  // =========================================================
  // AUTOMATIC SKU
  // =========================================================

  const [generatedSku, setGeneratedSku] =
    useState(initialData?.sku || "");

  const [skuLoading, setSkuLoading] =
    useState(false);

  // =========================================================
  // RESET FORM WHEN EDIT PRODUCT CHANGES
  // =========================================================

  useEffect(() => {
    setFormData({
      category_id: initialData?.category_id
        ? String(initialData.category_id)
        : "",

      name: initialData?.name || "",

      sku: initialData?.sku || "",

      description:
        initialData?.description || "",

      price:
        initialData?.price !== undefined &&
        initialData?.price !== null
          ? String(initialData.price)
          : "",

      discount_price:
        initialData?.discount_price !==
          undefined &&
        initialData?.discount_price !==
          null
          ? String(initialData.discount_price)
          : "",

      stock:
        initialData?.stock !== undefined &&
        initialData?.stock !== null
          ? String(initialData.stock)
          : "",

      status:
        initialData?.status || "active",
    });

    setSelectedImage(null);

    if (initialData?.image) {
      if (
        initialData.image.startsWith(
          "http://"
        ) ||
        initialData.image.startsWith(
          "https://"
        )
      ) {
        setImagePreview(initialData.image);
      } else {
        setImagePreview(
          `http://localhost:5000${initialData.image}`
        );
      }
    } else {
      setImagePreview(null);
    }

    setGeneratedSku(
      initialData?.sku || ""
    );
  }, [initialData]);

  // =========================================================
  // FIELDS
  // =========================================================

  const fields = [
    {
      name: "price",
      label: "Price",
      type: "number",
      placeholder: "Enter product price",
      required: true,
    },

    {
      name: "discount_price",
      label: "Discount Price",
      type: "number",
      placeholder: "Enter discount price",
    },

    {
      name: "stock",
      label: "Stock",
      type: "number",
      placeholder: "Enter stock quantity",
    },

    {
      name: "status",
      label: "Status",
      type: "select",
      placeholder: "Select status",

      options: [
        {
          value: "active",
          label: "Active",
        },

        {
          value: "inactive",
          label: "Inactive",
        },

        {
          value: "out_of_stock",
          label: "Out of Stock",
        },
      ],
    },

    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Enter product description",
      rows: 5,
      className: "sm:col-span-2",
    },
  ];

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // AUTOMATIC SKU
  // =========================================================

  useEffect(() => {
    // -------------------------------------------------------
    // EDIT PRODUCT
    // Existing SKU must never change
    // -------------------------------------------------------

    if (isEdit) {
      setGeneratedSku(
        initialData?.sku || ""
      );

      setSkuLoading(false);

      return;
    }

    const productName =
      formData.name?.trim();

    // -------------------------------------------------------
    // No product name
    // -------------------------------------------------------

    if (!productName) {
      setGeneratedSku("");
      setSkuLoading(false);

      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        setSkuLoading(true);

        const response = await api.get(
          "/products/preview-sku",
          {
            params: {
              name: productName,
            },
          }
        );

        if (!cancelled) {
          setGeneratedSku(
            response.data?.sku || ""
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "SKU preview error:",
            error
          );

          setGeneratedSku("");
        }
      } finally {
        if (!cancelled) {
          setSkuLoading(false);
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    formData.name,
    isEdit,
    initialData?.sku,
  ]);

  // =========================================================
  // IMAGE CHANGE
  // =========================================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // -------------------------------------------------------
    // Validate file type
    // -------------------------------------------------------

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Only JPG, JPEG, PNG and WebP images are allowed"
      );

      event.target.value = "";

      return;
    }

    // -------------------------------------------------------
    // Validate file size
    // -------------------------------------------------------

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        "Image size must be less than 5MB"
      );

      event.target.value = "";

      return;
    }

    // -------------------------------------------------------
    // Store selected image
    // -------------------------------------------------------

    setSelectedImage(file);

    // -------------------------------------------------------
    // Create preview
    // -------------------------------------------------------

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    // -------------------------------------------------------
    // Product name validation
    // -------------------------------------------------------

    if (!formData.name.trim()) {
      toast.error(
        "Product name is required"
      );

      return;
    }

    // -------------------------------------------------------
    // Category validation
    // -------------------------------------------------------

    if (!formData.category_id) {
      toast.error(
        "Please select a category"
      );

      return;
    }

    // -------------------------------------------------------
    // Price validation
    // -------------------------------------------------------

    if (
      formData.price === "" ||
      formData.price === null ||
      formData.price === undefined
    ) {
      toast.error(
        "Price is required"
      );

      return;
    }

    // -------------------------------------------------------
    // Price validation
    // -------------------------------------------------------

    if (Number(formData.price) < 0) {
      toast.error(
        "Price cannot be negative"
      );

      return;
    }

    // -------------------------------------------------------
    // Discount validation
    // -------------------------------------------------------

    if (
      formData.discount_price !== "" &&
      Number(formData.discount_price) < 0
    ) {
      toast.error(
        "Discount price cannot be negative"
      );

      return;
    }

    // -------------------------------------------------------
    // Stock validation
    // -------------------------------------------------------

    if (
      formData.stock !== "" &&
      Number(formData.stock) < 0
    ) {
      toast.error(
        "Stock cannot be negative"
      );

      return;
    }

    try {
      setSaving(true);

      // =====================================================
      // CREATE FORMDATA
      // =====================================================

      const data = new FormData();

      data.append(
        "category_id",
        formData.category_id
      );

      data.append(
        "name",
        formData.name.trim()
      );

      data.append(
        "description",
        formData.description || ""
      );

      data.append(
        "price",
        formData.price
      );

      data.append(
        "discount_price",
        formData.discount_price || ""
      );

      data.append(
        "stock",
        formData.stock || "0"
      );

      data.append(
        "status",
        formData.status || "active"
      );

      // -----------------------------------------------------
      // IMPORTANT:
      // SKU is NOT sent.
      //
      // Backend generates SKU when creating product.
      // Existing SKU is preserved when editing.
      // -----------------------------------------------------

      if (selectedImage) {
        data.append(
          "image",
          selectedImage
        );
      }

      // =====================================================
      // DEBUG FORMDATA
      // =====================================================

      console.log(
        "========== PRODUCT FORMDATA =========="
      );

      for (const [key, value] of data.entries()) {
        console.log(
          key,
          value
        );
      }

      console.log(
        "======================================="
      );

      // =====================================================
      // API REQUEST
      // =====================================================

      let response;

      if (isEdit) {
        response = await api.put(
          `/products/${initialData.id}`,
          data
        );

        console.log(
          "UPDATE PRODUCT RESPONSE:",
          response.data
        );

        toast.success(
          response.data?.message ||
            "Product updated successfully"
        );
      } else {
        response = await api.post(
          "/products",
          data
        );

        console.log(
          "CREATE PRODUCT RESPONSE:",
          response.data
        );

        toast.success(
          response.data?.message ||
            "Product created successfully"
        );
      }

      // =====================================================
      // SUCCESS
      // =====================================================

      if (onSuccess) {
        onSuccess(
          response.data?.product
        );
      }
    } catch (error) {
      console.error(
        "Product save error:",
        error
      );

      console.error(
        "Response:",
        error.response?.data
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to save product"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <form
      onSubmit={handleSubmit}
      className="h-full"
    >
      <div className="h-full overflow-y-auto px-1 py-5">
        <div className="space-y-6">

          {/* ==================================================
              PRODUCT NAME
          ================================================== */}

          <FormField
            name="name"
            label="Product Name"
            placeholder="Enter product name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={saving}
          />

          {/* ==================================================
              AUTOMATIC SKU
          ================================================== */}

          <div className="space-y-2">
            <label
              htmlFor="sku"
              className="text-sm font-medium text-slate-700"
            >
              SKU
            </label>

            <div className="relative">
              <Input
                id="sku"
                value={
                  skuLoading
                    ? "Generating..."
                    : generatedSku ||
                      "Auto generated"
                }
                readOnly
                disabled
                className="bg-slate-50 font-medium text-slate-600"
              />

              {skuLoading && (
                <Loader2
                  className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400"
                />
              )}
            </div>

            <p className="text-xs text-slate-500">
              Automatically generated from
              the product name.
            </p>
          </div>

          {/* ==================================================
              CATEGORY
          ================================================== */}

          <FormField
            name="category_id"
            label="Category"
            type="select"
            placeholder={
              categories.length > 0
                ? "Select category"
                : "No categories available"
            }
            value={formData.category_id}
            onChange={handleChange}
            required
            disabled={
              saving ||
              categories.length === 0
            }
            options={categories.map(
              (category) => ({
                value: String(
                  category.id
                ),
                label:
                  category.name,
              })
            )}
          />

          {/* ==================================================
              OTHER FIELDS
          ================================================== */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <FormField
                key={field.name}
                {...field}
                value={
                  formData[field.name]
                }
                onChange={handleChange}
                disabled={saving}
              />
            ))}
          </div>

          {/* ==================================================
              PRODUCT IMAGE
          ================================================== */}

          <div className="space-y-3">
            <FormField
              name="image"
              label="Product Image"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={
                handleImageChange
              }
              disabled={saving}
            />

            {/* ------------------------------------------------
                IMAGE PREVIEW
            ------------------------------------------------ */}

            {imagePreview && (
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-2">
                <img
                  src={imagePreview}
                  alt={
                    formData.name ||
                    "Product preview"
                  }
                  className="h-40 w-full rounded-md object-contain"
                />
              </div>
            )}

            {/* ------------------------------------------------
                IMAGE INFORMATION
            ------------------------------------------------ */}

            <p className="text-xs text-slate-500">
              JPG, JPEG, PNG or WebP. Maximum
              file size: 5MB.
            </p>
          </div>

          {/* ==================================================
              BUTTONS
              
              IMPORTANT:
              These are after the LAST FIELD.
              They are NOT fixed.
          ================================================== */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 pb-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                saving ||
                categories.length === 0
              }
              className="w-full sm:w-auto"
            >
              {saving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              {saving
                ? "Saving..."
                : isEdit
                ? "Update Product"
                : "Save Product"}
            </Button>
          </div>

        </div>
      </div>
    </form>
  );
};

export default ProductForm;