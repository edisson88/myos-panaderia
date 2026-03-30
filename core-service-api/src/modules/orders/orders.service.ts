import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  OrdersRepository,
  HasuraOrderList,
  HasuraOrderDetail,
} from './orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async findAll(
    filters?: Record<string, unknown>,
  ): Promise<HasuraOrderList[]> {
    return this.ordersRepository.findAll(filters);
  }

  async findById(id: string): Promise<HasuraOrderDetail> {
    const order = await this.ordersRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Pedido con id ${id} no encontrado`);
    }
    return order;
  }

  async create(dto: CreateOrderDto): Promise<HasuraOrderDetail> {
    const items = dto.items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: parseFloat((item.quantity * item.unitPrice).toFixed(2)),
    }));

    const total = parseFloat(
      items.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2),
    );

    return this.ordersRepository.create({
      customer_id: dto.customerId,
      delivery_date: dto.deliveryDate ?? null,
      notes: dto.notes ?? null,
      status: OrderStatus.DRAFT,
      total,
      order_code: this.generateOrderCode(),
      items,
    });
  }

  async update(id: string, dto: UpdateOrderDto): Promise<HasuraOrderDetail> {
    const order = await this.findById(id);
    if (order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException(
        'Solo se pueden modificar pedidos en estado BORRADOR (draft)',
      );
    }

    // Si vienen items, reemplazarlos y recalcular el total
    if (dto.items && dto.items.length > 0) {
      const items = dto.items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: parseFloat((item.quantity * item.unitPrice).toFixed(2)),
      }));

      const total = parseFloat(
        items.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2),
      );

      await this.ordersRepository.replaceItems(id, items, total);
    }

    // Si hay campos del pedido (notes, deliveryDate) también actualizarlos
    const hasOrderFields =
      dto.notes !== undefined || dto.deliveryDate !== undefined;

    if (hasOrderFields) {
      await this.ordersRepository.update(id, dto);
    }

    return this.findById(id);
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
  ): Promise<HasuraOrderDetail> {
    await this.findById(id);
    return this.ordersRepository.updateStatus(id, dto.status);
  }

  async remove(id: string): Promise<{ id: string }> {
    const order = await this.findById(id);
    if (order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException(
        'Solo se pueden eliminar pedidos en estado BORRADOR (draft)',
      );
    }
    return this.ordersRepository.remove(id);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private generateOrderCode(): string {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase();
    return `PED-${datePart}-${randomPart}`;
  }
}
