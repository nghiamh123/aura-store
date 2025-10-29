"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Package,
  Truck,
  Clock,
  Phone,
  Mail,
  Copy,
} from "lucide-react";
import Link from "next/link";

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    image?: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        setError("Không thể tải thông tin đơn hàng");
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error || "Không tìm thấy đơn hàng"}
          </p>
          <Link
            href="/products"
            className="text-amber-600 hover:text-amber-700"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Đã xác nhận";
      case "PROCESSING":
        return "Đang xử lý";
      case "SHIPPED":
        return "Đã giao hàng";
      case "DELIVERED":
        return "Đã nhận hàng";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "text-blue-600 bg-blue-100";
      case "PROCESSING":
        return "text-yellow-600 bg-yellow-100";
      case "SHIPPED":
        return "text-amber-600 bg-amber-100";
      case "DELIVERED":
        return "text-green-600 bg-green-100";
      case "CANCELLED":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-playfair font-bold text-gray-900">
            Xác nhận đơn hàng
          </h1>
          <p className="text-gray-600 mt-2">
            Cảm ơn bạn đã đặt hàng! Chúng tôi sẽ xử lý đơn hàng của bạn sớm
            nhất.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Đặt hàng thành công!
            </h2>
            <p className="text-gray-600 mb-4">
              Đơn hàng của bạn đã được xác nhận và đang được xử lý.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 inline-flex items-center gap-3">
              <div>
                <p className="text-sm text-gray-600">Mã đơn hàng</p>
                <p className="text-lg font-semibold text-gray-900 font-mono">
                  {order.orderNumber || order.id}
                </p>
              </div>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      order.orderNumber || order.id
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  } catch {}
                }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-100 text-gray-700"
                title="Sao chép mã đơn hàng"
              >
                <Copy className="h-4 w-4" />
                <span>{copied ? "Đã sao chép" : "Sao chép"}</span>
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Chi tiết đơn hàng
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái</span>
                <span
                  className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Ngày đặt</span>
                <span className="text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tiền</span>
                <span className="text-lg font-semibold text-gray-900">
                  {order.total.toLocaleString()}đ
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Sản phẩm</h4>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h5>
                      <p className="text-sm text-gray-500">
                        Số lượng: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {(item.price * item.quantity).toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Bước tiếp theo
            </h3>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Xác nhận đơn hàng
                  </h4>
                  <p className="text-sm text-gray-600">
                    Chúng tôi sẽ gọi điện xác nhận trong 30 phút
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Chuẩn bị hàng</h4>
                  <p className="text-sm text-gray-600">
                    Đơn hàng sẽ được chuẩn bị trong 1-2 ngày
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Giao hàng</h4>
                  <p className="text-sm text-gray-600">
                    Thời gian giao hàng: 2-5 ngày làm việc
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Liên hệ hỗ trợ</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">1900 1234</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    support@aura.com
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/products"
            className="px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors text-center"
          >
            Tiếp tục mua sắm
          </Link>
          <Link
            href="/track"
            className="px-6 py-3 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors text-center"
          >
            Theo dõi đơn hàng
          </Link>
          <Link
            href="/orders"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
          >
            Xem đơn hàng của tôi
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
