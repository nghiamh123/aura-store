"use client";

import { apiFetch } from "@/lib/api";

interface ProductFormProps {
  editingProduct: number | null;
  createForm: {
    name: string;
    description: string;
    price: string;
    category: string;
    image: string;
    images: string[];
    originalPrice: string;
    rating: string;
    reviewCount: string;
    detailedDescription: string;
    material: string;
    size: string;
    color: string;
    warranty: string;
    badge: string;
    status: string;
  };
  setCreateForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
      price: string;
      category: string;
      image: string;
      images: string[];
      originalPrice: string;
      rating: string;
      reviewCount: string;
      detailedDescription: string;
      material: string;
      size: string;
      color: string;
      warranty: string;
      badge: string;
      status: string;
    }>
  >;
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  uploading: boolean;
  setUploading: React.Dispatch<React.SetStateAction<boolean>>;
  errorMsg: string;
  setErrorMsg: React.Dispatch<React.SetStateAction<string>>;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({
  editingProduct,
  createForm,
  setCreateForm,
  file,
  setFile,
  files,
  setFiles,
  uploading,
  setUploading,
  errorMsg,
  setErrorMsg,
  onSuccess,
  onCancel,
}: ProductFormProps) {
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
      onSuccess();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Tạo sản phẩm thất bại";
      setErrorMsg(msg);
    } finally {
      setUploading(false);
    }
  }

  async function updateProduct(productId: number) {
    try {
      setErrorMsg("");
      setUploading(true);

      let imageUrl = createForm.image.trim() || "";
      let imageUrls: string[] = [];

      // Upload single image if provided
      if (file) {
        imageUrl = await uploadToS3(file);
      }

      // Upload multiple images if provided
      if (files.length > 0) {
        imageUrls = await uploadMultipleToS3(files);
      }

      const body: {
        name: string;
        description: string;
        price: number;
        category: string;
        originalPrice?: number;
        rating?: number;
        reviewCount?: number;
        detailedDescription?: string;
        material?: string;
        size?: string;
        color?: string;
        warranty?: string;
        badge?: string;
        status: string;
        image?: string;
        images?: string[];
      } = {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        price: Number(createForm.price),
        category: createForm.category.trim(),
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

      // Only include image fields if they have new values
      if (file) {
        body.image = imageUrl;
      }
      if (files.length > 0) {
        body.images = imageUrls;
      }

      await apiFetch(`/products/${productId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      onSuccess();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Cập nhật sản phẩm thất bại";
      setErrorMsg(msg);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-6 bg-white border rounded-xl p-6">
      <h4 className="font-semibold mb-6 text-gray-800">
        {editingProduct ? `Sửa sản phẩm #${editingProduct}` : "Thêm sản phẩm"}
      </h4>

      {errorMsg && <div className="mb-4 text-sm text-red-600">{errorMsg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Thông tin cơ bản */}
        <div className="md:col-span-2">
          <h5 className="font-medium text-gray-700 mb-3">Thông tin cơ bản</h5>
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
              !createForm.name.trim() ? "border-red-300" : "border-gray-300"
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
              !createForm.category.trim() ? "border-red-300" : "border-gray-300"
            }`}
          >
            <option value="">Chọn danh mục</option>
            <option value="watches">Đồng hồ</option>
            <option value="jewelry">Trang sức</option>
            <option value="bags">Túi xách</option>
            <option value="accessories">Phụ kiện</option>
          </select>
          {!createForm.category.trim() && (
            <p className="text-xs text-red-500 mt-1">Danh mục là bắt buộc</p>
          )}
        </div>

        {/* Giá cả */}
        <div className="md:col-span-2">
          <h5 className="font-medium text-gray-700 mb-3">Giá cả</h5>
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
          <h5 className="font-medium text-gray-700 mb-3">Đánh giá</h5>
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
          <h5 className="font-medium text-gray-700 mb-3">Mô tả</h5>
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
          <h5 className="font-medium text-gray-700 mb-3">Thông số kỹ thuật</h5>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Chất liệu</label>
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
          <label className="block text-sm text-gray-700 mb-1">Kích thước</label>
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
          <label className="block text-sm text-gray-700 mb-1">Màu sắc</label>
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
          <label className="block text-sm text-gray-700 mb-1">Bảo hành</label>
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
          <h5 className="font-medium text-gray-700 mb-3">Hiển thị</h5>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Badge</label>
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
          <label className="block text-sm text-gray-700 mb-1">Trạng thái</label>
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
          <h5 className="font-medium text-gray-700 mb-3">Ảnh sản phẩm</h5>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-700 mb-1">
            Chọn ảnh chính
          </label>
          {editingProduct && createForm.image && (
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">Ảnh hiện tại:</p>
              <img
                src={createForm.image}
                alt="Current product"
                className="h-20 w-20 rounded object-cover border"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer text-gray-700"
          />
          <p className="text-xs text-gray-500 mt-1">
            Hỗ trợ: JPG, PNG, GIF. Kích thước tối đa: 5MB
            {editingProduct && " (Để trống nếu không muốn thay đổi ảnh)"}
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-gray-700 mb-1">
            Chọn thêm ảnh (nhiều ảnh)
          </label>
          {editingProduct &&
            createForm.images &&
            createForm.images.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">
                  Ảnh gallery hiện tại:
                </p>
                <div className="flex flex-wrap gap-2">
                  {createForm.images.map((imageUrl: string, index: number) => (
                    <img
                      key={index}
                      src={imageUrl}
                      alt={`Gallery ${index + 1}`}
                      className="h-16 w-16 rounded object-cover border"
                    />
                  ))}
                </div>
              </div>
            )}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer text-gray-700"
          />
          <p className="text-xs text-gray-500 mt-1">
            Có thể chọn nhiều ảnh cùng lúc. Hỗ trợ: JPG, PNG, GIF. Kích thước
            tối đa: 5MB mỗi ảnh
            {editingProduct &&
              " (Để trống nếu không muốn thay đổi ảnh gallery)"}
          </p>
          {files.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">
                Đã chọn {files.length} ảnh mới:
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
            onClick={() =>
              editingProduct ? updateProduct(editingProduct) : createProduct()
            }
            className={`px-6 py-2 rounded-lg text-white font-medium ${
              uploading || !isFormValid()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {uploading
              ? "Đang tải..."
              : editingProduct
              ? "Cập nhật sản phẩm"
              : "Tạo sản phẩm"}
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
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}
