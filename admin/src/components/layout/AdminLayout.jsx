import { useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Package,
  Tags,
  Warehouse,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Store,
  Menu,
  X,
  UserCog,
} from "lucide-react";

import { toast } from "sonner";

import {
  getAdmin,
  logout,
} from "../../utils/auth";

const AdminLayout = () => {
  const navigate = useNavigate();

  const admin = getAdmin();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Permission Check
  |--------------------------------------------------------------------------
  |
  | Admin:
  |   Full access
  |
  | Staff:
  |   Access depends on permissions returned during login.
  |
  */

  const hasPermission = (permission) => {
    // Admin has full access
    if (admin?.role === "admin") {
      return true;
    }

    // Staff permissions
    if (!Array.isArray(admin?.permissions)) {
      return false;
    }

    return admin.permissions.includes(
      permission
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Menu Items
  |--------------------------------------------------------------------------
  */

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,

      // Dashboard available to everyone
      permission: null,
    },

    {
      label: "Categories",
      path: "/categories",
      icon: Tags,
      permission: "categories",
    },

    {
      label: "Products",
      path: "/products",
      icon: Package,
      permission: "products",
    },

    {
      label: "Inventory",
      path: "/inventory",
      icon: Warehouse,
      permission: "inventory",
    },

    {
      label: "Orders",
      path: "/orders",
      icon: ShoppingCart,
      permission: "orders",
    },

    {
      label: "Customers",
      path: "/customers",
      icon: Users,
      permission: "customers",
    },

    {
      label: "Reports",
      path: "/reports",
      icon: BarChart3,
      permission: "reports",
    },

    {
      label: "Staff Management",
      path: "/staff",
      icon: UserCog,

      // Staff management is ADMIN ONLY
      adminOnly: true,
    },

    {
      label: "Settings",
      path: "/settings",
      icon: Settings,

      // Keep settings available for admin
      // You can add a separate permission later
      adminOnly: true,
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Filter Menu
  |--------------------------------------------------------------------------
  */

  const visibleMenuItems =
    menuItems.filter((item) => {
      // Admin sees everything
      if (admin?.role === "admin") {
        return true;
      }

      // Staff cannot access admin-only pages
      if (item.adminOnly) {
        return false;
      }

      // Dashboard is always visible
      if (!item.permission) {
        return true;
      }

      // Check staff permission
      return hasPermission(
        item.permission
      );
    });

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const handleLogout = () => {
    logout();

    toast.success(
      "Logged out successfully"
    );

    navigate("/login", {
      replace: true,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Mobile Menu
  |--------------------------------------------------------------------------
  */

  const handleMenuClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* =========================================================
          MOBILE OVERLAY
      ========================================================= */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* =========================================================
          SIDEBAR
      ========================================================= */}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-72
          flex-col
          border-r border-slate-200
          bg-white
          transition-transform duration-300
          lg:w-64
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* -----------------------------------------------------
            Logo
        ----------------------------------------------------- */}

        <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600">
              <Store className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="font-bold text-slate-900">
                Halal Mart
              </h1>

              <p className="text-xs text-slate-500">
                Admin Panel
              </p>
            </div>
          </div>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* -----------------------------------------------------
            Navigation
        ----------------------------------------------------- */}

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleMenuClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* =====================================================
            ADMIN / STAFF PROFILE
        ===================================================== */}

        <div className="shrink-0 border-t border-slate-200 p-4">
          <div className="mb-3 rounded-lg bg-slate-50 p-3">
            <p className="truncate text-sm font-semibold text-slate-900">
              {admin?.name || "Admin"}
            </p>

            <p className="truncate text-xs text-slate-500">
              {admin?.email}
            </p>

            <span
              className={`
                mt-2 inline-block rounded-full
                px-2 py-1 text-xs font-medium capitalize
                ${
                  admin?.role === "admin"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-blue-100 text-blue-700"
                }
              `}
            >
              {admin?.role || "staff"}
            </span>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />

            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* =========================================================
          MAIN AREA
      ========================================================= */}

      <div className="min-h-screen lg:ml-64">
        {/* -----------------------------------------------------
            HEADER
        ----------------------------------------------------- */}

        <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Menu */}
            <button
              type="button"
              onClick={() =>
                setSidebarOpen(true)
              }
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                Admin Dashboard
              </h2>

              <p className="hidden text-sm text-slate-500 sm:block">
                Manage your Halal Mart store
              </p>
            </div>
          </div>

          {/* ---------------------------------------------------
              PROFILE
          --------------------------------------------------- */}

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">
                {admin?.name}
              </p>

              <p className="text-xs capitalize text-slate-500">
                {admin?.role}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
              {admin?.name
                ?.charAt(0)
                ?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {/* -----------------------------------------------------
            PAGE CONTENT
        ----------------------------------------------------- */}

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;