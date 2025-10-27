"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Star, Heart, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { GlassCard } from "@developer-hub/liquid-glass";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wishlist context
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleWishlistToggle = async (product: Product) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        image: product.image || "",
      });
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Take first 4 products as featured
        setFeaturedProducts(data.products.slice(0, 4));
      } catch (err) {
        setError("Không thể tải sản phẩm nổi bật");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative bg-gradient-to-br from-amber-50 to-pink-50 py-20 lg:py-32 before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-black before:opacity-50"
        style={{
          backgroundImage:
            "url(https://aura-store-bucket.s3.ap-southeast-2.amazonaws.com/background/banner.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <GlassCard
              displacementScale={100}
              blurAmount={0.01}
              cornerRadius={32}
              padding="32px 24px"
            >
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <h1 className="text-4xl lg:text-5xl font-playfair font-bold text-gray-100 leading-tight">
                  Phụ kiện thời trang
                  <span className="text-amber-200 block">cho giới trẻ</span>
                </h1>
                <p className="text-lg text-gray-100 leading-relaxed">
                  Khám phá bộ sưu tập phụ kiện thời trang đa dạng với giá cả
                  phải chăng, phù hợp cho học sinh sinh viên. Chất lượng tốt,
                  thiết kế trẻ trung.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center px-8 py-4 bg-amber-200/80 text-white font-semibold rounded-lg hover:bg-amber-200 transition-colors duration-200 group"
                  >
                    Mua sắm ngay
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/blog"
                    className="inline-flex items-center justify-center px-8 py-4 border-2 border-amber-200 text-amber-200 font-semibold rounded-lg hover:bg-amber-200 hover:text-white transition-colors duration-200"
                  >
                    Xem blog
                  </Link>
                </div>
              </motion.div>
            </GlassCard>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-4xl shadow-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      name: "Đồng hồ",
                      bgUrl:
                        "https://aura-store-bucket.s3.ap-southeast-2.amazonaws.com/background/318040e8144f6a875fc9bcca1ba1984f.jpg",
                      iconColor: "bg-amber-800",
                    },
                    {
                      name: "Trang sức",
                      bgUrl:
                        "https://aura-store-bucket.s3.ap-southeast-2.amazonaws.com/background/2811b1359f8274024d64f5f296fdff9b.jpg",
                      iconColor: "bg-pink-800",
                    },
                    {
                      name: "Túi xách",
                      bgUrl:
                        "https://aura-store-bucket.s3.ap-southeast-2.amazonaws.com/background/bed0af8da2521686ea49ee0dfc1ac26e.jpg",
                      iconColor: "bg-blue-800",
                    },
                    {
                      name: "Phụ kiện",
                      bgUrl:
                        "https://aura-store-bucket.s3.ap-southeast-2.amazonaws.com/background/38309c7e35cc1fe937aa9b1a139611c8.jpg",
                      iconColor: "bg-green-800",
                    },
                  ].map((category, index) => (
                    <div
                      key={index}
                      className={`rounded-xl text-center max-h-[160px] h-[160px] overflow-hidden relative`}
                      style={{
                        backgroundImage: `url(${category.bgUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                    >
                      <div
                        className={` ${category.iconColor} h-full w-full opacity-50`}
                      ></div>
                      <p
                        className={`text-sm font-medium text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}
                      >
                        <span className="text-lg md:text-xl font-bold">
                          {category.name}
                        </span>
                      </p>
                    </div>
                  ))}
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
            {loading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse"
                >
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <Link
                  href="/products"
                  className="text-amber-600 hover:text-amber-700"
                >
                  Xem tất cả sản phẩm
                </Link>
              </div>
            ) : (
              featuredProducts.map((product, index) => (
                <Link href={`/products/${product.id}`} key={product.id}>
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group cursor-pointer"
                  >
                    <div className="relative">
                      <div className="aspect-square bg-gray-100 flex items-center justify-center">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                        )}
                      </div>
                      {product.badge && (
                        <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          {product.badge}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleWishlistToggle(product);
                        }}
                        className={`absolute top-2 right-2 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity ${
                          isInWishlist(product.id)
                            ? "bg-red-500 text-white"
                            : "bg-white text-gray-600 hover:bg-red-50"
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            isInWishlist(product.id) ? "fill-current" : ""
                          }`}
                        />
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
                                i < Math.floor(product.rating || 0)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 ml-2">
                          ({product.reviewCount || 0})
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-black">
                            {product.price.toLocaleString()}đ
                          </span>
                          {product.originalPrice &&
                            product.originalPrice > product.price && (
                              <span className="text-sm text-gray-500 line-through">
                                {product.originalPrice.toLocaleString()}đ
                              </span>
                            )}
                        </div>
                        <button className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-500 transition-colors">
                          <ShoppingBag className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/products"
              className="inline-flex items-center px-8 py-4 bg-amber-400 text-white font-semibold rounded-lg hover:bg-amber-500  transition-colors duration-200 group"
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
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Giao hàng nhanh
              </h3>
              <p className="text-gray-600">
                Miễn phí vận chuyển cho đơn hàng từ 200k
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💎</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chất lượng cao
              </h3>
              <p className="text-gray-600">
                Sản phẩm được kiểm tra kỹ lưỡng trước khi giao
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Đổi trả dễ dàng
              </h3>
              <p className="text-gray-600">
                Đổi trả trong 7 ngày nếu không hài lòng
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
