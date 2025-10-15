'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Plus, Minus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';

const paymentMethods = [
  { id: 'cod', name: 'Thanh toán khi nhận hàng', icon: '💰' },
  { id: 'bank', name: 'Chuyển khoản ngân hàng', icon: '🏦' },
  { id: 'momo', name: 'Ví MoMo', icon: '💜' },
  { id: 'zalopay', name: 'Ví ZaloPay', icon: '💙' }
];

export default function CheckoutPage() {
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  const router = useRouter();
  
  // Auth state
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [formData, setFormData] = useState({
    // Customer info
    fullName: '',
    email: '',
    phone: '',
    
    // Shipping info
    address: '',
    ward: '',
    district: '',
    city: '',
    note: '',
    
    // Payment
    paymentMethod: 'cod',
    
    // Agreement
    agreeTerms: false,
    agreeMarketing: false
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/products');
    }
  }, [items.length, router]);

  // Auth guard: require login to access checkout
  useEffect(() => {
    const guard = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/customer/me`, { credentials: 'include' });
        if (res.status === 401) {
          router.push('/auth/login?redirect=/checkout');
        }
      } catch {
        // if API error, keep page; optional: route to login
      }
    };
    void guard();
  }, [router]);

  // Detect logged-in customer
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/customer/me`, {
          credentials: 'include'
        });
        if (!res.ok) return; // guest
        const data = await res.json();
        setUser(data.user);
      } catch {
        // ignore
      }
    };
    fetchMe();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleQuantityChange = (id: number, type: 'increase' | 'decrease') => {
    const item = items.find(item => item.id === id);
    if (!item) return;
    
    if (type === 'increase') {
      updateQuantity(id, item.quantity + 1);
    } else if (type === 'decrease' && item.quantity > 1) {
      updateQuantity(id, item.quantity - 1);
    }
  };

  const handleAuthInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuthForm(prev => ({ ...prev, [name]: value }));
  };

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/customer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: authForm.email, password: authForm.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đăng nhập thất bại');
      setUser(data.user);
      setShowAuth(false);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setAuthLoading(false);
    }
  };

  const submitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: authForm.name, email: authForm.email, password: authForm.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đăng ký thất bại');
      setUser(data.user);
      setShowAuth(false);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Đăng ký thất bại');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRemoveItem = (id: number) => {
    removeFromCart(id);
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    return items.reduce((total, item) => total + ((item.originalPrice - item.price) * item.quantity), 0);
  };

  const shippingFee = calculateSubtotal() >= 200000 ? 0 : 30000;
  const orderTotal = calculateSubtotal() + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');
    
    try {
      const orderData = {
        customerInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        },
        shippingInfo: {
          address: formData.address,
          ward: formData.ward,
          district: formData.district,
          city: formData.city,
          note: formData.note,
        },
        paymentMethod: formData.paymentMethod,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        total: orderTotal,
        shippingFee: shippingFee,
        discount: calculateDiscount(),
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Không thể tạo đơn hàng');
      }

      const result = await response.json();
      
      // Clear cart after successful order
      clearCart();
      
      // If user just logged in or registered during checkout, attempt to link guest orders
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/link-guest-to-account`, {
          method: 'POST',
          credentials: 'include'
        });
      } catch {}

      // Redirect to order confirmation
      router.push(`/orders/${result.order.id}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo đơn hàng');
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading or redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Giỏ hàng trống</p>
          <Link href="/products" className="text-purple-600 hover:text-purple-700">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-playfair font-bold text-gray-900">
            Thanh toán
          </h1>
          <p className="text-gray-600 mt-2">
            Hoàn tất đơn hàng của bạn một cách an toàn và nhanh chóng
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Auth prompt */}
        <div className="mb-6">
          {user ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              <p>
                Đang đăng nhập với tài khoản <span className="font-medium">{user.name}</span> ({user.email}). Đơn hàng sẽ được lưu vào tài khoản của bạn.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
              <p>Đăng nhập để lưu lịch sử đơn hàng và theo dõi dễ dàng hơn.</p>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setShowAuth(true); }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setShowAuth(true); }}
                  className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100"
                >
                  Đăng ký
                </button>
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Error Display */}
          {error && (
            <div className="lg:col-span-2 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Customer Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin khách hàng</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
                    placeholder="Nhập họ và tên"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
                  placeholder="Nhập email (tùy chọn)"
                />
              </div>
            </motion.div>

            {/* Shipping Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin giao hàng</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
                    placeholder="Số nhà, tên đường"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phường/Xã *
                    </label>
                    <select
                      name="ward"
                      value={formData.ward}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
                    >
                      <option value="">Chọn phường/xã</option>
                      <option value="phuong-1">Phường 1</option>
                      <option value="phuong-2">Phường 2</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quận/Huyện *
                    </label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
                    >
                      <option value="">Chọn quận/huyện</option>
                      <option value="quan-1">Quận 1</option>
                      <option value="quan-2">Quận 2</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tỉnh/Thành phố *
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
                    >
                      <option value="">Chọn tỉnh/thành phố</option>
                      <option value="hcm">TP. Hồ Chí Minh</option>
                      <option value="hn">Hà Nội</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
                    placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                  />
                </div>
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Phương thức thanh toán</h2>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.paymentMethod === method.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={formData.paymentMethod === method.id}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <span className="text-2xl mr-3">{method.icon}</span>
                    <span className="font-medium text-gray-900">{method.name}</span>
                  </label>
                ))}
              </div>
            </motion.div>

            {/* Terms and Conditions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="space-y-4">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                    required
                    className="mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600">
                    Tôi đồng ý với <Link href="/terms" className="text-purple-600 hover:underline">Điều khoản sử dụng</Link> và <Link href="/privacy" className="text-purple-600 hover:underline">Chính sách bảo mật</Link> *
                  </span>
                </label>
                
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="agreeMarketing"
                    checked={formData.agreeMarketing}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600">
                    Tôi muốn nhận thông tin về sản phẩm và khuyến mãi qua email
                  </span>
                </label>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Đơn hàng của bạn</h3>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                      <p className="text-sm text-gray-500">
                        {item.size} • {item.color}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <button
                          onClick={() => handleQuantityChange(item.id, 'decrease')}
                          className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 'increase')}
                          className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {(item.price * item.quantity).toLocaleString()}đ
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 mt-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="text-gray-900">{calculateSubtotal().toLocaleString()}đ</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giảm giá</span>
                  <span className="text-green-600">-{calculateDiscount().toLocaleString()}đ</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="text-gray-900">
                    {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString()}đ`}
                  </span>
                </div>
                
                <div className="flex justify-between text-lg font-semibold border-t pt-3">
                  <span>Tổng cộng</span>
                  <span className="text-purple-600">{orderTotal.toLocaleString()}đ</span>
                </div>
              </div>

              {/* Security Badges */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Shield className="h-4 w-4" />
                    <span>Bảo mật</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Lock className="h-4 w-4" />
                    <span>SSL</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isProcessing || !formData.agreeTerms}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-colors ${
                isProcessing || !formData.agreeTerms
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </div>
              ) : (
                `Đặt hàng • ${orderTotal.toLocaleString()}đ`
              )}
            </motion.button>
          </div>
        </form>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{authMode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</h3>
              <button onClick={() => setShowAuth(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            {authError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">{authError}</div>
            )}

            <form onSubmit={authMode === 'login' ? submitLogin : submitRegister} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    name="name"
                    value={authForm.name}
                    onChange={handleAuthInput}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={authForm.email}
                  onChange={handleAuthInput}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                <input
                  type="password"
                  name="password"
                  value={authForm.password}
                  onChange={handleAuthInput}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className={`w-full py-3 rounded-lg font-semibold text-white ${authLoading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'}`}
              >
                {authLoading ? 'Đang xử lý...' : authMode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
