import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";

import api from "../../api/axios";

import DataTable from "../../components/common/DataTable";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";

import OrderDetails from "./OrderDetails";
import OrderStatus from "./OrderStatus";
import OrderCancel from "./OrderCancel";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // ORDER DETAILS
  // =====================================================
  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [detailsOpen, setDetailsOpen] =
    useState(false);

  // =====================================================
  // ORDER STATUS
  // =====================================================
  const [statusOpen, setStatusOpen] =
    useState(false);

  const [statusOrder, setStatusOrder] =
    useState(null);

  // =====================================================
  // ORDER CANCEL
  // =====================================================
  const [cancelOpen, setCancelOpen] =
    useState(false);

  const [cancelOrder, setCancelOrder] =
    useState(null);

  // =====================================================
  // FETCH ORDERS
  // =====================================================
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response =
        await api.get("/orders");

      setOrders(
        response.data.data || []
      );
    } catch (error) {
      console.error(
        "Failed to fetch orders:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD ORDERS
  // =====================================================
  useEffect(() => {
    fetchOrders();
  }, []);

  // =====================================================
  // OPEN ORDER DETAILS
  // =====================================================
  const openDetails = (order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  // =====================================================
  // OPEN STATUS
  // =====================================================
  const openStatus = (order) => {
    setStatusOrder(order);
    setStatusOpen(true);
  };

  // =====================================================
  // OPEN CANCEL
  // =====================================================
  const openCancel = (order) => {
    setCancelOrder(order);
    setCancelOpen(true);
  };

  // =====================================================
  // STATUS SUCCESS
  // =====================================================
  const handleStatusSuccess = (
    updatedOrder
  ) => {
    setOrders((previous) =>
      previous.map((order) =>
        order.id === updatedOrder.id
          ? updatedOrder
          : order
      )
    );

    setSelectedOrder(updatedOrder);
    setStatusOrder(null);
  };

  // =====================================================
  // CANCEL SUCCESS
  // =====================================================
  const handleCancelSuccess = (
    updatedOrder
  ) => {
    setOrders((previous) =>
      previous.map((order) =>
        order.id === updatedOrder.id
          ? updatedOrder
          : order
      )
    );

    setSelectedOrder(updatedOrder);
    setCancelOrder(null);
  };

  // =====================================================
  // ORDER SUMMARY
  // =====================================================
  const summary = useMemo(() => {
    return {
      total: orders.length,

      pending: orders.filter(
        (order) =>
          order.status === "pending"
      ).length,

      confirmed: orders.filter(
        (order) =>
          order.status === "confirmed"
      ).length,

      processing: orders.filter(
        (order) =>
          order.status === "processing"
      ).length,

      shipped: orders.filter(
        (order) =>
          order.status === "shipped"
      ).length,

      delivered: orders.filter(
        (order) =>
          order.status === "delivered"
      ).length,

      cancelled: orders.filter(
        (order) =>
          order.status === "cancelled"
      ).length,
    };
  }, [orders]);

  // =====================================================
  // TABLE COLUMNS
  // =====================================================
  const columns = [
    // ---------------------------------------------------
    // ORDER
    // ---------------------------------------------------
    {
      key: "order_number",
      header: "Order",

      render: (order) => (
        <div>
          <p className="font-medium text-slate-900">
            {order.order_number}
          </p>

          <p className="text-xs text-slate-500">
            {order.items?.length || 0} item(s)
          </p>
        </div>
      ),
    },

    // ---------------------------------------------------
    // CUSTOMER
    // ---------------------------------------------------
    {
      key: "customer_name",
      header: "Customer",

      render: (order) => (
        <div>
          <p className="font-medium text-slate-900">
            {order.customer_name}
          </p>

          <p className="text-xs text-slate-500">
            {order.customer_phone}
          </p>
        </div>
      ),
    },

    // ---------------------------------------------------
    // TOTAL
    // ---------------------------------------------------
    {
      key: "total_amount",
      header: "Total",

      render: (order) => (
        <span className="font-semibold text-slate-900">
          ₹
          {Number(
            order.total_amount || 0
          ).toFixed(2)}
        </span>
      ),
    },

    // ---------------------------------------------------
    // PAYMENT
    // ---------------------------------------------------
    {
      key: "payment_status",
      header: "Payment",

      render: (order) => (
        <StatusBadge
          status={order.payment_status}
        />
      ),
    },

    // ---------------------------------------------------
    // ORDER STATUS
    // ---------------------------------------------------
    {
      key: "status",
      header: "Order Status",

      render: (order) => (
        <StatusBadge
          status={order.status}
        />
      ),
    },

    // ---------------------------------------------------
    // DATE
    // ---------------------------------------------------
    {
      key: "created_at",
      header: "Date",

      render: (order) =>
        order.created_at
          ? new Date(
              order.created_at
            ).toLocaleDateString()
          : "-",
    },

    // ---------------------------------------------------
    // ACTIONS
    // ---------------------------------------------------
    {
      key: "actions",
      header: "Actions",

      render: (order) => (
        <div className="flex flex-wrap items-center gap-2">
          {/* VIEW */}
          <button
            type="button"
            onClick={() =>
              openDetails(order)
            }
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            title="View order"
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* UPDATE STATUS */}
          {order.status !== "delivered" &&
            order.status !== "cancelled" && (
              <button
                type="button"
                onClick={() =>
                  openStatus(order)
                }
                className="rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
              >
                Update
              </button>
            )}

          {/* CANCEL */}
          {(order.status === "pending" ||
            order.status === "confirmed") && (
            <button
              type="button"
              onClick={() =>
                openCancel(order)
              }
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100"
            >
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="space-y-6">
      {/* =================================================
          PAGE HEADER
      ================================================= */}
      <PageHeader
        title="Orders"
        description="Manage customer orders and stock fulfillment"
        action={
          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>
        }
      />

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <SummaryCard
          icon={<ShoppingBag />}
          label="Total Orders"
          value={summary.total}
        />

        <SummaryCard
          label="Pending"
          value={summary.pending}
        />

        <SummaryCard
          label="Confirmed"
          value={summary.confirmed}
        />

        <SummaryCard
          label="Processing"
          value={summary.processing}
        />

        <SummaryCard
          label="Shipped"
          value={summary.shipped}
        />

        <SummaryCard
          label="Delivered"
          value={summary.delivered}
        />
      </div>

      {/* =================================================
          CANCELLED SUMMARY
      ================================================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SummaryCard
          label="Cancelled"
          value={summary.cancelled}
        />
      </div>

      {/* =================================================
          ORDERS TABLE
      ================================================= */}
      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        emptyMessage="No orders found"
      />

      {/* =================================================
          ORDER DETAILS
      ================================================= */}
      <OrderDetails
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        order={selectedOrder}
      />

      {/* =================================================
          ORDER STATUS
      ================================================= */}
      <OrderStatus
        open={statusOpen}
        onOpenChange={setStatusOpen}
        order={statusOrder}
        onSuccess={handleStatusSuccess}
      />

      {/* =================================================
          ORDER CANCEL
      ================================================= */}
      <OrderCancel
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        order={cancelOrder}
        onSuccess={handleCancelSuccess}
      />
    </div>
  );
};

// =====================================================
// SUMMARY CARD
// =====================================================
const SummaryCard = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        {icon && (
          <div className="rounded-lg bg-slate-100 p-3 text-slate-700">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;