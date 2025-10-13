'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Heart, ShoppingBag, Grid, List } from 'lucide-react';
import Link from 'next/link';

// Mock data for products
const products = [
  {
    id: 1,
    name: 'Đồng hồ nam sang trọng',
    price: '299,000',
    originalPrice: '399,000',
    image: '/api/placeholder/300/300',
    rating: 4.8,
    reviews: 128,
    category: 'watches',
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
    category: 'bags',
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
    category: 'jewelry',
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
    category: 'accessories',
    badge: 'Hot'
  },
  {
    id: 5,
    name: 'Nhẫn bạc cao cấp',
    price: '129,000',
    originalPrice: '199,000',
    image: '/api/placeholder/300/300',
    rating: 4.5,
    reviews: 87,
    category: 'jewelry',
    badge: 'Giảm giá'
  },
  {
    id: 6,
    name: 'Ví da nam',
    price: '179,000',
    originalPrice: '249,000',
    image: '/api/placeholder/300/300',
    rating: 4.4,
    reviews: 156,
    category: 'accessories',
    badge: 'Mới'
  },
  {
    id: 7,
    name: 'Đồng hồ nữ dây da',
    price: '249,000',
    originalPrice: '349,000',
    image: '/api/placeholder/300/300',
    rating: 4.8,
    reviews: 92,
    category: 'watches',
    badge: 'Bán chạy'
  },
  {
    id: 8,
    name: 'Túi đeo chéo unisex',
    price: '149,000',
    originalPrice: '199,000',
    image: '/api/placeholder/300/300',
    rating: 4.6,
    reviews: 134,
    category: 'bags',
    badge: 'Hot'
  }
];

const categories = [
  { id: 'all', name: 'Tất cả', count: products.length },
  { id: 'watches', name: 'Đồng hồ', count: products.filter(p => p.category === 'watches').length },
  { id: 'bags', name: 'Túi xách', count: products.filter(p => p.category === 'bags').length },
  { id: 'jewelry', name: 'Trang sức', count: products.filter(p => p.category === 'jewelry').length },
  { id: 'accessories', name: 'Phụ kiện', count: products.filter(p => p.category === 'accessories').length },
];

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseInt(a.price.replace(/,/g, '')) - parseInt(b.price.replace(/,/g, ''));
      case 'price-high':
        return parseInt(b.price.replace(/,/g, '')) - parseInt(a.price.replace(/,/g, ''));
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl lg:text-4xl font-playfair font-bold text-gray-900 mb-4">
            Sản phẩm
          </h1>
          <p className="text-lg text-gray-600">
            Khám phá bộ sưu tập phụ kiện thời trang đa dạng với giá cả phải chăng
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bộ lọc</h3>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm sản phẩm..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục
                </label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-purple-100 text-purple-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {category.name} ({category.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sắp xếp
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="popular">Phổ biến</option>
                  <option value="price-low">Giá thấp đến cao</option>
                  <option value="price-high">Giá cao đến thấp</option>
                  <option value="rating">Đánh giá cao</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Bộ lọc
                </button>
                <p className="text-sm text-gray-600">
                  Hiển thị {sortedProducts.length} sản phẩm
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'grid' ? 'bg-purple-100 text-purple-700' : 'text-gray-400'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'list' ? 'bg-purple-100 text-purple-700' : 'text-gray-400'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Products */}
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {sortedProducts.map((product, index) => (
                <Link href={`/products/${product.id}`} key={product.id}>
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group cursor-pointer ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                  <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                    <div className={`${viewMode === 'list' ? 'h-48' : 'aspect-square'} bg-gray-100 flex items-center justify-center`}>
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
                  
                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
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

            {sortedProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
                <p className="text-gray-400 text-sm mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
