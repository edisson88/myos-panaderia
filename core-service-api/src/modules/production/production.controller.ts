import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ProductionService } from './production.service';
import { UpdateProductionStatusDto } from './dto/update-production-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('production')
@UseGuards(JwtAuthGuard)
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  /** GET /api/production */
  @Get()
  findAll() {
    return this.productionService.findAll();
  }

  /** GET /api/production/:id */
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.productionService.findById(id);
  }

  /** PATCH /api/production/:id/status */
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateProductionStatusDto,
  ) {
    return this.productionService.updateStatus(id, dto);
  }
}
