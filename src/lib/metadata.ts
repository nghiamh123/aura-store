import type { Metadata } from "next";

interface GenerateMetadataOptions {
  title?: string;
  description?: string;
  image?: string | null;
  url?: string;
  type?: "website" | "article" | "product";
  siteName?: string;
}

/**
 * Tự động lấy ảnh đầu tiên từ mảng images hoặc image field
 */
export function getFirstImage(
  images?: string[] | null,
  singleImage?: string | null,
  fallback?: string
): string | undefined {
  // Ưu tiên lấy từ mảng images
  if (images && images.length > 0) {
    return images[0];
  }
  
  // Nếu không có, lấy từ single image
  if (singleImage) {
    return singleImage;
  }
  
  // Fallback về ảnh mặc định nếu có
  return fallback;
}

/**
 * Generate metadata với Open Graph image
 * Nếu không có image được truyền, sẽ tự động lấy từ images array hoặc single image
 */
export function generateMetadata({
  title = "Aura - Phụ kiện thời trang nam nữ giá rẻ",
  description = "Cửa hàng phụ kiện thời trang với giá cả phải chăng, phù hợp cho học sinh sinh viên",
  image,
  url,
  type = "website",
  siteName = "Aura Store",
}: GenerateMetadataOptions): Metadata {
  // Default image nếu không có
  const defaultImage = "/og-image-default.jpg"; // Có thể tạo một ảnh mặc định
  
  // Sử dụng image được truyền hoặc fallback về default
  const ogImage = image || defaultImage;
  
  // Đảm bảo URL là absolute
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
    (typeof process.env.NEXT_PUBLIC_API_URL === 'string' 
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
      : undefined) || 
    "https://aura.com";
  
  const absoluteImageUrl = ogImage.startsWith("http")
    ? ogImage
    : ogImage.startsWith("/")
    ? `${siteUrl}${ogImage}`
    : `${siteUrl}/${ogImage}`;
    
  const absoluteUrl = url
    ? url.startsWith("http")
      ? url
      : `${siteUrl}${url.startsWith("/") ? url : `/${url}`}`
    : siteUrl;

  // OpenGraph chỉ hỗ trợ "website" hoặc "article", không có "product"
  const ogType = type === "product" ? "website" : type;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: ogType,
      url: absoluteUrl,
      siteName,
      locale: "vi_VN",
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteImageUrl],
    },
  };
}

/**
 * Generate metadata cho product page
 */
export function generateProductMetadata(
  product: {
    name: string;
    description: string;
    image?: string | null;
    images?: string[] | null;
    price?: number;
  },
  productId?: string | number
): Metadata {
  const title = `${product.name} | Aura Store`;
  const description = product.description || `Mua ${product.name} tại Aura Store - Phụ kiện thời trang giá rẻ`;
  const image = getFirstImage(
    product.images,
    product.image,
    "/og-image-default.jpg"
  );
  const url = productId ? `/products/${productId}` : undefined;

  return generateMetadata({
    title,
    description,
    image,
    url,
    type: "product",
  });
}

/**
 * Generate metadata cho blog post
 */
export function generateBlogMetadata(
  post: {
    title: string;
    excerpt: string;
    coverImage?: string | null;
    images?: string[] | null;
  },
  slug?: string
): Metadata {
  const title = `${post.title} | Aura Blog`;
  const description = post.excerpt || `${post.title} - Bài viết trên Aura Blog`;
  const image = getFirstImage(
    post.images,
    post.coverImage,
    "/og-image-default.jpg"
  );
  const url = slug ? `/blog/${slug}` : undefined;

  return generateMetadata({
    title,
    description,
    image,
    url,
    type: "article",
  });
}

