"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  Shield,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

// Helper functions for status display

const topProducts = [
  {
    id: 1,
    name: "Đồng hồ nam sang trọng",
    sales: 45,
    revenue: 13455000,
    image: "/api/placeholder/60/60",
  },
  {
    id: 2,
    name: "Túi xách nữ thời trang",
    sales: 32,
    revenue: 6368000,
    image: "/api/placeholder/60/60",
  },
  {
    id: 3,
    name: "Vòng tay trang sức",
    sales: 28,
    revenue: 2492000,
    image: "/api/placeholder/60/60",
  },
];

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
    }>
  >([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

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
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postForm, setPostForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    tags: "", // comma separated
    status: "DRAFT", // DRAFT | PUBLISHED
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [postFiles, setPostFiles] = useState<File[]>([]);

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
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [orderStatusForm, setOrderStatusForm] = useState({
    status: "",
    trackingNumber: "",
    notes: "",
  });

  // Stats state
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    originalPrice: "",
    rating: "",
    reviewCount: "",
    detailedDescription: "",
    material: "",
    size: "",
    color: "",
    warranty: "",
    badge: "",
    status: "active",
  });
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Check if required fields are filled
  const isFormValid = () => {
    const requiredFields = [
      createForm.name.trim(),
      createForm.description.trim(),
      createForm.price.trim(),
      createForm.category.trim(),
    ];

    // Check if all required fields are filled
    const allFieldsFilled = requiredFields.every((field) => field.length > 0);

    // Check if price is a valid number and greater than 0
    const priceValid =
      createForm.price.trim() &&
      !isNaN(Number(createForm.price)) &&
      Number(createForm.price) > 0;

    return allFieldsFilled && priceValid;
  };

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

  useEffect(() => {
    if (activeTab === "products") {
      void loadProducts();
    } else if (activeTab === "orders") {
      void loadOrders();
    } else if (activeTab === "overview") {
      void loadOrders(); // Load orders for stats and recent orders
    }
  }, [activeTab, loadProducts, loadOrders]);

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
    } catch (e) {
      // no-op
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "blog") {
      void loadPosts();
    }
  }, [activeTab, loadPosts]);

  async function uploadToS3(selected: File): Promise<string> {
    // Ask backend for presigned POST
    const presign = await apiFetch<{
      url: string;
      fields: Record<string, string>;
      key: string;
      finalUrl?: string;
    }>("/uploads/presign", {
      method: "POST",
      body: JSON.stringify({ filename: selected.name }),
    });

    const form = new FormData();
    Object.entries(presign.fields).forEach(([k, v]) => form.append(k, v));
    // Do NOT set Content-Type header or form field; browser will set multipart boundary automatically
    form.append("file", selected);

    const res = await fetch(presign.url, { method: "POST", body: form });
    if (!res.ok) throw new Error("Upload S3 thất bại");

    const location = presign.finalUrl || res.headers.get("Location") || "";
    if (!location) throw new Error("Không lấy được URL ảnh sau upload");
    return location;
  }

  async function uploadMultipleToS3(selectedFiles: File[]): Promise<string[]> {
    const uploadPromises = selectedFiles.map((file) => uploadToS3(file));
    return Promise.all(uploadPromises);
  }

  async function createProduct() {
    try {
      setErrorMsg("");
      setUploading(true);

      let imageUrl = createForm.image.trim() || "";
      let imageUrls: string[] = [];

      // Upload single image if provided
      if (!imageUrl && file) {
        imageUrl = await uploadToS3(file);
      }

      // Upload multiple images if provided
      if (files.length > 0) {
        imageUrls = await uploadMultipleToS3(files);
      }

      const body = {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        price: Number(createForm.price),
        category: createForm.category.trim(),
        image: imageUrl || undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        originalPrice: createForm.originalPrice
          ? Number(createForm.originalPrice)
          : undefined,
        rating: createForm.rating ? Number(createForm.rating) : undefined,
        reviewCount: createForm.reviewCount
          ? Number(createForm.reviewCount)
          : undefined,
        detailedDescription: createForm.detailedDescription.trim() || undefined,
        material: createForm.material.trim() || undefined,
        size: createForm.size.trim() || undefined,
        color: createForm.color.trim() || undefined,
        warranty: createForm.warranty.trim() || undefined,
        badge: createForm.badge.trim() || undefined,
        status: createForm.status,
      };
      await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setShowCreate(false);
      setCreateForm({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
        originalPrice: "",
        rating: "",
        reviewCount: "",
        detailedDescription: "",
        material: "",
        size: "",
        color: "",
        warranty: "",
        badge: "",
        status: "active",
      });
      setFile(null);
      setFiles([]);
      await loadProducts();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Tạo sản phẩm thất bại";
      setErrorMsg(msg);
    } finally {
      setUploading(false);
    }
  }

  async function createPost() {
    try {
      setErrorMsg("");
      setUploading(true);

      // Upload cover image if provided
      let coverUrl = postForm.coverImage.trim() || "";
      if (!coverUrl && coverFile) {
        coverUrl = await uploadToS3(coverFile);
      }

      // Upload gallery images if provided
      let galleryUrls: string[] = [];
      if (postFiles.length > 0) {
        galleryUrls = await uploadMultipleToS3(postFiles);
      }

      const body = {
        title: postForm.title.trim(),
        slug: postForm.slug.trim(),
        excerpt: postForm.excerpt.trim(),
        content: postForm.content.trim(),
        coverImage: coverUrl || undefined,
        images: galleryUrls.length ? galleryUrls : undefined,
        tags: postForm.tags
          ? postForm.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
        status: postForm.status,
      };

      await apiFetch("/posts", { method: "POST", body: JSON.stringify(body) });
      setShowCreatePost(false);
      setPostForm({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        coverImage: "",
        tags: "",
        status: "DRAFT",
      });
      setCoverFile(null);
      setPostFiles([]);
      await loadPosts();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Tạo bài viết thất bại";
      setErrorMsg(msg);
    } finally {
      setUploading(false);
    }
  }

  async function deleteProduct(id: number) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Xóa sản phẩm thất bại");
      }

      await loadProducts();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Xóa sản phẩm thất bại";
      setErrorMsg(msg);
    }
  }

  async function updateOrderStatus(orderId: string) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderStatusForm),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Cập nhật trạng thái thất bại");
      }

      await loadOrders();
      setEditingOrder(null);
      setOrderStatusForm({ status: "", trackingNumber: "", notes: "" });
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "Cập nhật trạng thái thất bại";
      setErrorMsg(msg);
    }
  }

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
              {/* <button className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm sản phẩm
                </button> */}
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
          {[
            {
              title: "Tổng doanh thu",
              value: stats.totalRevenue.toLocaleString(),
              change: "+12.5%",
              changeType: "increase",
              icon: DollarSign,
              color: "text-green-600",
            },
            {
              title: "Đơn hàng",
              value: stats.totalOrders.toString(),
              change: "+8.2%",
              changeType: "increase",
              icon: ShoppingBag,
              color: "text-blue-600",
            },
            {
              title: "Sản phẩm",
              value: products.length.toString(),
              change: "+3.1%",
              changeType: "increase",
              icon: Package,
              color: "text-amber-600",
            },
            {
              title: "Khách hàng",
              value: stats.totalCustomers.toString(),
              change: "+5.7%",
              changeType: "increase",
              icon: Users,
              color: "text-orange-600",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg ${stat.color
                    .replace("text-", "bg-")
                    .replace("-600", "-100")}`}
                >
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {stat.changeType === "increase" ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === "increase"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  so với tháng trước
                </span>
              </div>
            </motion.div>
          ))}
        </div>

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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Đơn hàng gần đây
                  </h3>
                  <div className="space-y-4">
                    {orders.slice(0, 4).map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              #{order.id}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.userId === "guest-user"
                                ? "Khách hàng"
                                : order.userId}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {order.total.toLocaleString()}đ
                          </p>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Top Products */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Sản phẩm bán chạy
                  </h3>
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
                            <p className="font-medium text-gray-900">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {product.sales} đã bán
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {product.revenue.toLocaleString()}đ
                          </p>
                          <p className="text-sm text-gray-600">doanh thu</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "blog" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Quản lý blog
                  </h3>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm bài viết
                  </button>
                </div>

                {loadingPosts ? (
                  <div className="text-gray-600">Đang tải bài viết...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((p) => (
                      <div
                        key={p.id}
                        className="bg-white border rounded-xl overflow-hidden"
                      >
                        {p.coverImage ? (
                          <img
                            src={p.coverImage}
                            alt={p.title}
                            className="w-full aspect-video object-cover"
                          />
                        ) : (
                          <div className="w-full aspect-video bg-gray-100" />
                        )}
                        <div className="p-4">
                          <div className="text-sm text-gray-500 mb-1">
                            {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                          </div>
                          <div className="font-semibold text-gray-900 line-clamp-2">
                            {p.title}
                          </div>
                          <div className="mt-3 text-right">
                            <a
                              href={`/blog/${p.slug}`}
                              target="_blank"
                              className="text-amber-600 hover:text-amber-700 text-sm"
                            >
                              Xem
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showCreatePost && (
                  <div className="mt-6 bg-white border rounded-xl p-6">
                    <h4 className="font-semibold mb-6 text-gray-800">
                      Thêm bài viết
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Tiêu đề *
                        </label>
                        <input
                          value={postForm.title}
                          onChange={(e) =>
                            setPostForm({ ...postForm, title: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Slug *
                        </label>
                        <input
                          value={postForm.slug}
                          onChange={(e) =>
                            setPostForm({
                              ...postForm,
                              slug: e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]+/g, "-"),
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-700"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-700 mb-1">
                          Tóm tắt *
                        </label>
                        <textarea
                          value={postForm.excerpt}
                          onChange={(e) =>
                            setPostForm({
                              ...postForm,
                              excerpt: e.target.value,
                            })
                          }
                          rows={2}
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-700"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-700 mb-1">
                          Nội dung *
                        </label>
                        <textarea
                          value={postForm.content}
                          onChange={(e) =>
                            setPostForm({
                              ...postForm,
                              content: e.target.value,
                            })
                          }
                          rows={6}
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Tags (phân cách bởi dấu phẩy)
                        </label>
                        <input
                          value={postForm.tags}
                          onChange={(e) =>
                            setPostForm({ ...postForm, tags: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Trạng thái
                        </label>
                        <select
                          value={postForm.status}
                          onChange={(e) =>
                            setPostForm({ ...postForm, status: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-700"
                        >
                          <option value="DRAFT">Nháp</option>
                          <option value="PUBLISHED">Xuất bản</option>
                        </select>
                      </div>

                      {/* Ảnh */}
                      <div className="md:col-span-2">
                        <h5 className="font-medium text-gray-700 mb-3">
                          Ảnh bài viết
                        </h5>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Ảnh cover
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setCoverFile(e.target.files?.[0] || null)
                          }
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Ảnh gallery (nhiều ảnh)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) =>
                            setPostFiles(Array.from(e.target.files || []))
                          }
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer text-gray-700"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3 items-center">
                      <button
                        disabled={uploading}
                        onClick={createPost}
                        className="px-5 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                      >
                        {uploading ? "Đang tạo..." : "Tạo bài viết"}
                      </button>
                      <button
                        disabled={uploading}
                        onClick={() => setShowCreatePost(false)}
                        className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Quản lý đơn hàng
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm đơn hàng..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                      {loadingOrders ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                            <p className="text-gray-500 mt-2">
                              Đang tải đơn hàng...
                            </p>
                          </td>
                        </tr>
                      ) : orders.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            Chưa có đơn hàng nào
                          </td>
                        </tr>
                      ) : (
                        orders.map((order, index) => (
                          <motion.tr
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                #{order.orderNumber || order.id}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.items.length} sản phẩm
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {order.userId === "guest-user"
                                ? "Khách hàng"
                                : order.userId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.total.toLocaleString()}đ
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                {getStatusText(order.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  className="text-amber-600 hover:text-amber-900"
                                  title="Xem chi tiết"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingOrder(order.id);
                                    setOrderStatusForm({
                                      status: order.status,
                                      trackingNumber: "",
                                      notes: "",
                                    });
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Cập nhật trạng thái"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Order Status Edit Modal */}
                {editingOrder && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Cập nhật trạng thái đơn hàng
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trạng thái
                          </label>
                          <select
                            value={orderStatusForm.status}
                            onChange={(e) =>
                              setOrderStatusForm((prev) => ({
                                ...prev,
                                status: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          >
                            <option value="CONFIRMED">Đã xác nhận</option>
                            <option value="PROCESSING">Đang xử lý</option>
                            <option value="SHIPPED">Đã giao hàng</option>
                            <option value="DELIVERED">Đã giao</option>
                            <option value="CANCELLED">Đã hủy</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mã vận đơn (tùy chọn)
                          </label>
                          <input
                            type="text"
                            value={orderStatusForm.trackingNumber}
                            onChange={(e) =>
                              setOrderStatusForm((prev) => ({
                                ...prev,
                                trackingNumber: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Nhập mã vận đơn"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ghi chú (tùy chọn)
                          </label>
                          <textarea
                            value={orderStatusForm.notes}
                            onChange={(e) =>
                              setOrderStatusForm((prev) => ({
                                ...prev,
                                notes: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            rows={3}
                            placeholder="Nhập ghi chú"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 mt-6">
                        <button
                          onClick={() => {
                            setEditingOrder(null);
                            setOrderStatusForm({
                              status: "",
                              trackingNumber: "",
                              notes: "",
                            });
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => updateOrderStatus(editingOrder)}
                          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                        >
                          Cập nhật
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "products" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Quản lý sản phẩm
                  </h3>
                  <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tên
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Giá
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Danh mục
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ảnh
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {p.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {p.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {p.price.toLocaleString()}đ
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {p.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {p.image ? (
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                <img
                                  src={p.image as string}
                                  alt={p.name}
                                  className="h-10 w-10 rounded object-cover border"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded bg-gray-100 border" />
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => deleteProduct(p.id)}
                                className="text-red-600 hover:text-red-800 inline-flex items-center"
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Xóa
                              </button>
                            </td>
                          </tr>
                        ))}
                        {products.length === 0 && (
                          <tr>
                            <td
                              className="px-6 py-4 text-sm text-gray-500"
                              colSpan={5}
                            >
                              Chưa có sản phẩm
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {showCreate && (
                  <div className="mt-6 bg-white border rounded-xl p-6">
                    <h4 className="font-semibold mb-6 text-gray-800">
                      Thêm sản phẩm
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Thông tin cơ bản */}
                      <div className="md:col-span-2">
                        <h5 className="font-medium text-gray-700 mb-3">
                          Thông tin cơ bản
                        </h5>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Tên sản phẩm <span className="text-red-500">*</span>
                        </label>
                        <input
                          value={createForm.name}
                          onChange={(e) =>
                            setCreateForm({
                              ...createForm,
                              name: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-700 ${
                            !createForm.name.trim()
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="Nhập tên sản phẩm"
                        />
                        {!createForm.name.trim() && (
                          <p className="text-xs text-red-500 mt-1">
                            Tên sản phẩm là bắt buộc
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Danh mục <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={createForm.category}
                          onChange={(e) =>
                            setCreateForm({
                              ...createForm,
                              category: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-700 ${
                            !createForm.category.trim()
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Chọn danh mục</option>
                          <option value="watches">Đồng hồ</option>
                          <option value="jewelry">Trang sức</option>
                          <option value="bags">Túi xách</option>
                          <option value="accessories">Phụ kiện</option>
                        </select>
                        {!createForm.category.trim() && (
                          <p className="text-xs text-red-500 mt-1">
                            Danh mục là bắt buộc
                          </p>
                        )}
                      </div>

                      {/* Giá cả */}
                      <div className="md:col-span-2">
                        <h5 className="font-medium text-gray-700 mb-3">
                          Giá cả
                        </h5>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Giá bán (đ) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={createForm.price}
                          onChange={(e) =>
                            setCreateForm({
                              ...createForm,
                              price: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-700 ${
                            !createForm.price.trim() ||
                            isNaN(Number(createForm.price)) ||
                            Number(createForm.price) <= 0
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="299000"
                        />
                        {(!createForm.price.trim() ||
                          isNaN(Number(createForm.price)) ||
                          Number(createForm.price) <= 0) && (
                          <p className="text-xs text-red-500 mt-1">
                            Giá bán phải là số lớn hơn 0
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Giá gốc (đ)
                        </label>
                        <input
                          type="number"
                          value={createForm.originalPrice || ""}
                          onChange={(e) =>
                            setCreateForm({
                              ...createForm,
                              originalPrice: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-700"
                          placeholder="399000"
                        />
                      </div>

                      {/* Đánh giá */}
                      <div className="md:col-span-2">
                        <h5 className="font-medium text-gray-700 mb-3">
                          Đánh giá
                        </h5>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Điểm đánh giá (1-5)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          step="0.1"
                          value={createForm.rating || ""}
                          onChange={(e) =>
                            setCreateForm({
                              ...createForm,
                              rating: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-700"
                          placeholder="4.8"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Số đánh giá
                        </label>
                        <input
                          type="number"
                          value={createForm.reviewCount || ""}
                          onChange={(e) =>
                            setCreateForm({
                              ...createForm,
                              reviewCount: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-700"
                          placeholder="128"
                        />
                      </div>

                      {/* Mô tả */}
                      <div className="md:col-span-2">
                        <h5 className="font-medium text-gray-700 mb-3">
                          Mô tả
                        </h5>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-700 mb-1">
                          Mô tả ngắn <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={2}
                          value={createForm.description}
                          onChange={(e) =>
                            setCreateForm({
                              ...createForm,
                              description: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-700 ${
                            !createForm.description.trim()
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="Mô tả ngắn về sản phẩm..."
                        />
                        {!createForm.description.trim() && (
                          <p className="text-xs text-red-500 mt-1">
                            Mô tả sản phẩm là bắt buộc
                          </p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-700 mb-1">
                          Mô tả chi tiết
                        </label>
                        <textarea
                          rows={4}
                          value={createForm.detailedDescription || ""}
                          onChange={(e) =>
                            setCreateForm({
                              ...createForm,
                              detailedDescription: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-700"
                          placeholder="Mô tả chi tiết về sản phẩm, đặc điểm nổi bật..."
                        />
                      </div>

                      {/* Thông số kỹ thuật */}
                      <div className="md:col-span-2">
                        <h5 className="font-medium text-gray-700 mb-3">
                          Thông số kỹ thuật
                        </h5>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Chất liệu
                        </label>
                        <input
                          value={createForm.material || ""}
                          onChange={(e) =>
                            setCreateForm({
                              ...createForm,
                              material: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-700"
                          placeholder="Thép không gỉ + Da thật"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Kích thước
                        </label>
                        <input
                          value={createForm.size || ""}
                          onChange={(e) =>
                            setCreateForm({
                              ...createForm,
                              size: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-700"
                          placeholder="42mm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Màu sắc
                        </label>
                        <input
                          value={createForm.color || ""}
                          onChange={(e) =>
                            setCreateForm({
                              ...createForm,
                              color: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-700"
                          placeholder="Đen, Trắng, Xanh"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Bảo hành
                        </label>
                        <input
                          value={createForm.warranty || ""}
                          onChange={(e) =>
                            setCreateForm({
                              ...createForm,
                              warranty: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-700"
                          placeholder="24 tháng"
                        />
                      </div>

                      {/* Badge và trạng thái */}
                      <div className="md:col-span-2">
                        <h5 className="font-medium text-gray-700 mb-3">
                          Hiển thị
                        </h5>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Badge
                        </label>
                        <select
                          value={createForm.badge || ""}
                          onChange={(e) =>
                            setCreateForm({
                              ...createForm,
                              badge: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-700"
                        >
                          <option value="">Không có</option>
                          <option value="Bán chạy">Bán chạy</option>
                          <option value="Mới">Mới</option>
                          <option value="Giảm giá">Giảm giá</option>
                          <option value="Hot">Hot</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Trạng thái
                        </label>
                        <select
                          value={createForm.status || "active"}
                          onChange={(e) =>
                            setCreateForm({
                              ...createForm,
                              status: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-700"
                        >
                          <option value="active">Đang bán</option>
                          <option value="inactive">Ngừng bán</option>
                          <option value="draft">Bản nháp</option>
                        </select>
                      </div>

                      {/* Ảnh sản phẩm */}
                      <div className="md:col-span-2">
                        <h5 className="font-medium text-gray-700 mb-3">
                          Ảnh sản phẩm
                        </h5>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-700 mb-1">
                          Chọn ảnh chính
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer text-gray-700"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Hỗ trợ: JPG, PNG, GIF. Kích thước tối đa: 5MB
                        </p>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-700 mb-1">
                          Chọn thêm ảnh (nhiều ảnh)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) =>
                            setFiles(Array.from(e.target.files || []))
                          }
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer text-gray-700"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Có thể chọn nhiều ảnh cùng lúc. Hỗ trợ: JPG, PNG, GIF.
                          Kích thước tối đa: 5MB mỗi ảnh
                        </p>
                        {files.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600 mb-2">
                              Đã chọn {files.length} ảnh:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {files.map((file, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs"
                                >
                                  {file.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-6 flex gap-3 items-center">
                      <div className="relative group">
                        <button
                          disabled={uploading || !isFormValid()}
                          onClick={createProduct}
                          className={`px-6 py-2 rounded-lg text-white font-medium ${
                            uploading || !isFormValid()
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-amber-600 hover:bg-amber-700"
                          }`}
                        >
                          {uploading ? "Đang tải..." : "Tạo sản phẩm"}
                        </button>

                        {/* Tooltip for disabled button */}
                        {!isFormValid() && !uploading && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                            Vui lòng điền đầy đủ các trường bắt buộc
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                          </div>
                        )}
                      </div>
                      <button
                        disabled={uploading}
                        onClick={() => setShowCreate(false)}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
