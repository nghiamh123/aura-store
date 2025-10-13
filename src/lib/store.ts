export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  badge?: string;
  rating?: number;
  reviews?: number;
  image?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
};

export type AdminUser = {
  username: string;
  passwordHash: string; // plain for demo only; replace with hash in real app
};

export type CartItem = { productId: number; quantity: number };
export type Cart = { userId: string; items: CartItem[] };
export type Wishlist = { userId: string; productIds: number[] };
export type OrderItem = { productId: number; quantity: number; price: number };
export type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
};

function now() {
  return new Date().toISOString();
}

function uid(prefix = "ORD") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

class InMemoryStore {
  products: Product[] = [];
  adminUsers: AdminUser[] = [
    { username: "admin", passwordHash: "admin123" }, // DEMO ONLY
  ];
  carts: Record<string, Cart> = {};
  wishlists: Record<string, Wishlist> = {};
  orders: Order[] = [];
  lastProductId = 0;

  constructor() {
    const seed: Array<Omit<Product, "id" | "createdAt" | "updatedAt">> = [
      {
        name: "Đồng hồ nam sang trọng",
        description: "Đồng hồ nam sang trọng với thiết kế hiện đại.",
        price: 299000,
        originalPrice: 399000,
        category: "watches",
        badge: "Bán chạy",
        rating: 4.8,
        reviews: 128,
        image: "/api/placeholder/300/300",
      },
      {
        name: "Túi xách nữ thời trang",
        description: "Túi xách nữ thời trang, phù hợp giới trẻ.",
        price: 199000,
        originalPrice: 299000,
        category: "bags",
        badge: "Mới",
        rating: 4.6,
        reviews: 95,
        image: "/api/placeholder/300/300",
      },
      {
        name: "Vòng tay bạc tối giản",
        description: "Vòng tay chất liệu bạc 925 thiết kế tối giản, dễ phối đồ.",
        price: 89000,
        originalPrice: 149000,
        category: "jewelry",
        badge: "Giảm giá",
        rating: 4.9,
        reviews: 203,
        image: "/api/placeholder/300/300",
      },
      {
        name: "Kính mát khung kim loại",
        description: "Kính mát thời trang, chống UV400, khung kim loại bền chắc.",
        price: 159000,
        originalPrice: 229000,
        category: "accessories",
        badge: "Hot",
        rating: 4.7,
        reviews: 76,
        image: "/api/placeholder/300/300",
      },
      {
        name: "Nhẫn bạc khắc tên",
        description: "Nhẫn bạc 925 có thể khắc tên theo yêu cầu, quà tặng ý nghĩa.",
        price: 129000,
        originalPrice: 199000,
        category: "jewelry",
        rating: 4.5,
        reviews: 87,
        image: "/api/placeholder/300/300",
      },
      {
        name: "Ví da nam tối giản",
        description: "Ví da PU chống xước, nhiều ngăn thẻ, phong cách tối giản.",
        price: 179000,
        originalPrice: 249000,
        category: "accessories",
        badge: "Mới",
        rating: 4.4,
        reviews: 156,
        image: "/api/placeholder/300/300",
      },
      {
        name: "Đồng hồ nữ dây da",
        description: "Đồng hồ nữ dây da trẻ trung, mặt kính chống trầy.",
        price: 249000,
        originalPrice: 349000,
        category: "watches",
        badge: "Bán chạy",
        rating: 4.8,
        reviews: 92,
        image: "/api/placeholder/300/300",
      },
      {
        name: "Túi đeo chéo unisex",
        description: "Túi đeo chéo vải canvas bền, phù hợp đi học, đi chơi.",
        price: 149000,
        originalPrice: 199000,
        category: "bags",
        badge: "Hot",
        rating: 4.6,
        reviews: 134,
        image: "/api/placeholder/300/300",
      },
      {
        name: "Dây chuyền trái tim",
        description: "Dây chuyền mặt trái tim mạ vàng, phong cách ngọt ngào.",
        price: 99000,
        originalPrice: 159000,
        category: "jewelry",
        rating: 4.7,
        reviews: 178,
        image: "/api/placeholder/300/300",
      },
      {
        name: "Mũ lưỡi trai basic",
        description: "Mũ lưỡi trai cotton thoáng khí, nhiều màu trẻ trung.",
        price: 79000,
        originalPrice: 129000,
        category: "accessories",
        rating: 4.3,
        reviews: 64,
        image: "/api/placeholder/300/300",
      },
      {
        name: "Bông tai ngọc trai",
        description: "Bông tai ngọc trai giả sang trọng, nhẹ và êm tai.",
        price: 59000,
        originalPrice: 99000,
        category: "jewelry",
        rating: 4.6,
        reviews: 112,
        image: "/api/placeholder/300/300",
      },
      {
        name: "Thắt lưng da khóa kim",
        description: "Thắt lưng da PU mềm, khóa kim cổ điển, dễ phối trang phục.",
        price: 119000,
        originalPrice: 169000,
        category: "accessories",
        rating: 4.5,
        reviews: 88,
        image: "/api/placeholder/300/300",
      }
    ];
    seed.forEach((p) => this.createProduct(p));
  }

  // Products
  createProduct(p: Omit<Product, "id" | "createdAt" | "updatedAt">): Product {
    const id = ++this.lastProductId;
    const product: Product = {
      id,
      createdAt: now(),
      updatedAt: now(),
      images: p.images ?? (p.image ? [p.image] : []),
      ...p,
    };
    this.products.push(product);
    return product;
  }

  listProducts(): Product[] {
    return this.products.slice().sort((a, b) => b.id - a.id);
  }

  getProduct(id: number): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  updateProduct(id: number, update: Partial<Omit<Product, "id" | "createdAt">>): Product | undefined {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    const existing = this.products[idx];
    const updated: Product = { ...existing, ...update, updatedAt: now() };
    this.products[idx] = updated;
    return updated;
  }

  deleteProduct(id: number): boolean {
    const before = this.products.length;
    this.products = this.products.filter((p) => p.id !== id);
    return this.products.length < before;
  }

  // Admin
  findAdmin(username: string): AdminUser | undefined {
    return this.adminUsers.find((u) => u.username === username);
  }

  // Cart
  getCart(userId: string): Cart {
    if (!this.carts[userId]) this.carts[userId] = { userId, items: [] };
    return this.carts[userId];
  }

  setCart(userId: string, cart: Cart) {
    this.carts[userId] = cart;
  }

  // Wishlist
  getWishlist(userId: string): Wishlist {
    if (!this.wishlists[userId]) this.wishlists[userId] = { userId, productIds: [] };
    return this.wishlists[userId];
  }

  setWishlist(userId: string, wl: Wishlist) {
    this.wishlists[userId] = wl;
  }

  // Orders
  createOrder(userId: string, items: OrderItem[]): Order {
    const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const order: Order = {
      id: uid("AURA"),
      userId,
      items,
      total,
      status: "confirmed",
      createdAt: now(),
    };
    this.orders.push(order);
    return order;
  }

  listOrders(userId?: string): Order[] {
    return userId ? this.orders.filter((o) => o.userId === userId) : this.orders;
  }
}

export const store = new InMemoryStore();
