import { useEffect, useMemo, useState } from "react";
import {
    History,
    Package,
    RefreshCw,
    Settings2,
} from "lucide-react";
import { toast } from "sonner";

import api from "../../api/axios";

import DataTable from "../../components/common/DataTable";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";

import StockAdjustment from "./StockAdjustment";
import StockHistory from "./StockHistory";

const Stock = () => {
    const [products, setProducts] = useState([]);
    const [movements, setMovements] = useState([]);

    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] =
        useState(false);

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const [selectedProduct, setSelectedProduct] =
        useState(null);

    const [selectedMovement, setSelectedMovement] =
        useState(null);

    const [adjustmentOpen, setAdjustmentOpen] =
        useState(false);

    const [historyOpen, setHistoryOpen] =
        useState(false);

    const getProducts = async () => {
        try {
            setLoading(true);

            const response = await api.get("/products");

            const responseData = response.data;

            const productData =
                responseData?.data ||
                responseData?.products ||
                responseData ||
                [];

            setProducts(
                Array.isArray(productData)
                    ? productData
                    : []
            );
        } catch (error) {
            console.error(
                "GET PRODUCTS ERROR:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to load products"
            );
        } finally {
            setLoading(false);
        }
    };

    const getMovements = async () => {
        try {
            setHistoryLoading(true);

            const response = await api.get(
                "/stock-movements"
            );

            const responseData = response.data;

            const movementData =
                responseData?.data ||
                responseData?.movements ||
                responseData ||
                [];

            setMovements(
                Array.isArray(movementData)
                    ? movementData
                    : []
            );
        } catch (error) {
            console.error(
                "GET STOCK MOVEMENTS ERROR:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to load stock history"
            );
        } finally {
            setHistoryLoading(false);
        }
    };

    const loadData = async () => {
        await Promise.all([
            getProducts(),
            getMovements(),
        ]);
    };

    useEffect(() => {
        loadData();
    }, []);

    const getStockStatus = (stock) => {
        const value = Number(stock || 0);

        if (value <= 0) {
            return "out_of_stock";
        }

        if (value <= 10) {
            return "pending";
        }

        return "active";
    };

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const searchValue =
                search.toLowerCase().trim();

            const matchesSearch =
                !searchValue ||
                product.name
                    ?.toLowerCase()
                    .includes(searchValue) ||
                product.sku
                    ?.toLowerCase()
                    .includes(searchValue);

            const stock = Number(product.stock || 0);

            let matchesFilter = true;

            if (filter === "in_stock") {
                matchesFilter = stock > 10;
            }

            if (filter === "low_stock") {
                matchesFilter =
                    stock > 0 && stock <= 10;
            }

            if (filter === "out_of_stock") {
                matchesFilter = stock <= 0;
            }

            return (
                matchesSearch && matchesFilter
            );
        });
    }, [products, search, filter]);

    const totalProducts = products.length;

    const inStockCount = products.filter(
        (product) =>
            Number(product.stock || 0) > 10
    ).length;

    const lowStockCount = products.filter(
        (product) => {
            const stock = Number(product.stock || 0);

            return stock > 0 && stock <= 10;
        }
    ).length;

    const outOfStockCount = products.filter(
        (product) =>
            Number(product.stock || 0) <= 0
    ).length;

    const openAdjustment = (product) => {
        setSelectedProduct(product);
        setSelectedMovement(null);
        setAdjustmentOpen(true);
    };

    const openHistory = (product = null) => {
        setSelectedProduct(product);
        setHistoryOpen(true);
    };

    const handleEditMovement = (movement) => {
        setSelectedMovement(movement);

        setSelectedProduct(
            movement.product ||
            products.find(
                (product) =>
                    Number(product.id) ===
                    Number(movement.product_id)
            ) ||
            null
        );

        setAdjustmentOpen(true);
        setHistoryOpen(false);
    };

    const handleMovementSuccess = async () => {
        setAdjustmentOpen(false);
        setSelectedMovement(null);

        await loadData();
    };

    const handleDeleteSuccess = async () => {
        await loadData();
    };

    const getImageUrl = (image) => {
        if (!image) {
            return null;
        }

        if (image.startsWith("http")) {
            return image;
        }

        return `http://localhost:5000${image}`;
    };

    const columns = [
        {
            key: "id",
            header: "ID",
        },

        {
            key: "product",
            header: "Product",

            render: (product) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                        {product.image ? (
                            <img
                                src={getImageUrl(product.image)}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <Package className="h-5 w-5 text-slate-400" />
                        )}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">
                            {product.name}
                        </p>

                        {product.sku && (
                            <p className="text-xs text-slate-400">
                                SKU: {product.sku}
                            </p>
                        )}
                    </div>
                </div>
            ),
        },

        {
            key: "stock",
            header: "Current Stock",

            render: (product) => {
                const stock = Number(
                    product.stock || 0
                );

                return (
                    <span
                        className={`font-semibold ${stock <= 0
                                ? "text-red-600"
                                : stock <= 10
                                    ? "text-amber-600"
                                    : "text-emerald-600"
                            }`}
                    >
                        {stock}
                    </span>
                );
            },
        },

        {
            key: "status",
            header: "Status",

            render: (product) => (
                <StatusBadge
                    status={getStockStatus(
                        product.stock
                    )}
                />
            ),
        },

        {
            key: "actions",
            header: "Actions",

            render: (product) => (
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() =>
                            openAdjustment(product)
                        }
                        className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                        title="Manage Stock"
                    >
                        <Settings2 className="h-4 w-4" />
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            openHistory(product)
                        }
                        className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                        title="Stock History"
                    >
                        <History className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="w-full">
            <PageHeader
                title="Stock Management"
                description="Manage product inventory and stock movements."
                action={
                    <button
                        type="button"
                        onClick={loadData}
                        disabled={loading}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${loading
                                    ? "animate-spin"
                                    : ""
                                }`}
                        />

                        Refresh
                    </button>
                }
            />

            {/* Summary */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Total Products
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                        {totalProducts}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        In Stock
                    </p>

                    <p className="mt-2 text-2xl font-bold text-emerald-600">
                        {inStockCount}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Low Stock
                    </p>

                    <p className="mt-2 text-2xl font-bold text-amber-600">
                        {lowStockCount}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Out of Stock
                    </p>

                    <p className="mt-2 text-2xl font-bold text-red-600">
                        {outOfStockCount}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row">
                <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                    placeholder="Search product or SKU..."
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 md:max-w-md"
                />

                <select
                    value={filter}
                    onChange={(event) =>
                        setFilter(event.target.value)
                    }
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400 md:w-48"
                >
                    <option value="all">
                        All Stock
                    </option>

                    <option value="in_stock">
                        In Stock
                    </option>

                    <option value="low_stock">
                        Low Stock
                    </option>

                    <option value="out_of_stock">
                        Out of Stock
                    </option>
                </select>
            </div>

            <DataTable
                columns={columns}
                data={filteredProducts}
                loading={loading}
                emptyMessage="No products found"
            />

            <StockAdjustment
                open={adjustmentOpen}
                onOpenChange={setAdjustmentOpen}
                product={selectedProduct}
                products={products}
                movement={selectedMovement}
                onSuccess={handleMovementSuccess}
            />
            <StockHistory
                open={historyOpen}
                onOpenChange={setHistoryOpen}
                product={selectedProduct}
                movements={movements}
                loading={historyLoading}
                onEdit={handleEditMovement}
                onDeleteSuccess={handleDeleteSuccess}
            />
        </div>
    );
};

export default Stock;