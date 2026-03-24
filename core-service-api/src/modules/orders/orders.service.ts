import { Injectable } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async findAll(filters?: Record<string, unknown>): Promise<object> {
    // TODO: validate and forward filters, transform Hasura response to OrderListRow[]
    await this.ordersRepository.findAll(filters);
    return { message: 'Orders list — TODO', filters };
  }

  async findById(id: string): Promise<object> {
    // TODO: fetch order detail and transform to OrderDetail shape
    await this.ordersRepository.findById(id);
    return { message: 'Order detail — TODO', id };
  }

  async create(dto: CreateOrderDto): Promise<object> {
    // TODO: validate business rules (delivery date > order date, etc.) then insert
    return { message: 'Create order — TODO', customerId: dto.customerId };
  }

  async update(id: string, dto: Partial<CreateOrderDto>): Promise<object> {
    // TODO: only allow updates if order is in DRAFT status
    await this.ordersRepository.update(id, dto as Record<string, unknown>);
    return { message: 'Update order — TODO', id };
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
  ): Promise<object> {
    // TODO: enforce valid status transitions before updating
    await this.ordersRepository.updateStatus(id, dto.status);
    return { message: 'Update order status — TODO', id, status: dto.status };
  }
}
