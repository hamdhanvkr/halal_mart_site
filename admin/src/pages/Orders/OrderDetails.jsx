import {
  Package,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from "../../components/ui/sheet";

import StatusBadge from "../../components/common/StatusBadge";

const OrderDetails = ({
  open,
  onOpenChange,
  order,
}) => {
  if (!order) {
    return null;
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl"
      >
        <SheetHeader>
          <SheetTitle>
            {order.order_number}
          </SheetTitle>

          <SheetDescription>
            Order details and products
          </SheetDescription>
        </SheetHeader>

        <SheetBody>
          <div className="space-y-6">
            {/* Customer */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="mb-4 font-semibold text-slate-900">
                Customer
              </h3>

              <div className="space-y-3 text-sm">
                <p className="font-medium text-slate-900">
                  {order.customer_name}
                </p>

                <div className="flex gap-2 text-slate-600">
                  <Phone className="h-4 w-4" />
                  {order.customer_phone}
                </div>

                {order.customer_email && (
                  <div className="flex gap-2 text-slate-600">
                    <Mail className="h-4 w-4" />
                    {order.customer_email}
                  </div>
                )}

                <div className="flex gap-2 text-slate-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

                  <span>
                    {order.delivery_address}
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">
                  Order Status
                </p>

                <div className="mt-2">
                  <StatusBadge
                    status={order.status}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">
                  Payment
                </p>

                <div className="mt-2">
                  <StatusBadge
                    status={
                      order.payment_status
                    }
                  />
                </div>
              </div>
            </div>

            {/* Products */}
            <div>
              <h3 className="mb-3 font-semibold text-slate-900">
                Products
              </h3>

              <div className="space-y-3">
                {order.items?.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 rounded-xl border border-slate-200 p-3"
                    >
                      {item.product
                        ?.image ? (
                        <img
                          src={
                            item.product
                              .image
                          }
                          alt={
                            item.product
                              .name ||
                            item.product_name
                          }
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <Package className="h-6 w-6 text-slate-400" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900">
                          {
                            item.product_name
                          }
                        </p>

                        {item.sku && (
                          <p className="text-xs text-slate-500">
                            SKU: {item.sku}
                          </p>
                        )}

                        <div className="mt-2 flex justify-between text-sm">
                          <span className="text-slate-500">
                            {item.quantity} × ₹
                            {Number(
                              item.unit_price
                            ).toFixed(2)}
                          </span>

                          <span className="font-semibold text-slate-900">
                            ₹
                            {Number(
                              item.total_price
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Total */}
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span>
                    ₹
                    {Number(
                      order.subtotal
                    ).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Delivery
                  </span>

                  <span>
                    ₹
                    {Number(
                      order.delivery_charge
                    ).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Discount
                  </span>

                  <span>
                    - ₹
                    {Number(
                      order.discount
                    ).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold">
                  <span>Total</span>

                  <span>
                    ₹
                    {Number(
                      order.total_amount
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div>
                <h3 className="mb-2 font-semibold text-slate-900">
                  Notes
                </h3>

                <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                  {order.notes}
                </p>
              </div>
            )}
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
};

export default OrderDetails;