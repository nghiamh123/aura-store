'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, Package, Truck, CheckCircle, Clock, Eye, Download } from 'lucide-react';

// Mock order data
const orders = [
  {
    id: 'AURA-001',
    date: '2024-01-15',
    status: 'delivered',
    statusText: 'Đã giao hàng',
    total: 498000,
    items: [
      {
        id: 1,
        name: 'Đồng hồ nam sang trọng',
        price: 299000,
        quantity: 1,
        image: '/api/placeholder/80/80'
      },
      {
        id: 2,
        name: 'Túi xách nữ thời trang',
        price: 199000,
        quantity: 1,
        image: '/api/placeholder/80/80'
      }
    ],
    tracking: {
      current: 'delivered',
      steps: [
        { status: 'confirmed', text: 'Xác nhận đơn hàng', date: '2024-01-15 10:30', completed: true },
        { status: 'processing', text: 'Đang chuẩn bị hàng', date: '2024-01-15 14:20', completed: true },
        { status: 'shipped', text: 'Đã giao cho vận chuyển', date: '2024-01-16 09:15', completed: true },
        { status: 'delivered', text: 'Đã giao hàng', date: '2024-01-17 16:45', completed: true }
      ]
    }
  },
  {
    id: 'AURA-002',
    date: '2024-01-20',
    status: 'shipped',
    statusText: 'Đang giao hàng',
    total: 299000,
    items: [
      {
        id: 3,
        name: 'Vòng tay trang sức',
        price: 89000,
        quantity: 2,
        image: '/api/placeholder/80/80'
      },
      {
        id: 4,
        name: 'Kính mát thời trang',
        price: 121000,
        quantity: 1,
        image: '/api/placeholder/80/80'
      }
    ],
    tracking: {
      current: 'shipped',
      steps: [
        { status: 'confirmed', text: 'Xác nhận đơn hàng', date: '2024-01-20 11:00', completed: true },
        { status: 'processing', text: 'Đang chuẩn bị hàng', date: '2024-01-20 15:30', completed: true },
        { status: 'shipped', text: 'Đã giao cho vận chuyển', date: '2024-01-21 08:45', completed: true },
        { status: 'delivered', text: 'Đang giao hàng', date: '', completed: false }
      ]
    }
  },
  {
    id: 'AURA-003',
    date: '2024-01-22',
    status: 'processing',
    statusText: 'Đang xử lý',
    total: 159000,
    items: [
      {
        id: 5,
        name: 'Nhẫn bạc cao cấp',
        price: 159000,
        quantity: 1,
        image: '/api/placeholder/80/80'
      }
    ],
    tracking: {
      current: 'processing',
      steps: [
        { status: 'confirmed', text: 'Xác nhận đơn hàng', date: '2024-01-22 13:20', completed: true },
        { status: 'processing', text: 'Đang chuẩn bị hàng', date: '', completed: false },
        { status: 'shipped', text: 'Đã giao cho vận chuyển', date: '', completed: false },
        { status: 'delivered', text: 'Đã giao hàng', date: '', completed: false }
      ]
    }
  }
];

const statusColors = {
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusIcons = {
  confirmed: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: Clock
};

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const Icon = statusIcons[status as keyof typeof statusIcons] || Clock;
    return Icon;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-4">
            Đơn hàng của tôi
          </h1>
          <p className="text-gray-600">
            Theo dõi và quản lý các đơn hàng của bạn
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm theo mã đơn hàng..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipped">Đang giao hàng</option>
                <option value="delivered">Đã giao hàng</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.map((order, index) => {
            const StatusIcon = getStatusIcon(order.status);
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <StatusIcon className="h-5 w-5 text-gray-600" />
                        <span className="font-semibold text-gray-900">#{order.id}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.statusText}
                      </span>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                      <span className="text-lg font-bold text-gray-900">
                        {order.total.toLocaleString()}đ
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(order.date).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-200 rounded"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                          <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {(item.price * item.quantity).toLocaleString()}đ
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tracking Progress */}
                <div className="px-6 pb-6">
                  <h4 className="font-medium text-gray-900 mb-4">Trạng thái đơn hàng</h4>
                  <div className="space-y-3">
                    {order.tracking.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.completed 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {step.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            step.completed ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {step.text}
                          </p>
                          {step.date && (
                            <p className="text-xs text-gray-500">{step.date}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row gap-3">
                  <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                    <Eye className="h-4 w-4 mr-2" />
                    Xem chi tiết
                  </button>
                  <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                    <Download className="h-4 w-4 mr-2" />
                    Tải hóa đơn
                  </button>
                  {order.status === 'delivered' && (
                    <button className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Đánh giá sản phẩm
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không có đơn hàng nào
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Không tìm thấy đơn hàng phù hợp với bộ lọc'
                : 'Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!'
              }
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
            >
              Bắt đầu mua sắm
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
