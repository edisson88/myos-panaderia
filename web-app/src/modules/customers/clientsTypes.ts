// Definición de tipos para el módulo de clientes (Frontend)

export interface Client {
    id: string;
    name: string;
    dni?: string;
    address?: string;
    phone?: string;
    email?: string;
    active: boolean;
    tags?: string[];
    created_at: string;
    updated_at: string;
}

export type CreateClientInput = Omit<Client, 'id' | 'created_at' | 'updated_at'>;

export type UpdateClientInput = Partial<CreateClientInput>;
