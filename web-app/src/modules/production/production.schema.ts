import { z } from "zod";

export const ProductionStatusEnum = z.enum(["draft", "in_progress", "completed", "cancelled"]);
export type ProductionStatus = z.infer<typeof ProductionStatusEnum>;

export const ProductionItemSchema = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().uuid(),
  product_name: z.string().optional(),
  quantity_planned: z.number().min(1, "La cantidad planeada debe ser al menos 1"),
  quantity_produced: z.number().min(0).default(0),
});

export type ProductionItem = z.infer<typeof ProductionItemSchema>;

export const ProductionSchema = z.object({
  id: z.string().uuid().optional(),
  date: z.string().datetime(),
  status: ProductionStatusEnum.default("draft"),
  notes: z.string().optional(),
  items: z.array(ProductionItemSchema).min(1, "Debe agregar al menos un producto a producir"),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type ProductionOrder = z.infer<typeof ProductionSchema>;

export const CreateProductionInputSchema = ProductionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type CreateProductionInput = z.infer<typeof CreateProductionInputSchema>;
export type UpdateProductionInput = Partial<CreateProductionInput>;
