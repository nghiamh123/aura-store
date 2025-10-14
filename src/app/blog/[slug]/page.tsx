'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  images?: string[];
  tags?: string[];
  createdAt: string;
};

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/posts/${slug}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
        const data = await res.json();
        setPost(data.post);
      } catch (e) {
        setError('Không thể tải bài viết');
      } finally {
        setLoading(false);
      }
    };
    if (slug) void load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="aspect-video bg-gray-200 rounded animate-pulse mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <p className="text-red-600 mb-6">{error || 'Bài viết không tồn tại'}</p>
          <Link href="/blog" className="text-purple-600 hover:text-purple-700 inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/blog" className="text-purple-600 hover:text-purple-700 inline-flex items-center mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại Blog
          </Link>
          <h1 className="text-3xl lg:text-4xl font-playfair font-bold text-gray-900">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
            <Calendar className="h-4 w-4" />
            <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
            {post.tags && post.tags.length > 0 && (
              <span className="hidden sm:inline">•</span>
            )}
            <div className="flex gap-2 flex-wrap">
              {(post.tags || []).map((t) => (
                <span key={t} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">#{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {post.coverImage && (
          <div className="mb-8">
            <img src={post.coverImage} alt={post.title} className="w-full rounded-xl object-cover" />
          </div>
        )}

        {post.images && post.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {post.images.map((img, idx) => (
              <img key={idx} src={img} alt={`${post.title} ${idx + 1}`} className="w-full rounded-lg object-cover" />
            ))}
          </div>
        )}

        <article className="prose prose-lg max-w-none prose-headings:font-playfair prose-a:text-purple-600 text-gray-700">
          {/* If content is HTML, you can switch to dangerouslySetInnerHTML */}
          {post.content.split('\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>
      </div>
    </div>
  );
}


