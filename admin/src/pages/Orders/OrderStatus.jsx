import { useEffect, useMemo, useState } from "react";

import api from "../../api/axios";

import FormField from "../../components/common/FormField";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";

const OrderStatus = ({
  open,
  onOpenChange,
  order,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    status: "",
    payment_method: "",
    payment_status: "",
  });

  const [saving, setSaving] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load order values when Sheet opens
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!order) {
      return;
    }

    setFormData({
      status: order.status || "pending",
      payment_method:
        order.payment_method || "COD",
      payment_status:
        order.payment_status || "pending",
    });
  }, [order, open]);

  /*
  |--------------------------------------------------------------------------
  | Handle form changes
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Order status options
  |
  | We only show valid next statuses.
  |--------------------------------------------------------------------------
  */

  const statusOptions = [
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "confirmed",
    label: "Confirmed",
  },
  {
    value: "processing",
    label: "Processing",
  },
  {
    value: "shipped",
    label: "Shipped",
  },
  {
    value: "delivered",
    label: "Delivered",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

  /*
  |--------------------------------------------------------------------------
  | Payment method options
  |--------------------------------------------------------------------------
  */

  const paymentMethodOptions = [
    {
      value: "COD",
      label: "COD - Cash on Delivery",
    },
    {
      value: "UPI",
      label: "UPI Payment",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Payment status options
  |--------------------------------------------------------------------------
  */

  const paymentStatusOptions = [
    {
      value: "pending",
      label: "Pending",
    },
    {
      value: "paid",
      label: "Paid",
    },
    {
      value: "failed",
      label: "Failed",
    },
    {
      value: "refunded",
      label: "Refunded",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Update order
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!order) {
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(
        `/orders/${order.id}/status`,
        {
          status: formData.status,
          payment_method:
            formData.payment_method,
          payment_status:
            formData.payment_status,
        }
      );

      onSuccess(response.data.data);

      onOpenChange(false);
    } catch (error) {
      console.error(
        "Failed to update order:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update order"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!order) {
    return null;
  }

  const isStockChanging =
    order.status === "pending" &&
    formData.status === "confirmed";

  const isStockRestoring =
    order.status === "confirmed" &&
    formData.status === "cancelled";

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col sm:max-w-lg"
      >
        <SheetHeader>
          <SheetTitle>
            Update Order
          </SheetTitle>

          <SheetDescription>
            Update order status, payment method
            and payment status for{" "}
            <span className="font-medium text-slate-900">
              {order.order_number}
            </span>
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 pb-6"
        >
          <div className="space-y-6 py-4">

            {/* Order Information */}

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">
                Customer
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {order.customer_name}
              </p>

              <p className="text-sm text-slate-500">
                {order.customer_phone}
              </p>

              <p className="mt-3 text-sm font-medium text-slate-900">
                Order Total
              </p>

              <p className="mt-1 text-lg font-semibold text-slate-900">
                ₹
                {Number(
                  order.total_amount || 0
                ).toFixed(2)}
              </p>
            </div>

            {/* Order Status */}

            <FormField
              label="Order Status"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleChange}
              options={statusOptions}
              required
              disabled={
                saving ||
                order.status === "delivered" ||
                order.status === "cancelled"
              }
              placeholder="Select order status"
            />

            {/* Payment Method */}

            <FormField
              label="Payment Method"
              name="payment_method"
              type="select"
              value={formData.payment_method}
              onChange={handleChange}
              options={paymentMethodOptions}
              required
              disabled={saving}
              placeholder="Select payment method"
            />

            {/* Payment Status */}

            <FormField
              label="Payment Status"
              name="payment_status"
              type="select"
              value={formData.payment_status}
              onChange={handleChange}
              options={paymentStatusOptions}
              required
              disabled={saving}
              placeholder="Select payment status"
            />

            {/* Stock information */}

            {isStockChanging && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-800">
                  Stock will be deducted
                </p>

                <p className="mt-1 text-sm text-emerald-700">
                  Confirming this order will
                  automatically deduct the ordered
                  quantity from product stock.
                </p>
              </div>
            )}

            {isStockRestoring && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-800">
                  Stock will be restored
                </p>

                <p className="mt-1 text-sm text-amber-700">
                  Cancelling this confirmed order
                  will automatically restore the
                  ordered quantity to product stock.
                </p>
              </div>
            )}

            {/* Payment information */}

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-800">
                Payment Information
              </p>

              <p className="mt-1 text-sm text-blue-700">
                Changing payment method or payment
                status does not change product stock.
              </p>
            </div>

            {/* Buttons AFTER LAST FIELD */}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  onOpenChange(false)
                }
                disabled={saving}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Updating..."
                  : "Update Order"}
              </button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

/*
|--------------------------------------------------------------------------
| Format status text
|--------------------------------------------------------------------------
*/

const formatStatus = (status) => {
  if (!status) {
    return "";
  }

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

export default OrderStatus;