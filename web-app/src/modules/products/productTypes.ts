// Definición de tipos para el módulo de productos (Frontend)

export interface Product {
    id: string;
    name: string;
    description?: string;
    unit_price: number;
    category?: string;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export type CreateProductInput = Omit<Product, 'id' | 'created_at' | 'updated_at'>;

export type UpdateProductInput = Partial<CreateProductInput>;
