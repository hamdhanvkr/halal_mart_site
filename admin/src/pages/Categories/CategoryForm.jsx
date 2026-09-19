import { useEffect, useState } from "react";
import {
    Image as ImageIcon,
    Loader2,
    X,
} from "lucide-react";
import { toast } from "sonner";

import api from "../../api/axios";

import FormField from "../../components/common/FormField";

const emptyForm = {
    name: "",
    slug: "",
    description: "",
    status: "active",
};

const CategoryForm = ({
    onSuccess,
    onCancel,
}) => {
    const [formData, setFormData] =
        useState(emptyForm);

    const [image, setImage] = useState(null);

    const [imagePreview, setImagePreview] =
        useState(null);

    const [saving, setSaving] = useState(false);

    // =========================
    // CLEAN PREVIEW
    // =========================

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    // =========================
    // SLUG
    // =========================

    const generateSlug = (value) => {
        return value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    // =========================
    // NAME
    // =========================

    const handleNameChange = (event) => {
        const name = event.target.value;

        setFormData((previous) => ({
            ...previous,
            name,
            slug: generateSlug(name),
        }));
    };

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
    // IMAGE
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
    // REMOVE IMAGE
    // =========================

    const handleRemoveImage = () => {
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

            if (image) {
                data.append("image", image);
            }

            await api.post("/categories", data);

            toast.success(
                "Category created successfully"
            );

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error(
                "CREATE CATEGORY ERROR:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to create category"
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
                onChange={handleNameChange}
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
                placeholder="perfumes"
                required
                disabled={true}
            />

            <p className="-mt-3 text-xs text-slate-400">
                Automatically generated from category name
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
          IMAGE
      ========================= */}

            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                    Category Image
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
                    JPG, PNG or WebP. Maximum 5MB.
                </p>

                {/* PREVIEW */}

                {imagePreview && (
                    <div className="relative mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <img
                            src={imagePreview}
                            alt="Category preview"
                            className="h-48 w-full object-cover sm:h-56"
                        />

                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            disabled={saving}
                            className="absolute right-2 top-2 rounded-full bg-white p-2 text-slate-700 shadow-md transition hover:bg-red-50 hover:text-red-600"
                            title="Remove image"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {!imagePreview && (
                    <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
                        <div className="text-center">
                            <ImageIcon className="mx-auto h-7 w-7 text-slate-400" />

                            <p className="mt-2 text-xs text-slate-400">
                                Image preview will appear here
                            </p>
                        </div>
                    </div>
                )}
            </div>

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
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {saving && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {saving
                        ? "Saving..."
                        : "Create Category"}
                </button>
            </div>
        </form>
    );
};

export default CategoryForm;