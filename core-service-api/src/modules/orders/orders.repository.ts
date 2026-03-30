import { Injectable } from '@nestjs/common';
import { HasuraService } from '../../shared/hasura/hasura.service';
import {
  GET_ALL_ORDERS,
  GET_ORDER_BY_ID,
  INSERT_ORDER_WITH_ITEMS,
  UPDATE_ORDER,
  UPDATE_ORDER_STATUS,
  DELETE_ORDER_WITH_ITEMS,
  REPLACE_ORDER_ITEMS,
} from './orders.queries';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from './enums/order-status.enum';

// ── Interfaces de respuesta Hasura ────────────────────────────────────────────

export interface HasuraOrderList {
  id: string;
  order_code: string;
  status: string;
  total: number;
  delivery_date: string | null;
  created_at: string;
  updated_at: string;
  customer_id: string;
  customer: { name: string } | null;
}

export interface HasuraOrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  products: { name: string }[] | null;
}

export interface HasuraOrderDetail {
  id: string;
  order_code: string;
  status: string;
  total: number;
  delivery_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer_id: string;
  customer: { id: string; name: string } | null;
  order_items: HasuraOrderItem[];
}

export interface OrderItemInsertData {
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface OrderInsertData {
  customer_id: string;
  delivery_date: string | null;
  notes: string | null;
  status: OrderStatus;
  total: number;
  order_code: string;
  items: OrderItemInsertData[];
}

// ── Tipos de respuesta GraphQL ────────────────────────────────────────────────

interface GetAllOrdersResponse {
  orders: HasuraOrderList[];
}

interface GetOrderByIdResponse {
  orders_by_pk: HasuraOrderDetail | null;
}

interface InsertOrderResponse {
  insert_orders_one: HasuraOrderDetail;
}

interface UpdateOrderResponse {
  update_orders_by_pk: HasuraOrderDetail;
}

interface UpdateOrderStatusResponse {
  update_orders_by_pk: HasuraOrderDetail;
}

interface DeleteOrderResponse {
  delete_order_items: { affected_rows: number };
  delete_orders_by_pk: { id: string };
}

interface ReplaceOrderItemsResponse {
  delete_order_items: { affected_rows: number };
  insert_order_items: { returning: Omit<HasuraOrderItem, 'product'>[] };
  update_orders_by_pk: { id: string; total: number; updated_at: string };
}

// ── Repository ────────────────────────────────────────────────────────────────

@Injectable()
export class OrdersRepository {
  constructor(private readonly hasuraService: HasuraService) {}

  async findAll(filters?: Record<string, unknown>): Promise<HasuraOrderList[]> {
    const where = this.buildWhereClause(filters);
    const result = await this.hasuraService.query<GetAllOrdersResponse>(
      GET_ALL_ORDERS,
      { where },
    );
    return result.orders;
  }

  async findById(id: string): Promise<HasuraOrderDetail | null> {
    const result = await this.hasuraService.query<GetOrderByIdResponse>(
      GET_ORDER_BY_ID,
      { id },
    );
    return result.orders_by_pk ?? null;
  }

  async create(data: OrderInsertData): Promise<HasuraOrderDetail> {
    const result = await this.hasuraService.query<InsertOrderResponse>(
      INSERT_ORDER_WITH_ITEMS,
      {
        object: {
          customer_id: data.customer_id,
          delivery_date: data.delivery_date,
          status: data.status,
          total: data.total,
          notes: data.notes,
          order_code: data.order_code,
          order_items: { data: data.items },
        },
      },
    );
    return result.insert_orders_one;
  }

  async update(id: string, dto: UpdateOrderDto): Promise<HasuraOrderDetail> {
    const set: Record<string, unknown> = {};
    if (dto.notes !== undefined) set.notes = dto.notes;
    if (dto.deliveryDate !== undefined) set.delivery_date = dto.deliveryDate;

    const result = await this.hasuraService.query<UpdateOrderResponse>(
      UPDATE_ORDER,
      { id, set },
    );
    return result.update_orders_by_pk;
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
  ): Promise<HasuraOrderDetail> {
    const result = await this.hasuraService.query<UpdateOrderStatusResponse>(
      UPDATE_ORDER_STATUS,
      { id, status },
    );
    return result.update_orders_by_pk;
  }

  async replaceItems(
    orderId: string,
    items: OrderItemInsertData[],
    total: number,
  ): Promise<{ id: string; total: number; updated_at: string }> {
    const itemsWithOrderId = items.map((item) => ({
      ...item,
      order_id: orderId,
    }));
    const result = await this.hasuraService.query<ReplaceOrderItemsResponse>(
      REPLACE_ORDER_ITEMS,
      { orderId, items: itemsWithOrderId, total },
    );
    return result.update_orders_by_pk;
  }

  async remove(id: string): Promise<{ id: string }> {
    const result = await this.hasuraService.query<DeleteOrderResponse>(
      DELETE_ORDER_WITH_ITEMS,
      { id },
    );
    return result.delete_orders_by_pk;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private buildWhereClause(
    filters?: Record<string, unknown>,
  ): Record<string, unknown> {
    if (!filters) return {};

    const where: Record<string, unknown> = {};

    if (filters['status']) {
      where['status'] = { _eq: filters['status'] };
    }

    if (filters['dateFrom'] || filters['dateTo']) {
      const dateFilter: Record<string, string> = {};
      if (filters['dateFrom'])
        dateFilter['_gte'] = filters['dateFrom'] as string;
      if (filters['dateTo']) dateFilter['_lte'] = filters['dateTo'] as string;
      where['created_at'] = dateFilter;
    }

    if (filters['search']) {
      where['_or'] = [
        { order_code: { _ilike: `%${filters['search']}%` } },
        { customer: { name: { _ilike: `%${filters['search']}%` } } },
      ];
    }

    return where;
  }
}
