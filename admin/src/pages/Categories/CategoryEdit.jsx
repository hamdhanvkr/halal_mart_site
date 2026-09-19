import { useEffect, useState } from "react";
import {
  Image as ImageIcon,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import api from "../../api/axios";

import FormField from "../../components/common/FormField";

const CategoryEdit = ({
  category,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    status: "active",
  });

  const [image, setImage] = useState(null);

  const [imagePreview, setImagePreview] =
    useState(null);

  const [existingImage, setExistingImage] =
    useState(null);

  const [saving, setSaving] = useState(false);

  // =========================
  // IMAGE URL
  // =========================

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return null;
    }

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    return `http://localhost:5000${imagePath}`;
  };

  // =========================
  // LOAD CATEGORY
  // =========================

  useEffect(() => {
    if (!category) {
      return;
    }

    setFormData({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      status: category.status || "active",
    });

    setExistingImage(
      getImageUrl(category.image)
    );

    setImage(null);
    setImagePreview(null);
  }, [category]);

  // =========================
  // INPUT
  // =========================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // IMAGE CHANGE
  // =========================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Only JPG, PNG and WebP images are allowed"
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        "Image size must be less than 5MB"
      );

      event.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // =========================
  // REMOVE NEW IMAGE
  // =========================

  const handleRemoveNewImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(null);
    setImagePreview(null);
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!category?.id) {
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!formData.slug.trim()) {
      toast.error("Category slug is required");
      return;
    }

    try {
      setSaving(true);

      const data = new FormData();

      data.append("name", formData.name);
      data.append("slug", formData.slug);
      data.append(
        "description",
        formData.description
      );
      data.append("status", formData.status);

      // Only send image when a new image was selected.
      if (image) {
        data.append("image", image);
      }

      await api.put(
        `/categories/${category.id}`,
        data
      );

      toast.success(
        "Category updated successfully"
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(
        "UPDATE CATEGORY ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update category"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      

     

      {/* =========================
          NAME
      ========================= */}

      <FormField
        label="Category Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Example: Perfumes"
        required
        disabled={saving}
      />

      {/* =========================
          SLUG
      ========================= */}

      <FormField
        label="Slug"
        name="slug"
        value={formData.slug}
        onChange={handleChange}
        placeholder="perfumes"
        required
        disabled={saving}
      />

      <p className="-mt-3 text-xs text-slate-400">
        URL-friendly category name
      </p>

      {/* =========================
          DESCRIPTION
      ========================= */}

      <FormField
        label="Description"
        name="description"
        type="textarea"
        value={formData.description}
        onChange={handleChange}
        placeholder="Enter category description..."
        rows={5}
        disabled={saving}
      />

      {/* =========================
          STATUS
      ========================= */}

      <FormField
        label="Status"
        name="status"
        type="select"
        value={formData.status}
        onChange={handleChange}
        disabled={saving}
        options={[
          {
            value: "active",
            label: "Active",
          },
          {
            value: "inactive",
            label: "Inactive",
          },
        ]}
      />

       {/* =========================
          REPLACE IMAGE
      ========================= */}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Replace Image
        </label>

        <input
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          disabled={saving}
          className="block w-full cursor-pointer rounded-lg border border-slate-300 bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:bg-slate-100 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
        />

        <p className="text-xs text-slate-400">
          Select a new image only if you want to
          replace the current image.
        </p>

        {/* NEW IMAGE PREVIEW */}

        {imagePreview && (
          <div className="relative mt-3 overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50">
            <img
              src={imagePreview}
              alt="New category preview"
              className="h-48 w-full object-cover sm:h-56"
            />

            <button
              type="button"
              onClick={handleRemoveNewImage}
              disabled={saving}
              className="absolute right-2 top-2 rounded-full bg-white p-2 text-slate-700 shadow-md transition hover:bg-red-50 hover:text-red-600"
              title="Remove new image"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-2">
              <p className="text-xs font-medium text-white">
                New image selected
              </p>
            </div>
          </div>
        )}
      </div>

      {/* =========================
          CURRENT IMAGE
      ========================= */}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Current Category Image
        </label>

        {existingImage ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <img
              src={existingImage}
              alt={category?.name}
              className="h-48 w-full object-cover sm:h-56"
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
            <div className="text-center">
              <ImageIcon className="mx-auto h-7 w-7 text-slate-400" />

              <p className="mt-2 text-xs text-slate-400">
                No category image
              </p>
            </div>
          </div>
        )}
      </div>

      {/* =========================
          BUTTONS
          AFTER LAST FIELD
      ========================= */}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2 w-full sm:w-auto"
        >
          {saving && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}

          {saving
            ? "Saving..."
            : "Update Category"}
        </button>
      </div>
    </form>
  );
};

export default CategoryEdit;