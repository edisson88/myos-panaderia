import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().optional().nullable(),
  unit_price: z.number().min(0, "El precio no puede ser negativo"),
  active: z.boolean().default(true).optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

export const CreateProductInputSchema = ProductSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type CreateProductInput = z.infer<typeof CreateProductInputSchema>;
export const UpdateProductInputSchema = CreateProductInputSchema.partial();
export type UpdateProductInput = z.infer<typeof UpdateProductInputSchema>;
