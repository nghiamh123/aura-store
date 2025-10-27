"use client";

import { motion } from "framer-motion";
import {
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface AdminStatsProps {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
  };
  products: Array<{
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
  }>;
}

export default function AdminStats({ stats, products }: AdminStatsProps) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[
        {
          title: "Tổng doanh thu",
          value: stats.totalRevenue.toLocaleString(),
          change: "+12.5%",
          changeType: "increase",
          icon: DollarSign,
          color: "text-green-600",
        },
        {
          title: "Đơn hàng",
          value: stats.totalOrders.toString(),
          change: "+8.2%",
          changeType: "increase",
          icon: ShoppingBag,
          color: "text-blue-600",
        },
        {
          title: "Sản phẩm",
          value: products.length.toString(),
          change: "+3.1%",
          changeType: "increase",
          icon: Package,
          color: "text-amber-600",
        },
        {
          title: "Khách hàng",
          value: stats.totalCustomers.toString(),
          change: "+5.7%",
          changeType: "increase",
          icon: Users,
          color: "text-orange-600",
        },
      ].map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stat.value}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg ${stat.color
                .replace("text-", "bg-")
                .replace("-600", "-100")}`}
            >
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {stat.changeType === "increase" ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span
              className={`text-sm font-medium ${
                stat.changeType === "increase"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {stat.change}
            </span>
            <span className="text-sm text-gray-500 ml-1">
              so với tháng trước
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
