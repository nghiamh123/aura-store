"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import ProductForm from "./ProductForm";

interface Product {
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
}

interface AdminProductsProps {
  products: Product[];
  loadingProducts: boolean;
  errorMsg: string;
  setErrorMsg: React.Dispatch<React.SetStateAction<string>>;
  onProductsChange: () => void;
}

export default function AdminProducts({
  products,
  loadingProducts,
  errorMsg,
  setErrorMsg,
  onProductsChange,
}: AdminProductsProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    images: [] as string[],
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

  const loadProductDetail = useCallback(
    async (productId: number) => {
      try {
        const data = await apiFetch<{ product: Product }>(
          `/products/${productId}`
        );
        const product = data.product;

        // Populate form with existing product data
        setCreateForm({
          name: product.name || "",
          description: product.description || "",
          price: product.price?.toString() || "",
          category: product.category || "",
          image: product.image || "",
          images: product.images || [],
          originalPrice: product.originalPrice?.toString() || "",
          rating: product.rating?.toString() || "",
          reviewCount: product.reviewCount?.toString() || "",
          detailedDescription: product.detailedDescription || "",
          material: product.material || "",
          size: product.size || "",
          color: product.color || "",
          warranty: product.warranty || "",
          badge: product.badge || "",
          status: product.status || "active",
        });

        // Clear file uploads since we're editing existing product
        setFile(null);
        setFiles([]);
      } catch (e: unknown) {
        const msg =
          e instanceof Error ? e.message : "Không tải được chi tiết sản phẩm";
        setErrorMsg(msg);
      }
    },
    [setErrorMsg]
  );

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

      onProductsChange();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Xóa sản phẩm thất bại";
      setErrorMsg(msg);
    }
  }

  const handleFormSuccess = () => {
    setShowCreate(false);
    setEditingProduct(null);
    setCreateForm({
      name: "",
      description: "",
      price: "",
      category: "",
      image: "",
      images: [],
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
    onProductsChange();
  };

  const handleFormCancel = () => {
    setShowCreate(false);
    setEditingProduct(null);
    setCreateForm({
      name: "",
      description: "",
      price: "",
      category: "",
      image: "",
      images: [],
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
  };

  return (
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

      {errorMsg && <div className="mb-4 text-sm text-red-600">{errorMsg}</div>}

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
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(p.id);
                          void loadProductDetail(p.id);
                        }}
                        className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-1" /> Sửa
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="text-red-600 hover:text-red-800 inline-flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500" colSpan={6}>
                    Chưa có sản phẩm
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {(showCreate || editingProduct) && (
        <ProductForm
          editingProduct={editingProduct}
          createForm={createForm}
          setCreateForm={setCreateForm}
          file={file}
          setFile={setFile}
          files={files}
          setFiles={setFiles}
          uploading={uploading}
          setUploading={setUploading}
          errorMsg={errorMsg}
          setErrorMsg={setErrorMsg}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}
