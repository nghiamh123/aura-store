"use client";

import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  total: number;
  status: string;
  createdAt: string;
  items: Array<{ product: { name: string } }>;
}

interface AdminOverviewProps {
  orders: Order[];
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

export default function AdminOverview({
  orders,
  getStatusColor,
  getStatusText,
}: AdminOverviewProps) {
  const topProducts = [
    {
      id: 1,
      name: "Đồng hồ nam sang trọng",
      sales: 45,
      revenue: 13455000,
      image: "/api/placeholder/60/60",
    },
    {
      id: 2,
      name: "Túi xách nữ thời trang",
      sales: 32,
      revenue: 6368000,
      image: "/api/placeholder/60/60",
    },
    {
      id: 3,
      name: "Vòng tay trang sức",
      sales: 28,
      revenue: 2492000,
      image: "/api/placeholder/60/60",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Recent Orders */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Đơn hàng gần đây
        </h3>
        <div className="space-y-4">
          {orders.slice(0, 4).map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">#{order.id}</p>
                  <p className="text-sm text-gray-600">
                    {order.userId === "guest-user"
                      ? "Khách hàng"
                      : order.userId}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {order.total.toLocaleString()}đ
                </p>
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusText(order.status)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Top Products */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Sản phẩm bán chạy
        </h3>
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">
                    {product.sales} đã bán
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {product.revenue.toLocaleString()}đ
                </p>
                <p className="text-sm text-gray-600">doanh thu</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
