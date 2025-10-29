import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { generateMetadata as generateBaseMetadata } from "@/lib/metadata";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

// Generate base metadata với og:image
const baseMetadata = generateBaseMetadata({
  title: "Aura - Phụ kiện thời trang nam nữ giá rẻ",
  description:
    "Aura - Cửa hàng phụ kiện thời trang nam nữ với giá cả phải chăng, phù hợp cho học sinh sinh viên. Đồng hồ, túi xách, trang sức và nhiều hơn nữa.",
  image: "/og-image-default.jpg", // Ảnh mặc định - có thể thay bằng logo hoặc ảnh banner
});

export const metadata: Metadata = {
  ...baseMetadata,
  keywords:
    "phụ kiện thời trang, đồng hồ, túi xách, trang sức, học sinh sinh viên, giá rẻ",
  authors: [{ name: "Aura Store" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-gray-50`}
      >
        <CartProvider>
          <WishlistProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
