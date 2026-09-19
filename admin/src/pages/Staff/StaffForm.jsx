import { useState } from "react";
import { X, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import api from "../../api/axios";
import FormField from "../../components/common/FormField";

const PERMISSION_OPTIONS = [
  {
    value: "products",
    label: "Products",
    description: "Manage products",
  },
  {
    value: "categories",
    label: "Categories",
    description: "Manage categories",
  },
  {
    value: "inventory",
    label: "Inventory",
    description: "Manage stock",
  },
  {
    value: "orders",
    label: "Orders",
    description: "Manage customer orders",
  },
  {
    value: "customers",
    label: "Customers",
    description: "Manage customers",
  },
  {
    value: "reports",
    label: "Reports",
    description: "View reports",
  },
];

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  permissions: [],
  status: "active",
};

const StaffForm = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [form, setForm] =
    useState(INITIAL_FORM);

  const [loading, setLoading] =
    useState(false);

  if (!open) return null;

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // PERMISSION CHANGE
  // ==========================================

  const handlePermissionChange = (
    permission
  ) => {
    setForm((previous) => {
      const exists =
        previous.permissions.includes(
          permission
        );

      return {
        ...previous,
        permissions: exists
          ? previous.permissions.filter(
              (item) =>
                item !== permission
            )
          : [
              ...previous.permissions,
              permission,
            ],
      };
    });
  };

  // ==========================================
  // SELECT ALL PERMISSIONS
  // ==========================================

  const handleSelectAll = () => {
    const allPermissions =
      PERMISSION_OPTIONS.map(
        (item) => item.value
      );

    setForm((previous) => ({
      ...previous,
      permissions:
        previous.permissions.length ===
        allPermissions.length
          ? []
          : allPermissions,
    }));
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!form.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!form.password) {
      toast.error("Password is required");
      return;
    }

    if (form.password.length < 6) {
      toast.error(
        "Password must be at least 6 characters"
      );
      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      toast.error(
        "Passwords do not match"
      );
      return;
    }

    try {
      setLoading(true);

      await api.post("/admin/staff", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        permissions: form.permissions,
        status: form.status,
      });

      toast.success(
        "Staff created successfully"
      );

      setForm(INITIAL_FORM);

      onSuccess();
    } catch (error) {
      console.error(
        "Create staff error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to create staff"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40">
      {/* SHEET */}

      <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-xl">
        {/* HEADER */}

        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Add Staff
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Create a staff account and assign permissions.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE FORM */}

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto"
        >
          <div className="space-y-5 p-5 sm:p-6">
            {/* NAME */}

            <FormField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter staff name"
              required
            />

            {/* EMAIL */}

            <FormField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
            />

            {/* PASSWORD */}

            <FormField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />

            {/* CONFIRM PASSWORD */}

            <FormField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              required
            />

            {/* PERMISSIONS */}

            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label className="text-sm font-medium text-gray-900">
                    Permissions
                  </label>

                  <p className="mt-1 text-xs text-gray-500">
                    Select the modules this staff member can manage.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  {form.permissions.length ===
                  PERMISSION_OPTIONS.length
                    ? "Clear all"
                    : "Select all"}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {PERMISSION_OPTIONS.map(
                  (permission) => {
                    const checked =
                      form.permissions.includes(
                        permission.value
                      );

                    return (
                      <label
                        key={
                          permission.value
                        }
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                          checked
                            ? "border-blue-300 bg-blue-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            handlePermissionChange(
                              permission.value
                            )
                          }
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />

                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-gray-900">
                            {permission.label}
                          </span>

                          <span className="mt-0.5 block text-xs text-gray-500">
                            {
                              permission.description
                            }
                          </span>
                        </span>
                      </label>
                    );
                  }
                )}
              </div>
            </div>

            {/* STATUS */}

            <FormField
              label="Status"
              name="status"
              type="select"
              value={form.status}
              onChange={handleChange}
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
              required
            />

            {/* PERMISSION INFO */}

            <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <div>
                <p className="text-sm font-medium text-blue-900">
                  Permission-based access
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-700">
                  Staff members can only access the modules assigned above.
                  Administrators automatically have full access.
                </p>
              </div>
            </div>

            {/* ACTIONS
                IMPORTANT:
                These are AFTER the last field,
                INSIDE the scrollable form.
            */}

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {loading
                  ? "Creating..."
                  : "Create Staff"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffForm;