'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Star, Heart, ShoppingBag } from 'lucide-react';

// Mock data for featured products
const featuredProducts = [
  {
    id: 1,
    name: 'Đồng hồ nam sang trọng',
    price: '299,000',
    originalPrice: '399,000',
    image: '/api/placeholder/300/300',
    rating: 4.8,
    reviews: 128,
    badge: 'Bán chạy'
  },
  {
    id: 2,
    name: 'Túi xách nữ thời trang',
    price: '199,000',
    originalPrice: '299,000',
    image: '/api/placeholder/300/300',
    rating: 4.6,
    reviews: 95,
    badge: 'Mới'
  },
  {
    id: 3,
    name: 'Vòng tay trang sức',
    price: '89,000',
    originalPrice: '149,000',
    image: '/api/placeholder/300/300',
    rating: 4.9,
    reviews: 203,
    badge: 'Giảm giá'
  },
  {
    id: 4,
    name: 'Kính mát thời trang',
    price: '159,000',
    originalPrice: '229,000',
    image: '/api/placeholder/300/300',
    rating: 4.7,
    reviews: 76,
    badge: 'Hot'
  }
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 to-pink-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h1 className="text-4xl lg:text-6xl font-playfair font-bold text-gray-900 leading-tight">
                Phụ kiện thời trang
                <span className="text-purple-600 block">cho giới trẻ</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Khám phá bộ sưu tập phụ kiện thời trang đa dạng với giá cả phải chăng, 
                phù hợp cho học sinh sinh viên. Chất lượng tốt, thiết kế trẻ trung.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors duration-200 group"
                >
                  Mua sắm ngay
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-600 hover:text-white transition-colors duration-200"
                >
                  Xem blog
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="bg-purple-100 rounded-lg p-4 text-center">
                      <div className="w-16 h-16 bg-purple-200 rounded-full mx-auto mb-2"></div>
                      <p className="text-sm font-medium text-purple-700">Đồng hồ</p>
                    </div>
                    <div className="bg-pink-100 rounded-lg p-4 text-center">
                      <div className="w-16 h-16 bg-pink-200 rounded-full mx-auto mb-2"></div>
                      <p className="text-sm font-medium text-pink-700">Trang sức</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-100 rounded-lg p-4 text-center">
                      <div className="w-16 h-16 bg-blue-200 rounded-full mx-auto mb-2"></div>
                      <p className="text-sm font-medium text-blue-700">Túi xách</p>
                    </div>
                    <div className="bg-green-100 rounded-lg p-4 text-center">
                      <div className="w-16 h-16 bg-green-200 rounded-full mx-auto mb-2"></div>
                      <p className="text-sm font-medium text-green-700">Phụ kiện</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-gray-900 mb-4">
              Sản phẩm nổi bật
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những sản phẩm được yêu thích nhất với giá cả phải chăng
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <Link href={`/products/${product.id}`}>
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group cursor-pointer"
                >
                <div className="relative">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                  </div>
                  {product.badge && (
                    <span className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      {product.badge}
                    </span>
                  )}
                  <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">
                      ({product.reviews})
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-purple-600">
                        {product.price}đ
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {product.originalPrice}đ
                      </span>
                    </div>
                    <button className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      <ShoppingBag className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                </motion.div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/products"
              className="inline-flex items-center px-8 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors duration-200 group"
            >
              Xem tất cả sản phẩm
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Giao hàng nhanh</h3>
              <p className="text-gray-600">Miễn phí vận chuyển cho đơn hàng từ 200k</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💎</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chất lượng cao</h3>
              <p className="text-gray-600">Sản phẩm được kiểm tra kỹ lưỡng trước khi giao</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Đổi trả dễ dàng</h3>
              <p className="text-gray-600">Đổi trả trong 7 ngày nếu không hài lòng</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
