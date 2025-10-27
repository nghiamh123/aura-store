"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowRight, Star } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist, loading, error } =
    useWishlist();
  const { addToCart } = useCart();
  const [actionLoading, setActionLoading] = useState<{
    [key: number]: boolean;
  }>({});
  const [clearAllLoading, setClearAllLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddToCart = async (item: any) => {
    setActionLoading((prev) => ({ ...prev, [item.id]: true }));
    try {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image,
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  const handleRemoveFromWishlist = async (id: number) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await removeFromWishlist(id);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleClearAll = async () => {
    setClearAllLoading(true);
    try {
      await clearWishlist();
    } finally {
      setClearAllLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mt-2 animate-pulse"></div>
          </div>
        </div>

        {/* Products Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-playfair font-bold text-gray-900">
              Danh sách yêu thích
            </h1>
          </div>
        </div>

        {/* Empty State */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Danh sách yêu thích trống
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Bạn chưa có sản phẩm nào trong danh sách yêu thích. Hãy khám phá
              các sản phẩm và thêm vào danh sách yêu thích của bạn.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors"
            >
              Khám phá sản phẩm
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-playfair font-bold text-gray-900">
                Danh sách yêu thích
              </h1>
              <p className="text-gray-600 mt-2">
                {items.length} sản phẩm trong danh sách yêu thích
              </p>
            </div>
            <button
              onClick={handleClearAll}
              disabled={clearAllLoading}
              className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {clearAllLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
              )}
              Xóa tất cả
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
            >
              <div className="relative">
                <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                  )}
                  {item.badge && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  disabled={actionLoading[item.id]}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 disabled:opacity-50"
                >
                  {actionLoading[item.id] ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                  ) : (
                    <Trash2 className="h-4 w-4 text-red-500" />
                  )}
                </button>
                <button
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  disabled={actionLoading[item.id]}
                  className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  <Heart className="h-4 w-4 text-red-500 fill-current" />
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.name}
                </h3>

                {item.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {(item.rating || item.reviewCount) && (
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(item.rating || 0)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">
                      ({item.reviewCount || 0})
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-black">
                      {item.price.toLocaleString()}đ
                    </span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {item.originalPrice.toLocaleString()}đ
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={actionLoading[item.id]}
                    className="flex-1 bg-amber-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-amber-600 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {actionLoading[item.id] ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <ShoppingBag className="h-4 w-4 mr-2" />
                    )}
                    Thêm vào giỏ
                  </button>
                  <Link
                    href={`/products/${item.id}`}
                    className="p-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 border-2 border-amber-500 text-amber-500 font-semibold rounded-lg hover:bg-amber-500 hover:text-white transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
          <button
            onClick={handleClearAll}
            disabled={clearAllLoading}
            className="inline-flex items-center px-6 py-3 bg-red-600/70 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {clearAllLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            Xóa tất cả
          </button>
        </div>
      </div>
    </div>
  );
}
