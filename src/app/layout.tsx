import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aura - Phụ kiện thời trang nam nữ giá rẻ",
  description: "Aura - Cửa hàng phụ kiện thời trang nam nữ với giá cả phải chăng, phù hợp cho học sinh sinh viên. Đồng hồ, túi xách, trang sức và nhiều hơn nữa.",
  keywords: "phụ kiện thời trang, đồng hồ, túi xách, trang sức, học sinh sinh viên, giá rẻ",
  authors: [{ name: "Aura Store" }],
  openGraph: {
    title: "Aura - Phụ kiện thời trang nam nữ giá rẻ",
    description: "Cửa hàng phụ kiện thời trang với giá cả phải chăng, phù hợp cho học sinh sinh viên",
    type: "website",
    locale: "vi_VN",
  },
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
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
