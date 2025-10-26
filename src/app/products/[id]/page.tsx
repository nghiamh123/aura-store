"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Star,
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  Share2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

interface Product {
  id: number;
  name: string;
  description: string;
  detailedDescription?: string;
  price: number;
  originalPrice?: number;
  category: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  material?: string;
  size?: string;
  color?: string;
  warranty?: string;
  status: string;
  image?: string;
  images?: string[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [activeTab, setActiveTab] = useState("description");

  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProduct(data.product);
      } catch (err) {
        setError("Không thể tải thông tin sản phẩm");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const sizes = ["S", "M", "L", "XL"];
  const colors = [
    { name: "Đen", value: "black", class: "bg-black" },
    { name: "Trắng", value: "white", class: "bg-white border border-gray-300" },
    { name: "Xanh", value: "blue", class: "bg-blue-500" },
    { name: "Đỏ", value: "red", class: "bg-red-500" },
  ];

  const handleQuantityChange = (type: "increase" | "decrease") => {
    if (type === "increase") {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      image: product.image || product.images?.[0] || "",
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // Redirect to checkout
    window.location.href = "/checkout";
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        image: product.image || product.images?.[0] || "",
      });
    }
  };

  // Loading and error states
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error || "Không tìm thấy sản phẩm"}
          </p>
          <Link
            href="/products"
            className="text-purple-600 hover:text-purple-700"
          >
            ← Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-secondary">
              Trang chủ
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              href="/products"
              className="text-gray-500 hover:text-secondary"
            >
              Sản phẩm
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-secondary">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="w-full h-full bg-gray-100 flex items-center justify-center relative">
                {(() => {
                  const allImages =
                    product.images && product.images.length > 0
                      ? product.images
                      : product.image
                      ? [product.image]
                      : [];

                  const currentImage = allImages[selectedImage];

                  return currentImage ? (
                    <img
                      src={currentImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
                  );
                })()}
                <button
                  onClick={handleWishlistToggle}
                  className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md opacity-0 hover:opacity-100 transition-opacity"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isInWishlist(product.id)
                        ? "text-red-500 fill-current"
                        : "text-gray-600"
                    }`}
                  />
                </button>
                <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md opacity-0 hover:opacity-100 transition-opacity">
                  <Share2 className="h-5 w-5 text-gray-600" />
                </button>
                <button className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md opacity-0 hover:opacity-100 transition-opacity">
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <button className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md opacity-0 hover:opacity-100 transition-opacity">
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {(() => {
                const allImages =
                  product.images && product.images.length > 0
                    ? product.images
                    : product.image
                    ? [product.image]
                    : [];

                return allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-lg border-2 overflow-hidden transition-all ${
                      selectedImage === index
                        ? "border-purple-600 ring-2 ring-purple-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      {image ? (
                        <img
                          src={image}
                          alt={`${product.name} - Ảnh ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      )}
                    </div>
                  </button>
                ));
              })()}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Badge */}
            {product.badge && (
              <span className="inline-block bg-amber-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                {product.badge}
              </span>
            )}

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-playfair font-bold text-gray-900">
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-secondary">
                  {product.rating} ({product.reviewCount || 0} đánh giá)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-black">
                {product.price.toLocaleString()}đ
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {product.originalPrice.toLocaleString()}đ
                  </span>
                  <span className="bg-red-100 text-red-600 text-sm font-semibold px-2 py-1 rounded">
                    -
                    {Math.round(
                      (1 - product.price / product.originalPrice) * 100
                    )}
                    %
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Kích thước
              </h3>
              <div className="flex space-x-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 border-2 rounded-lg font-semibold transition-colors text-gray-500 ${
                      selectedSize === size
                        ? "border-purple-600 bg-purple-100 text-purple-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Màu sắc
              </h3>
              <div className="flex space-x-3">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === color.value
                        ? "border-purple-600 scale-110"
                        : "border-gray-300 hover:scale-105"
                    } ${color.class}`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Số lượng
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange("decrease")}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus className="h-4 w-4 text-gray-500" />
                </button>
                <span className="w-16 text-center text-gray-500 font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange("increase")}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-amber-300 text-white py-4 px-6 rounded-lg font-semibold hover:bg-amber-400 transition-colors flex items-center justify-center cursor-pointer"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Thêm vào giỏ
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-gray-900 text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Mua ngay
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-amber-200" />
                <span className="text-sm text-gray-600">
                  Miễn phí vận chuyển
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-amber-200" />
                <span className="text-sm text-gray-600">Bảo hành 24 tháng</span>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="h-5 w-5 text-amber-200" />
                <span className="text-sm text-gray-600">Đổi trả 7 ngày</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="bg-white rounded-2xl shadow-lg">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: "description", label: "Mô tả sản phẩm" },
                  { id: "specifications", label: "Thông số kỹ thuật" },
                  { id: "reviews", label: "Đánh giá" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? "border-secondary text-secondary"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "description" && (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-gray-600">
                    {product.detailedDescription || product.description}
                  </div>
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.material && (
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="font-medium text-gray-900">
                        Chất liệu
                      </span>
                      <span className="text-gray-600">{product.material}</span>
                    </div>
                  )}
                  {product.size && (
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="font-medium text-gray-900">
                        Kích thước
                      </span>
                      <span className="text-gray-600">{product.size}</span>
                    </div>
                  )}
                  {product.color && (
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="font-medium text-gray-900">Màu sắc</span>
                      <span className="text-gray-600">{product.color}</span>
                    </div>
                  )}
                  {product.warranty && (
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="font-medium text-gray-900">
                        Bảo hành
                      </span>
                      <span className="text-gray-600">{product.warranty}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-900">Danh mục</span>
                    <span className="text-gray-600">{product.category}</span>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      Chức năng đánh giá sẽ được phát triển trong tương lai
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
