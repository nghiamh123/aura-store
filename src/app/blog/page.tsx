'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { useState } from 'react';

// Mock data for blog posts
const blogPosts = [
  {
    id: 1,
    title: 'Cách chọn đồng hồ phù hợp với phong cách của bạn',
    excerpt: 'Hướng dẫn chi tiết về cách chọn đồng hồ phù hợp với từng phong cách thời trang và dịp sử dụng.',
    image: '/api/placeholder/400/250',
    author: 'Aura Team',
    date: '2024-01-15',
    category: 'Thời trang',
    readTime: '5 phút đọc',
    featured: true
  },
  {
    id: 2,
    title: 'Xu hướng phụ kiện thời trang 2024',
    excerpt: 'Khám phá những xu hướng phụ kiện thời trang hot nhất năm 2024 dành cho giới trẻ.',
    image: '/api/placeholder/400/250',
    author: 'Aura Team',
    date: '2024-01-10',
    category: 'Xu hướng',
    readTime: '7 phút đọc',
    featured: false
  },
  {
    id: 3,
    title: 'Bí quyết mix & match phụ kiện cho học sinh',
    excerpt: 'Những tips đơn giản để tạo nên phong cách thời trang cá tính với ngân sách hạn chế.',
    image: '/api/placeholder/400/250',
    author: 'Aura Team',
    date: '2024-01-08',
    category: 'Tips',
    readTime: '6 phút đọc',
    featured: false
  },
  {
    id: 4,
    title: 'Cách bảo quản trang sức để luôn sáng bóng',
    excerpt: 'Hướng dẫn chi tiết cách bảo quản và vệ sinh trang sức để giữ được độ sáng bóng lâu dài.',
    image: '/api/placeholder/400/250',
    author: 'Aura Team',
    date: '2024-01-05',
    category: 'Chăm sóc',
    readTime: '4 phút đọc',
    featured: false
  },
  {
    id: 5,
    title: 'Top 5 phụ kiện không thể thiếu cho sinh viên',
    excerpt: 'Danh sách những phụ kiện cần thiết mà mọi sinh viên nên có trong tủ đồ của mình.',
    image: '/api/placeholder/400/250',
    author: 'Aura Team',
    date: '2024-01-03',
    category: 'Lifestyle',
    readTime: '8 phút đọc',
    featured: false
  },
  {
    id: 6,
    title: 'Cách chọn túi xách phù hợp với từng dịp',
    excerpt: 'Hướng dẫn chọn túi xách phù hợp với từng dịp sử dụng và phong cách cá nhân.',
    image: '/api/placeholder/400/250',
    author: 'Aura Team',
    date: '2024-01-01',
    category: 'Thời trang',
    readTime: '6 phút đọc',
    featured: false
  }
];

const categories = ['Tất cả', 'Thời trang', 'Xu hướng', 'Tips', 'Chăm sóc', 'Lifestyle'];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const filteredPosts = selectedCategory === 'Tất cả' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl lg:text-4xl font-playfair font-bold text-gray-900 mb-4">
            Blog Aura
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Khám phá những bài viết về thời trang, xu hướng và tips chăm sóc phụ kiện 
            dành cho giới trẻ
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && selectedCategory === 'Tất cả' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="relative">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <div className="w-32 h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Nổi bật
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
                      {featuredPost.category}
                    </span>
                    <span className="text-gray-500 text-sm">{featuredPost.readTime}</span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-gray-900 mb-4">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{featuredPost.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(featuredPost.date).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    <Link
                      href={`/blog/${featuredPost.id}`}
                      className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium group"
                    >
                      Đọc thêm
                      <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Regular Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
            >
              <div className="relative">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="w-24 h-16 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-3 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.date).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{post.readTime}</span>
                  <Link
                    href={`/blog/${post.id}`}
                    className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium text-sm group"
                  >
                    Đọc thêm
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {regularPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Không có bài viết nào trong danh mục này</p>
          </div>
        )}

        {/* Newsletter */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-playfair font-bold mb-4">
            Đăng ký nhận tin tức
          </h3>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            Nhận những bài viết mới nhất về thời trang và xu hướng phụ kiện 
            trực tiếp vào hộp thư của bạn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
            />
            <button className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              Đăng ký
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
