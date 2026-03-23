import { Injectable } from '@nestjs/common';
import { HasuraService } from '../../shared/hasura/hasura.service';

@Injectable()
export class OrdersRepository {
  constructor(private readonly hasuraService: HasuraService) {}

  // TODO: implement — paginated list with filters (status, dateRange, search)
  async findAll(
    _filters?: Record<string, unknown>,
  ): Promise<unknown[]> {
    return [];
  }

  // TODO: implement — order detail with items and customer
  async findById(_id: string): Promise<unknown> {
    return null;
  }

  // TODO: implement — insert order + items in transaction
  async create(_data: Record<string, unknown>): Promise<unknown> {
    return null;
  }

  // TODO: implement — update order fields
  async update(
    _id: string,
    _data: Record<string, unknown>,
  ): Promise<unknown> {
    return null;
  }

  // TODO: implement — update only the status field
  async updateStatus(_id: string, _status: string): Promise<unknown> {
    return null;
  }
}
