// production.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
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

  /** GET /api/production/daily?dateFrom=2026-08-01&dateTo=2026-08-22
   *  Sin parámetros, retorna la producción del día actual.
   */
  @Get('daily')
  getDailyProduction(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.productionService.getDailyProduction(dateFrom, dateTo);
  }
}