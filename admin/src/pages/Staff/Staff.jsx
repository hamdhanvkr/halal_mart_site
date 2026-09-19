import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import api from "../../api/axios";

import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";

import StaffForm from "./StaffForm";
import StaffEdit from "./StaffEdit";
import StaffDelete from "./StaffDelete";

const PERMISSION_LABELS = {
    products: "Products",
    categories: "Categories",
    inventory: "Inventory",
    orders: "Orders",
    customers: "Customers",
    reports: "Reports",
};

const Staff = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formOpen, setFormOpen] = useState(false);
    const [editStaff, setEditStaff] = useState(null);
    const [deleteStaff, setDeleteStaff] = useState(null);

    // ==========================================
    // FETCH STAFF
    // ==========================================

    const fetchStaff = async () => {
        try {
            setLoading(true);

            const response = await api.get("/admin/staff");

            if (response.data.success) {
                setStaff(response.data.data || []);
            }
        } catch (error) {
            console.error("Fetch staff error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to load staff"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    // ==========================================
    // CREATE SUCCESS
    // ==========================================

    const handleCreateSuccess = () => {
        setFormOpen(false);
        fetchStaff();
    };

    // ==========================================
    // EDIT SUCCESS
    // ==========================================

    const handleEditSuccess = () => {
        setEditStaff(null);
        fetchStaff();
    };


    // ==========================================
    // TABLE COLUMNS
    // ==========================================

    const columns = [
        {
            key: "staff",
            header: "Staff",
            render: (item) => (
                <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">
                        {item.name}
                    </p>

                    <p className="truncate text-sm text-gray-500">
                        {item.email}
                    </p>
                </div>
            ),
        },

        {
            key: "role",
            header: "Role",
            render: (item) => (
                <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-700">
                    {item.role}
                </span>
            ),
        },

        {
            key: "permissions",
            header: "Permissions",
            render: (item) => {
                const permissions = Array.isArray(
                    item.permissions
                )
                    ? item.permissions
                    : [];

                if (!permissions.length) {
                    return (
                        <span className="text-sm text-gray-400">
                            No permissions
                        </span>
                    );
                }

                return (
                    <div className="flex max-w-[400px] flex-wrap gap-1.5">
                        {permissions.map((permission) => (
                            <span
                                key={permission}
                                className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                            >
                                {PERMISSION_LABELS[permission] ||
                                    permission}
                            </span>
                        ))}
                    </div>
                );
            },
        },

        {
            key: "status",
            header: "Status",
            render: (item) => (
                <StatusBadge status={item.status} />
            ),
        },

        {
            key: "actions",
            header: "Actions",
            className: "text-right",
            render: (item) => (
                <div className="flex justify-end gap-1">
                    <button
                        type="button"
                        onClick={() =>
                            setEditStaff(item)
                        }
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                        title="Edit staff"
                    >
                        <Pencil size={17} />
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setDeleteStaff(item)
                        }
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                        title="Delete staff"
                    >
                        <Trash2 size={17} />
                    </button>
                </div>
            ),
        },
    ];

    // ==========================================
    // SUMMARY
    // ==========================================

    const totalStaff = staff.length;

    const activeStaff = staff.filter(
        (item) => item.status === "active"
    ).length;

    const inactiveStaff = staff.filter(
        (item) => item.status === "inactive"
    ).length;

    return (
        <div className="space-y-6">
            {/* PAGE HEADER */}

            <PageHeader
                title="Staff Management"
                description="Manage staff accounts and permissions"
                action={
                    <button
                        type="button"
                        onClick={() => setFormOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
                    >
                        <Plus size={18} />
                        <span>Add Staff</span>
                    </button>
                }
            />

            {/* SUMMARY */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SummaryCard
                    icon={<Users size={20} />}
                    label="Total Staff"
                    value={totalStaff}
                    iconClass="bg-blue-50 text-blue-600"
                />

                <SummaryCard
                    label="Active Staff"
                    value={activeStaff}
                    iconClass="bg-green-50 text-green-600"
                />

                <SummaryCard
                    label="Inactive Staff"
                    value={inactiveStaff}
                    iconClass="bg-gray-100 text-gray-600"
                />
            </div>

            {/* TABLE */}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <DataTable
                    columns={columns}
                    data={staff}
                    loading={loading}
                    emptyMessage="No staff accounts found"
                />
            </div>

            {/* CREATE */}

            {formOpen && (
                <StaffForm
                    open={formOpen}
                    onClose={() =>
                        setFormOpen(false)
                    }
                    onSuccess={handleCreateSuccess}
                />
            )}

            {/* EDIT */}

            {editStaff && (
                <StaffEdit
                    open={Boolean(editStaff)}
                    staff={editStaff}
                    onClose={() =>
                        setEditStaff(null)
                    }
                    onSuccess={handleEditSuccess}
                />
            )}

            {/* DELETE */}

            <StaffDelete
                open={Boolean(deleteStaff)}
                staff={deleteStaff}
                onClose={() => setDeleteStaff(null)}
                onSuccess={() => {
                    setDeleteStaff(null);
                    fetchStaff();
                }}
            />
        </div>
    );
};

// ==========================================
// REUSABLE SUMMARY CARD
// ==========================================

const SummaryCard = ({
    icon,
    label,
    value,
    iconClass,
}) => {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
                {icon && (
                    <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
                    >
                        {icon}
                    </div>
                )}

                <div className="min-w-0">
                    <p className="text-sm text-gray-500">
                        {label}
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Staff;