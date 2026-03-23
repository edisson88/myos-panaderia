import { Injectable } from '@nestjs/common';
import { HasuraService } from '../../shared/hasura/hasura.service';

@Injectable()
export class ProductsRepository {
  constructor(private readonly hasuraService: HasuraService) {}

  async findAll(): Promise<unknown[]> { return []; }
  async findById(_id: string): Promise<unknown> { return null; }
  async create(_data: Record<string, unknown>): Promise<unknown> { return null; }
  async update(_id: string, _data: Record<string, unknown>): Promise<unknown> { return null; }
  async remove(_id: string): Promise<unknown> { return null; }
}
