"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string | null;
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
      onPostsChange();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Tạo bài viết thất bại";
      setErrorMsg(msg);
    } finally {
      setUploading(false);
    }
  }

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
        </>
      )}

      {showCreatePost && (
        <div className="mt-6 bg-white border rounded-xl p-6">
          <h4 className="font-semibold mb-6 text-gray-800">Thêm bài viết</h4>
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
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
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
                onChange={(e) => setPostFiles(Array.from(e.target.files || []))}
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
  );
}
