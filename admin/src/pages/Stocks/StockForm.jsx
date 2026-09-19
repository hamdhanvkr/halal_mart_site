import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import FormField from "../../components/common/FormField";

const emptyForm = {
  product_id: "",
  type: "IN",
  quantity: "",
  reason: "",
  reference: "",
  notes: "",
};

const reasonOptions = [
  {
    value: "PURCHASE",
    label: "New Purchase",
  },
  {
    value: "SALE",
    label: "Sale",
  },
  {
    value: "RETURN",
    label: "Customer Return",
  },
  {
    value: "DAMAGE",
    label: "Damaged Stock",
  },
  {
    value: "ADJUSTMENT",
    label: "Stock Adjustment",
  },
  {
    value: "OPENING",
    label: "Opening Stock",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

const StockForm = ({
  product,
  products = [],
  movement,
  saving,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] =
    useState(emptyForm);

  useEffect(() => {
    if (movement) {
      setFormData({
        product_id:
          movement.product_id ||
          movement.product?.id ||
          product?.id ||
          "",
        type: movement.type || "IN",
        quantity:
          movement.quantity !== undefined
            ? String(movement.quantity)
            : "",
        reason: movement.reason || "",
        reference:
          movement.reference || "",
        notes: movement.notes || "",
      });

      return;
    }

    setFormData({
      ...emptyForm,
      product_id: product?.id
        ? String(product.id)
        : "",
    });
  }, [movement, product]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const quantity = Number(
      formData.quantity
    );

    if (!formData.product_id) {
      alert("Please select a product");
      return;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      alert(
        "Quantity must be a whole number greater than 0"
      );
      return;
    }

    if (!formData.reason.trim()) {
      alert("Reason is required");
      return;
    }

    onSubmit({
      product_id: Number(
        formData.product_id
      ),
      type: formData.type,
      quantity,
      reason: formData.reason,
      reference:
        formData.reference.trim() || null,
      notes:
        formData.notes.trim() || null,
    });
  };

  const productOptions = products.map(
    (item) => ({
      value: item.id,
      label: item.sku
        ? `${item.name} (${item.sku})`
        : item.name,
    })
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Product */}
      <FormField
        label="Product"
        name="product_id"
        type="select"
        value={
          formData.product_id
            ? String(formData.product_id)
            : ""
        }
        onChange={handleChange}
        placeholder="Select product"
        required
        disabled={saving}
        options={productOptions}
      />

      {/* Movement Type */}
      <FormField
        label="Movement Type"
        name="type"
        type="select"
        value={formData.type}
        onChange={handleChange}
        disabled={saving}
        options={[
          {
            value: "IN",
            label: "Stock In",
          },
          {
            value: "OUT",
            label: "Stock Out",
          },
          {
            value: "ADJUSTMENT",
            label: "Adjustment",
          },
        ]}
      />

      {/* Quantity */}
      <FormField
        label="Quantity"
        name="quantity"
        type="number"
        value={formData.quantity}
        onChange={handleChange}
        placeholder="Enter quantity"
        required
        disabled={saving}
      />

      <p className="-mt-3 text-xs text-slate-400">
        Enter a positive quantity. The movement type determines whether stock is added or removed.
      </p>

      {/* Reason */}
      <FormField
        label="Reason"
        name="reason"
        type="select"
        value={formData.reason}
        onChange={handleChange}
        placeholder="Select reason"
        required
        disabled={saving}
        options={reasonOptions}
      />

      {/* Reference */}
      <FormField
        label="Reference"
        name="reference"
        value={formData.reference}
        onChange={handleChange}
        placeholder="Example: PO-1001"
        disabled={saving}
      />

      {/* Notes */}
      <FormField
        label="Notes"
        name="notes"
        type="textarea"
        value={formData.notes}
        onChange={handleChange}
        placeholder="Enter additional notes..."
        rows={4}
        disabled={saving}
      />

      {/* Buttons */}
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
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}

          {saving
            ? "Saving..."
            : movement
            ? "Update Stock"
            : "Save Stock"}
        </button>
      </div>
    </form>
  );
};

export default StockForm;