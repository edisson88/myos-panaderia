import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /** GET /api/orders?status=confirmed&dateFrom=2026-01-01 */
  @Get()
  findAll(@Query() filters: Record<string, unknown>) {
    return this.ordersService.findAll(filters);
  }

  /** GET /api/orders/:id */
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  /** POST /api/orders */
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  /** PATCH /api/orders/:id */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateOrderDto>,
  ) {
    return this.ordersService.update(id, dto);
  }

  /** PATCH /api/orders/:id/status */
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto);
  }
}
