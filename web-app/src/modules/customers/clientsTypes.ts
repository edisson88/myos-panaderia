// Definición de tipos para el módulo de clientes (Frontend)

export interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    dni: string | null;
    active: boolean;
    label: string | null;
    user_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateClientInput {
    name: string;
    email: string;
    phone: string;
    address: string;
    dni?: string;
    active?: boolean;
    label?: string;
    user_id?: string;
}

export type UpdateClientInput = Partial<CreateClientInput>;
