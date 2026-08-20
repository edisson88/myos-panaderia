// production.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductionService, UpsertConfigDto } from './production.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('production')
@UseGuards(JwtAuthGuard)
export class ProductionController {
  constructor(private readonly productionService: ProductionService) { }

  /** GET /api/production/config
   *  Retorna todos los productos activos con su configuración de producción
   *  Si un producto no tiene config, los campos vienen null
   */
  @Get('config')
  getProductionConfig() {
    return this.productionService.getProductionConfig();
  }

  /** POST /api/production/config
   *  Crea o actualiza la configuración de producción de un producto (upsert)
   *  Solo admin debería llamar este endpoint
   */
  @Post('config')
  @HttpCode(HttpStatus.OK)
  upsertProductionConfig(@Body() dto: UpsertConfigDto) {
    return this.productionService.upsertProductionConfig(dto);
  }

  @Get('daily')
  getDailyProduction() {
    return this.productionService.getDailyProduction();
  }
}