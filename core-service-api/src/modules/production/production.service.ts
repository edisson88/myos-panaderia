import { Injectable } from '@nestjs/common';
import { ProductionRepository } from './production.repository';
import { UpdateProductionStatusDto } from './dto/update-production-status.dto';

@Injectable()
export class ProductionService {
  constructor(
    private readonly productionRepository: ProductionRepository,
  ) {}

  async findAll(): Promise<object> {
    await this.productionRepository.findAll();
    return { message: 'Production list — TODO' };
  }

  async findById(id: string): Promise<object> {
    await this.productionRepository.findById(id);
    return { message: 'Production detail — TODO', id };
  }

  async updateStatus(
    id: string,
    dto: UpdateProductionStatusDto,
  ): Promise<object> {
    await this.productionRepository.updateStatus(id, dto.status);
    return { message: 'Update production status — TODO', id, status: dto.status };
  }
}
