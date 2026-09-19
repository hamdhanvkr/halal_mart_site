import {
  Package,
  Tags,
  AlertTriangle,
  XCircle,
} from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Total Products",
      value: 0,
      icon: Package,
      description: "All products",
    },
    {
      title: "Categories",
      value: 0,
      icon: Tags,
      description: "Product categories",
    },
    {
      title: "Low Stock",
      value: 0,
      icon: AlertTriangle,
      description: "Needs attention",
    },
    {
      title: "Out of Stock",
      value: 0,
      icon: XCircle,
      description: "Currently unavailable",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening with your store.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <h2 className="mt-3 text-3xl font-bold text-slate-900">
                    {stat.value}
                  </h2>

                  <p className="mt-2 text-xs text-slate-500">
                    {stat.description}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                  <Icon className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Activity
          </h2>

          <p className="text-sm text-slate-500">
            Your latest store activity will appear here.
          </p>
        </div>

        <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-slate-300">
          <p className="text-sm text-slate-400">
            No recent activity
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;