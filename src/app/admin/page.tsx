'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Users, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  LogOut,
  Shield
} from 'lucide-react';
import { API_BASE_URL, apiFetch } from '@/lib/api';

// Mock data for admin dashboard
const stats = [
  {
    title: 'Tổng doanh thu',
    value: '12,450,000',
    change: '+12.5%',
    changeType: 'increase',
    icon: DollarSign,
    color: 'text-green-600'
  },
  {
    title: 'Đơn hàng mới',
    value: '156',
    change: '+8.2%',
    changeType: 'increase',
    icon: ShoppingBag,
    color: 'text-blue-600'
  },
  {
    title: 'Sản phẩm',
    value: '89',
    change: '+3.1%',
    changeType: 'increase',
    icon: Package,
    color: 'text-purple-600'
  },
  {
    title: 'Khách hàng',
    value: '1,234',
    change: '-2.1%',
    changeType: 'decrease',
    icon: Users,
    color: 'text-orange-600'
  }
];

const recentOrders = [
  {
    id: 'AURA-001',
    customer: 'Nguyễn Văn A',
    amount: 299000,
    status: 'delivered',
    date: '2024-01-15',
    items: 2
  },
  {
    id: 'AURA-002',
    customer: 'Trần Thị B',
    amount: 498000,
    status: 'processing',
    date: '2024-01-14',
    items: 3
  },
  {
    id: 'AURA-003',
    customer: 'Lê Văn C',
    amount: 199000,
    status: 'shipped',
    date: '2024-01-13',
    items: 1
  },
  {
    id: 'AURA-004',
    customer: 'Phạm Thị D',
    amount: 159000,
    status: 'confirmed',
    date: '2024-01-12',
    items: 1
  }
];

const topProducts = [
  {
    id: 1,
    name: 'Đồng hồ nam sang trọng',
    sales: 45,
    revenue: 13455000,
    image: '/api/placeholder/60/60'
  },
  {
    id: 2,
    name: 'Túi xách nữ thời trang',
    sales: 32,
    revenue: 6368000,
    image: '/api/placeholder/60/60'
  },
  {
    id: 3,
    name: 'Vòng tay trang sức',
    sales: 28,
    revenue: 2492000,
    image: '/api/placeholder/60/60'
  }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [adminUser, setAdminUser] = useState('');
  const router = useRouter();

  // Products state
  const [products, setProducts] = useState<Array<{ id: number; name: string; description: string; price: number; category: string; image?: string }>>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '', price: '', category: '', image: '' });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Check if user is authenticated via cookies
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    
    const adminAuth = getCookie('adminAuth');
    const user = getCookie('adminUser');
    
    if (!adminAuth || adminAuth !== 'true') {
      router.push('/admin/login');
      return;
    }
    
    setAdminUser(user || 'Admin');
  }, [router]);

  useEffect(() => {
    if (activeTab === 'products') {
      void loadProducts();
    }
  }, [activeTab]);

  async function loadProducts() {
    try {
      setLoadingProducts(true);
      const data = await apiFetch<{ products: typeof products }>('/products');
      setProducts(data.products);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErrorMsg(e.message || 'Không tải được sản phẩm');
    } finally {
      setLoadingProducts(false);
    }
  }

  async function uploadToS3(selected: File): Promise<string> {
    // Ask backend for presigned POST
    const presign = await apiFetch<{ url: string; fields: Record<string, string>; key: string; finalUrl?: string }>(
      '/uploads/presign',
      {
        method: 'POST',
        body: JSON.stringify({ filename: selected.name })
      }
    );

    const form = new FormData();
    Object.entries(presign.fields).forEach(([k, v]) => form.append(k, v));
    // Do NOT set Content-Type header or form field; browser will set multipart boundary automatically
    form.append('file', selected);

    const res = await fetch(presign.url, { method: 'POST', body: form });
    if (!res.ok) throw new Error('Upload S3 thất bại');

    const location = presign.finalUrl || res.headers.get('Location') || '';
    if (!location) throw new Error('Không lấy được URL ảnh sau upload');
    return location;
  }

  async function createProduct() {
    try {
      setErrorMsg('');
      setUploading(true);

      let imageUrl = createForm.image.trim() || '';
      if (!imageUrl && file) {
        imageUrl = await uploadToS3(file);
      }

      const body = {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        price: Number(createForm.price),
        category: createForm.category.trim(),
        image: imageUrl || undefined,
      };
      await apiFetch('/products', { method: 'POST', body: JSON.stringify(body) });
      setShowCreate(false);
      setCreateForm({ name: '', description: '', price: '', category: '', image: '' });
      setFile(null);
      await loadProducts();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErrorMsg(e.message || 'Tạo sản phẩm thất bại');
    } finally {
      setUploading(false);
    }
  }

  async function deleteProduct(id: number) {
    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
      await loadProducts();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
      setErrorMsg(e.message || 'Xóa sản phẩm thất bại');
    }
  }

  const handleLogout = () => {
    // Clear admin session cookies
    document.cookie = 'adminAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'adminUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/admin/login');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-yellow-100 text-yellow-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      confirmed: 'Đã xác nhận',
      processing: 'Đang xử lý',
      shipped: 'Đang giao hàng',
      delivered: 'Đã giao hàng',
      cancelled: 'Đã hủy'
    };
    return texts[status as keyof typeof texts] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-playfair font-bold text-gray-900">
                  Bảng điều khiển
                </h1>
                <p className="text-gray-600 mt-1">
                  Quản lý cửa hàng Aura
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>Xin chào, {adminUser}</span>
                </div>
                <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm sản phẩm
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Đăng xuất
                </button>
              </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
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
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {stat.changeType === 'increase' ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">so với tháng trước</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Tổng quan' },
                { id: 'orders', label: 'Đơn hàng' },
                { id: 'products', label: 'Sản phẩm' },
                { id: 'customers', label: 'Khách hàng' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Đơn hàng gần đây</h3>
                  <div className="space-y-4">
                    {recentOrders.slice(0, 4).map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">#{order.id}</p>
                            <p className="text-sm text-gray-600">{order.customer}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{order.amount.toLocaleString()}đ</p>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Top Products */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sản phẩm bán chạy</h3>
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
                            <p className="text-sm text-gray-600">{product.sales} đã bán</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{product.revenue.toLocaleString()}đ</p>
                          <p className="text-sm text-gray-600">doanh thu</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Quản lý đơn hàng</h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm đơn hàng..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Filter className="h-4 w-4 mr-2" />
                      Bộ lọc
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Đơn hàng
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Khách hàng
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số tiền
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentOrders.map((order, index) => (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                            <div className="text-sm text-gray-500">{order.items} sản phẩm</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.customer}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.amount.toLocaleString()}đ
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.date).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="text-purple-600 hover:text-purple-900">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-blue-600 hover:text-blue-900">
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Quản lý sản phẩm</h3>
                  <button onClick={() => setShowCreate(true)} className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm sản phẩm
                  </button>
                </div>

                {errorMsg && (
                  <div className="mb-4 text-sm text-red-600">{errorMsg}</div>
                )}

                {loadingProducts ? (
                  <div className="text-gray-600">Đang tải sản phẩm...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ảnh</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.price.toLocaleString()}đ</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {p.image ? (
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                <img src={p.image as any} alt={p.name} className="h-10 w-10 rounded object-cover border" />
                              ) : (
                                <div className="h-10 w-10 rounded bg-gray-100 border" />
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button onClick={() => deleteProduct(p.id)} className="text-red-600 hover:text-red-800 inline-flex items-center">
                                <Trash2 className="h-4 w-4 mr-1" /> Xóa
                              </button>
                            </td>
                          </tr>
                        ))}
                        {products.length === 0 && (
                          <tr><td className="px-6 py-4 text-sm text-gray-500" colSpan={5}>Chưa có sản phẩm</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {showCreate && (
                  <div className="mt-6 bg-white border rounded-xl p-4">
                    <h4 className="font-semibold mb-4">Thêm sản phẩm</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Tên</label>
                        <input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Giá (đ)</label>
                        <input type="number" value={createForm.price} onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-700 mb-1">Mô tả</label>
                        <textarea rows={3} value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Danh mục</label>
                        <input value={createForm.category} onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Ảnh (URL)</label>
                        <input value={createForm.image} onChange={(e) => setCreateForm({ ...createForm, image: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="https://..." />
                        <div className="mt-2 text-xs text-gray-500">Hoặc tải ảnh từ máy bên dưới</div>
                        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-2" />
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3 items-center">
                      <button disabled={uploading} onClick={createProduct} className={`px-4 py-2 rounded-lg text-white ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}>{uploading ? 'Đang tải...' : 'Lưu'}</button>
                      <button disabled={uploading} onClick={() => setShowCreate(false)} className="px-4 py-2 border border-gray-300 rounded-lg">Hủy</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'customers' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Quản lý khách hàng</h3>
                </div>
                <p className="text-gray-600">Chức năng quản lý khách hàng sẽ được phát triển...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
