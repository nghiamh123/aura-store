"use client";

import { useState, useCallback } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  coverImage?: string | null;
  images?: string[];
  tags?: string[];
  status?: string;
  createdAt: string;
}

interface AdminBlogProps {
  posts: Post[];
  loadingPosts: boolean;
  errorMsg: string;
  setErrorMsg: React.Dispatch<React.SetStateAction<string>>;
  onPostsChange: () => void;
}

export default function AdminBlog({
  posts,
  loadingPosts,
  errorMsg,
  setErrorMsg,
  onPostsChange,
}: AdminBlogProps) {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPost, setEditingPost] = useState<number | null>(null);
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
  const [uploading, setUploading] = useState(false);

  const loadPostDetail = useCallback(
    async (postId: number) => {
      try {
        // Find post by ID from the posts list since backend expects slug
        const post = posts.find((p) => p.id === postId);
        if (!post) {
          throw new Error("Không tìm thấy bài viết");
        }

        // Populate form with existing post data
        setPostForm({
          title: post.title || "",
          slug: post.slug || "",
          excerpt: post.excerpt || "",
          content: post.content || "",
          coverImage: post.coverImage || "",
          tags: post.tags ? post.tags.join(", ") : "",
          status: post.status || "DRAFT",
        });

        // Clear file uploads since we're editing existing post
        setCoverFile(null);
        setPostFiles([]);
      } catch (e: unknown) {
        const msg =
          e instanceof Error ? e.message : "Không tải được chi tiết bài viết";
        setErrorMsg(msg);
      }
    },
    [posts, setErrorMsg]
  );

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
      handleFormSuccess();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Tạo bài viết thất bại";
      setErrorMsg(msg);
    } finally {
      setUploading(false);
    }
  }

  async function updatePost(postId: number) {
    try {
      setErrorMsg("");
      setUploading(true);

      // Upload cover image if provided
      let coverUrl = postForm.coverImage.trim() || "";
      if (coverFile) {
        coverUrl = await uploadToS3(coverFile);
      }

      // Upload gallery images if provided
      let galleryUrls: string[] = [];
      if (postFiles.length > 0) {
        galleryUrls = await uploadMultipleToS3(postFiles);
      }

      const body: {
        title: string;
        slug: string;
        excerpt: string;
        content: string;
        tags?: string[];
        status: string;
        coverImage?: string;
        images?: string[];
      } = {
        title: postForm.title.trim(),
        slug: postForm.slug.trim(),
        excerpt: postForm.excerpt.trim(),
        content: postForm.content.trim(),
        tags: postForm.tags
          ? postForm.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
        status: postForm.status,
      };

      // Only include image fields if they have new values
      if (coverFile) {
        body.coverImage = coverUrl;
      }
      if (postFiles.length > 0) {
        body.images = galleryUrls;
      }

      await apiFetch(`/posts/${postId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      handleFormSuccess();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Cập nhật bài viết thất bại";
      setErrorMsg(msg);
    } finally {
      setUploading(false);
    }
  }

  async function deletePost(id: number) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/posts/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Xóa bài viết thất bại");
      }

      onPostsChange();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Xóa bài viết thất bại";
      setErrorMsg(msg);
    }
  }

  const handleFormSuccess = () => {
    setShowCreatePost(false);
    setEditingPost(null);
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
    onPostsChange();
  };

  const handleFormCancel = () => {
    setShowCreatePost(false);
    setEditingPost(null);
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
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Quản lý blog</h3>
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
        <>
          {errorMsg && (
            <div className="mb-4 text-sm text-red-600">{errorMsg}</div>
          )}
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
                  <div className="mt-3 flex items-center justify-between">
                    <a
                      href={`/blog/${p.slug}`}
                      target="_blank"
                      className="text-amber-600 hover:text-amber-700 text-sm"
                    >
                      Xem
                    </a>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingPost(p.id);
                          void loadPostDetail(p.id);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Sửa bài viết"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deletePost(p.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Xóa bài viết"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {(showCreatePost || editingPost) && (
        <div className="mt-6 bg-white border rounded-xl p-6">
          <h4 className="font-semibold mb-6 text-gray-800">
            {editingPost ? `Sửa bài viết #${editingPost}` : "Thêm bài viết"}
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
              <label className="block text-sm text-gray-700 mb-1">Slug *</label>
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
              <h5 className="font-medium text-gray-700 mb-3">Ảnh bài viết</h5>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Ảnh cover
              </label>
              {editingPost && postForm.coverImage && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Ảnh hiện tại:</p>
                  <img
                    src={postForm.coverImage}
                    alt="Current cover"
                    className="h-20 w-32 rounded object-cover border"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer text-gray-700"
              />
              <p className="text-xs text-gray-500 mt-1">
                Hỗ trợ: JPG, PNG, GIF. Kích thước tối đa: 5MB
                {editingPost && " (Để trống nếu không muốn thay đổi ảnh)"}
              </p>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Ảnh gallery (nhiều ảnh)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setPostFiles(Array.from(e.target.files || []))}
                className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer text-gray-700"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3 items-center">
            <button
              disabled={uploading}
              onClick={() =>
                editingPost ? updatePost(editingPost) : createPost()
              }
              className="px-5 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
            >
              {uploading
                ? "Đang tải..."
                : editingPost
                ? "Cập nhật bài viết"
                : "Tạo bài viết"}
            </button>
            <button
              disabled={uploading}
              onClick={handleFormCancel}
              className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
