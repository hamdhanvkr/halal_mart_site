import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

import api from "../../api/axios";

import DataTable from "../../components/common/DataTable";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from "../../components/ui/sheet";

import CategoryForm from "./CategoryForm";
import CategoryEdit from "./CategoryEdit";
import CategoryDelete from "./CategoryDelete";

const Categories = () => {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [sheetOpen, setSheetOpen] = useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [categoryToDelete, setCategoryToDelete] =
    useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);

  // =========================
  // FETCH CATEGORIES
  // =========================

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response = await api.get("/categories");

      console.log(
        "CATEGORY RESPONSE:",
        response.data
      );

      const responseData = response.data;

      let categoryList = [];

      if (Array.isArray(responseData)) {
        categoryList = responseData;
      } else if (Array.isArray(responseData.data)) {
        categoryList = responseData.data;
      } else if (
        Array.isArray(responseData.categories)
      ) {
        categoryList = responseData.categories;
      }

      setCategories(categoryList);
    } catch (error) {
      console.error(
        "FETCH CATEGORY ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load categories"
      );

      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // =========================
  // ADD
  // =========================

  const handleAdd = () => {
    setEditingCategory(null);
    setSheetOpen(true);
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (category) => {
    setEditingCategory(category);
    setSheetOpen(true);
  };

  // =========================
  // CLOSE SHEET
  // =========================

  const handleCloseSheet = () => {
    setSheetOpen(false);
    setEditingCategory(null);
  };

  // =========================
  // FORM SUCCESS
  // =========================

  const handleFormSuccess = async () => {
    handleCloseSheet();

    await fetchCategories();
  };

  // =========================
  // DELETE
  // =========================

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteOpen(true);
  };

  const handleDeleteSuccess = async () => {
    setCategoryToDelete(null);

    await fetchCategories();
  };

  // =========================
  // IMAGE URL
  // =========================

  const getImageUrl = (image) => {
    if (!image) {
      return null;
    }

    if (image.startsWith("http")) {
      return image;
    }

    return `http://localhost:5000${image}`;
  };

  // =========================
  // TABLE COLUMNS
  // =========================

  const columns = [
    {
      key: "id",
      header: "ID",

      render: (category) => (
        <span className="font-medium text-slate-600">
          #{category.id}
        </span>
      ),
    },

    {
      key: "image",
      header: "Image",

      render: (category) => {
        const imageUrl = getImageUrl(category.image);

        return imageUrl ? (
          <div className="h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <img
              src={imageUrl}
              alt={category.name}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />
          </div>
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
            <ImageIcon className="h-5 w-5 text-slate-400" />
          </div>
        );
      },
    },

    {
      key: "name",
      header: "Category",

      render: (category) => (
        <div className="min-w-[180px]">
          <p className="font-semibold text-slate-900">
            {category.name}
          </p>

          <p className="text-xs text-slate-500">
            /{category.slug}
          </p>
        </div>
      ),
    },

    {
      key: "description",
      header: "Description",

      render: (category) => (
        <span className="block max-w-[300px] truncate text-slate-600">
          {category.description || "-"}
        </span>
      ),
    },

    {
      key: "status",
      header: "Status",

      render: (category) => (
        <StatusBadge status={category.status} />
      ),
    },

    {
      key: "actions",
      header: "Actions",

      render: (category) => (
        <div className="flex items-center gap-2">
          {/* EDIT */}

          <button
            type="button"
            onClick={() =>
              handleEdit(category)
            }
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            title="Edit category"
          >
            <Pencil className="h-4 w-4" />
          </button>

          {/* DELETE */}

          <button
            type="button"
            onClick={() =>
              handleDeleteClick(category)
            }
            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
            title="Delete category"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      {/* =========================
          HEADER
      ========================= */}

      <PageHeader
        title="Categories"
        description="Manage your Halal Mart product categories."
        action={
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />

            Add Category
          </button>
        }
      />

      {/* =========================
          TABLE
      ========================= */}

      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        emptyMessage="No categories found"
      />

      {/* =========================
          ADD / EDIT SHEET
      ========================= */}

      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseSheet();
          }
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {editingCategory
                ? "Edit Category"
                : "Add Category"}
            </SheetTitle>

            <SheetDescription>
              {editingCategory
                ? "Update the category information."
                : "Create a new product category."}
            </SheetDescription>
          </SheetHeader>

          <SheetBody>
            {editingCategory ? (
              <CategoryEdit
                category={editingCategory}
                onSuccess={handleFormSuccess}
                onCancel={handleCloseSheet}
              />
            ) : (
              <CategoryForm
                onSuccess={handleFormSuccess}
                onCancel={handleCloseSheet}
              />
            )}
          </SheetBody>
        </SheetContent>
      </Sheet>

      {/* =========================
          DELETE
      ========================= */}

      <CategoryDelete
        category={categoryToDelete}
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);

          if (!open) {
            setCategoryToDelete(null);
          }
        }}
        onSuccess={handleDeleteSuccess}
      />

    </div>
  );
};

export default Categories;