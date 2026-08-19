import { IsEnum, IsISO8601, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Granularity } from '../enums/granularity.enum';

/**
 * Rango de consulta común a todos los endpoints de analítica.
 *
 * `from` / `to` son fechas ISO (YYYY-MM-DD). Si se omiten, el servicio aplica
 * los últimos 30 días. El rango es siempre semiabierto: [from, to).
 */
export class AnalyticsRangeDto {
  @IsOptional()
  @IsISO8601({}, { message: 'from debe ser una fecha ISO (YYYY-MM-DD)' })
  from?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'to debe ser una fecha ISO (YYYY-MM-DD)' })
  to?: string;

  @IsOptional()
  @IsEnum(Granularity, {
    message: `granularity debe ser uno de: ${Object.values(Granularity).join(', ')}`,
  })
  granularity?: Granularity;

  @IsOptional()
  @IsInt({ message: 'limit debe ser un número entero' })
  @Min(1)
  @Max(100)
  limit?: number;
}

/**
 * Parámetros del pronóstico de demanda de producción.
 */
export class DemandForecastDto {
  /** Días hacia adelante a proyectar. */
  @IsOptional()
  @IsInt({ message: 'days debe ser un número entero' })
  @Min(1)
  @Max(14)
  days?: number;

  /** Semanas de historia usadas como base del promedio por día de semana. */
  @IsOptional()
  @IsInt({ message: 'lookbackWeeks debe ser un número entero' })
  @Min(2)
  @Max(26)
  lookbackWeeks?: number;
}
