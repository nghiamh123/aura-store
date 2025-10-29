import type { Metadata } from "next";
import { generateBlogMetadata } from "@/lib/metadata";

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

// Generate metadata động cho blog post page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    // Fetch post data
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const response = await fetch(`${baseUrl}/posts/${slug}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Post not found");
    }

    const data = await response.json();
    const post = data.post;

    // Generate metadata với ảnh tự động lấy từ post
    return generateBlogMetadata(post, slug);
  } catch {
    // Fallback metadata nếu không fetch được
    return generateBlogMetadata(
      {
        title: "Bài viết",
        excerpt: "Xem bài viết trên Aura Blog",
      },
      slug
    );
  }
}

export default function BlogDetailLayout({ children }: Props) {
  return <>{children}</>;
}
