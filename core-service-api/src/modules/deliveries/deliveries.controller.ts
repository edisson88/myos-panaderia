import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('deliveries')
@UseGuards(JwtAuthGuard)
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  /** GET /api/deliveries */
  @Get()
  findAll() {
    return this.deliveriesService.findAll();
  }

  /** GET /api/deliveries/:id */
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.deliveriesService.findById(id);
  }

  /** PATCH /api/deliveries/:id/status */
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryStatusDto,
  ) {
    return this.deliveriesService.updateStatus(id, dto);
  }
}
