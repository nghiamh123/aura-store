import { z } from "zod";

export const productCreateSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  category: z.string().min(2),
  badge: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().int().min(0).optional(),
  image: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

export const adminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
