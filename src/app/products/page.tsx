"use client";

import ProductCard from "@/components/ProductCard";
import { API_BASE_URL } from "@/lib/api";
import { Filter, Grid, List, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useWishlist } from "@/contexts/WishlistContext";

export type ProductItem = {
  id: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  rating?: number;
  reviews?: number;
  category: string;
  badge?: string;
};

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<
    "popular" | "price-low" | "price-high" | "rating"
  >("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Wishlist context
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleWishlistToggle = async (product: ProductItem) => {
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
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE_URL}/products`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
        const data = await res.json();
        setProducts((data?.products || []) as ProductItem[]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        setError(e.message || "Không tải được sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const categories = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of products) {
      map[p.category] = (map[p.category] || 0) + 1;
    }

    // Mapping từ tiếng Anh sang tiếng Việt
    const categoryNames: Record<string, string> = {
      watches: "Đồng hồ",
      jewelry: "Trang sức",
      bags: "Túi xách",
      accessories: "Phụ kiện",
    };

    const arr = Object.entries(map).map(([id, count]) => ({
      id,
      name: categoryNames[id] || id,
      count,
    }));
    return [{ id: "all", name: "Tất cả", count: products.length }, ...arr];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const t = searchTerm.toLowerCase();
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(t);
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    switch (sortBy) {
      case "price-low":
        return arr.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price-high":
        return arr.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "rating":
        return arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return arr;
    }
  }, [filteredProducts, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl lg:text-4xl font-playfair font-bold text-gray-900 mb-4">
            Sản phẩm
          </h1>
          <p className="text-lg text-gray-600">
            Khám phá bộ sưu tập phụ kiện thời trang đa dạng với giá cả phải
            chăng
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Bộ lọc
              </h3>

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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg  text-gray-600"
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
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                        selectedCategory === category.id
                          ? "bg-amber-100 text-primary font-medium"
                          : "text-gray-600 hover:bg-gray-100"
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
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg  focus:border-transparent text-gray-600"
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
                  {loading
                    ? "Đang tải…"
                    : `Hiển thị ${sortedProducts.length} sản phẩm`}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-amber-100 text-primary"
                      : "text-gray-400"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg cursor-pointer ${
                    viewMode === "list"
                      ? "bg-amber-100 text-primary"
                      : "text-gray-400"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Products */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {sortedProducts.map((product, index) => (
                <Link href={`/products/${product.id}`} key={product.id}>
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    viewMode={viewMode}
                    handleWishlistToggle={handleWishlistToggle}
                    isInWishlist={isInWishlist}
                  />
                </Link>
              ))}
            </div>

            {!loading && sortedProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Không tìm thấy sản phẩm nào
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
