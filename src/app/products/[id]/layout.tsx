import type { Metadata } from "next";
import { generateProductMetadata } from "@/lib/metadata";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

// Generate metadata động cho product page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    // Fetch product data
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const response = await fetch(`${baseUrl}/products/${id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Product not found");
    }

    const data = await response.json();
    const product = data.product;

    // Generate metadata với ảnh tự động lấy từ product
    return generateProductMetadata(product, id);
  } catch (error) {
    // Fallback metadata nếu không fetch được
    return generateProductMetadata(
      {
        name: "Sản phẩm",
        description: "Xem chi tiết sản phẩm tại Aura Store",
      },
      id
    );
  }
}

export default function ProductDetailLayout({ children }: Props) {
  return <>{children}</>;
}
