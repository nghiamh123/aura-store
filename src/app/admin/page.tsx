"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Shield } from "lucide-react";
import { apiFetch } from "@/lib/api";
import AdminStats from "./components/AdminStats";
import AdminOverview from "./components/AdminOverview";
import AdminProducts from "./components/AdminProducts";
import AdminOrders from "./components/AdminOrders";
import AdminBlog from "./components/AdminBlog";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [adminUser, setAdminUser] = useState("");
  const router = useRouter();

  // Products state
  const [products, setProducts] = useState<
    Array<{
      id: number;
      name: string;
      description: string;
      price: number;
      category: string;
      image?: string;
      originalPrice?: number;
      rating?: number;
      reviewCount?: number;
      detailedDescription?: string;
      material?: string;
      size?: string;
      color?: string;
      warranty?: string;
      badge?: string;
      status?: string;
      images?: string[];
    }>
  >([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Blog posts state
  const [posts, setPosts] = useState<
    Array<{
      id: number;
      title: string;
      slug: string;
      excerpt: string;
      coverImage?: string | null;
      createdAt: string;
    }>
  >([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<
    Array<{
      id: string;
      orderNumber: string;
      userId: string;
      total: number;
      status: string;
      createdAt: string;
      items: Array<{ product: { name: string } }>;
    }>
  >([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Check if user is authenticated via cookies
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    const adminAuth = getCookie("adminAuth");
    const user = getCookie("adminUser");

    if (!adminAuth || adminAuth !== "true") {
      router.push("/admin/login");
      return;
    }

    setAdminUser(user || "Admin");
  }, [router]);

  const loadProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const data = await apiFetch<{ products: typeof products }>("/products");
      setProducts(data.products);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Không tải được sản phẩm";
      setErrorMsg(msg);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const data = await apiFetch<{ orders: typeof orders }>("/orders");
      setOrders(data.orders);

      // Calculate stats from real data
      const totalRevenue = data.orders.reduce(
        (sum, order) => sum + order.total,
        0
      );
      const totalOrders = data.orders.length;
      const uniqueCustomers = new Set(data.orders.map((order) => order.userId))
        .size;

      setStats((prev) => ({
        ...prev,
        totalRevenue,
        totalOrders,
        totalCustomers: uniqueCustomers,
      }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Không tải được đơn hàng";
      setErrorMsg(msg);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const loadPosts = useCallback(async () => {
    try {
      setLoadingPosts(true);
      const data = await apiFetch<{
        posts: Array<{
          id: number;
          title: string;
          slug: string;
          excerpt: string;
          coverImage?: string | null;
          createdAt: string;
        }>;
      }>("/posts", { method: "GET" });
      setPosts(data.posts || []);
    } catch {
      // no-op
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "products") {
      void loadProducts();
    } else if (activeTab === "orders") {
      void loadOrders();
    } else if (activeTab === "overview") {
      void loadOrders(); // Load orders for stats and recent orders
    } else if (activeTab === "blog") {
      void loadPosts();
    }
  }, [activeTab, loadProducts, loadOrders, loadPosts]);

  const handleLogout = () => {
    // Clear admin session cookies
    document.cookie =
      "adminAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "adminUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/admin/login");
  };

  const getStatusColor = (status: string) => {
    const colors = {
      CONFIRMED: "bg-blue-100 text-blue-800",
      PROCESSING: "bg-yellow-100 text-yellow-800",
      SHIPPED: "bg-amber-100 text-amber-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string) => {
    const texts = {
      CONFIRMED: "Đã xác nhận",
      PROCESSING: "Đang xử lý",
      SHIPPED: "Đang giao hàng",
      DELIVERED: "Đã giao hàng",
      CANCELLED: "Đã hủy",
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
              <p className="text-gray-600 mt-1">Quản lý cửa hàng Aura</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Xin chào, {adminUser}</span>
              </div>
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
        <AdminStats stats={stats} products={products} />

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", label: "Tổng quan" },
                { id: "orders", label: "Đơn hàng" },
                { id: "products", label: "Sản phẩm" },
                { id: "customers", label: "Khách hàng" },
                { id: "blog", label: "Blog" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-amber-600 text-amber-600"
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
            {activeTab === "overview" && (
              <AdminOverview
                orders={orders}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
              />
            )}

            {activeTab === "blog" && (
              <AdminBlog
                posts={posts}
                loadingPosts={loadingPosts}
                errorMsg={errorMsg}
                setErrorMsg={setErrorMsg}
                onPostsChange={loadPosts}
              />
            )}

            {activeTab === "orders" && (
              <AdminOrders
                orders={orders}
                loadingOrders={loadingOrders}
                errorMsg={errorMsg}
                setErrorMsg={setErrorMsg}
                onOrdersChange={loadOrders}
              />
            )}

            {activeTab === "products" && (
              <AdminProducts
                products={products}
                loadingProducts={loadingProducts}
                errorMsg={errorMsg}
                setErrorMsg={setErrorMsg}
                onProductsChange={loadProducts}
              />
            )}

            {activeTab === "customers" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Quản lý khách hàng
                  </h3>
                </div>
                <p className="text-gray-600">
                  Chức năng quản lý khách hàng sẽ được phát triển...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
