"use client";

import { useState } from "react";
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    image?: string;
    price: number;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  total: number;
  trackingNumber?: string;
  customerInfo?: {
    fullName: string;
    email?: string;
    phone: string;
  };
  shippingInfo?: {
    address: string;
    ward: string;
    district: string;
    city: string;
    note?: string;
  };
  paymentMethod?: string;
  shippingFee: number;
  discount: number;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  CONFIRMED: {
    label: "Đã xác nhận",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
    description: "Đơn hàng đã được xác nhận và đang được chuẩn bị",
  },
  PROCESSING: {
    label: "Đang xử lý",
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    description: "Đơn hàng đang được xử lý và chuẩn bị giao",
  },
  SHIPPED: {
    label: "Đã giao hàng",
    icon: Truck,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    description: "Đơn hàng đã được giao cho đơn vị vận chuyển",
  },
  DELIVERED: {
    label: "Đã giao",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
    description: "Đơn hàng đã được giao thành công",
  },
  CANCELLED: {
    label: "Đã hủy",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
    description: "Đơn hàng đã bị hủy",
  },
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/track/${orderNumber}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Không tìm thấy đơn hàng");
      }

      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Theo dõi đơn hàng
          </h1>
          <p className="text-gray-600">
            Nhập mã đơn hàng để xem trạng thái và thông tin chi tiết
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleTrack} className="flex gap-4">
            <div className="flex-1">
              <label
                htmlFor="orderNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mã đơn hàng
              </label>
              <input
                type="text"
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Nhập mã đơn hàng của bạn"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-700"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                {loading ? "Đang tìm..." : "Theo dõi"}
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Trạng thái đơn hàng
                </h2>
                <span className="text-sm text-gray-500">
                  Mã đơn hàng: {order.orderNumber}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {(() => {
                  const config = statusConfig[order.status];
                  const Icon = config.icon;
                  return (
                    <div
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg ${config.bgColor}`}
                    >
                      <Icon className={`w-6 h-6 ${config.color}`} />
                      <div>
                        <p className={`font-semibold ${config.color}`}>
                          {config.label}
                        </p>
                        <p className="text-sm text-gray-600">
                          {config.description}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {order.trackingNumber && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Mã vận đơn:</p>
                  <p className="font-mono text-lg font-semibold text-gray-900">
                    {order.trackingNumber}
                  </p>
                </div>
              )}

              {order.notes && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Ghi chú:</strong> {order.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Order Information */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin khách hàng
                </h3>
                {order.customerInfo && (
                  <div className="space-y-2">
                    <p>
                      <strong>Tên:</strong> {order.customerInfo.fullName}
                    </p>
                    {order.customerInfo.email && (
                      <p>
                        <strong>Email:</strong> {order.customerInfo.email}
                      </p>
                    )}
                    <p>
                      <strong>Số điện thoại:</strong> {order.customerInfo.phone}
                    </p>
                  </div>
                )}
              </div>

              {/* Shipping Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin giao hàng
                </h3>
                {order.shippingInfo && (
                  <div className="space-y-2">
                    <p>
                      <strong>Địa chỉ:</strong> {order.shippingInfo.address}
                    </p>
                    <p>
                      <strong>Phường/Xã:</strong> {order.shippingInfo.ward}
                    </p>
                    <p>
                      <strong>Quận/Huyện:</strong> {order.shippingInfo.district}
                    </p>
                    <p>
                      <strong>Thành phố:</strong> {order.shippingInfo.city}
                    </p>
                    {order.shippingInfo.note && (
                      <p>
                        <strong>Ghi chú:</strong> {order.shippingInfo.note}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sản phẩm đã đặt
              </h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    {item.product.image && (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Số lượng: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="text-gray-700">
                      {formatPrice(
                        order.total - order.shippingFee + order.discount
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="text-gray-700">
                      {formatPrice(order.shippingFee)}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="text-gray-700">Giảm giá:</span>
                      <span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                    <span className="text-gray-700">Tổng cộng:</span>
                    <span className="text-gray-700">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Lịch sử đơn hàng
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Đơn hàng được tạo
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                {order.updatedAt !== order.createdAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Cập nhật lần cuối
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
