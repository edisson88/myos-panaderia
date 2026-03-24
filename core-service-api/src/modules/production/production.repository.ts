import { Injectable } from '@nestjs/common';
import { HasuraService } from '../../shared/hasura/hasura.service';

@Injectable()
export class ProductionRepository {
  constructor(private readonly hasuraService: HasuraService) {}

  async findAll(): Promise<unknown[]> { return []; }
  async findById(_id: string): Promise<unknown> { return null; }
  async updateStatus(_id: string, _status: string): Promise<unknown> { return null; }
}
