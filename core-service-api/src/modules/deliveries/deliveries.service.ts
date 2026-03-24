import { Injectable } from '@nestjs/common';
import { DeliveriesRepository } from './deliveries.repository';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';

@Injectable()
export class DeliveriesService {
  constructor(
    private readonly deliveriesRepository: DeliveriesRepository,
  ) {}

  async findAll(): Promise<object> {
    await this.deliveriesRepository.findAll();
    return { message: 'Deliveries list — TODO' };
  }

  async findById(id: string): Promise<object> {
    await this.deliveriesRepository.findById(id);
    return { message: 'Delivery detail — TODO', id };
  }

  async updateStatus(
    id: string,
    dto: UpdateDeliveryStatusDto,
  ): Promise<object> {
    await this.deliveriesRepository.updateStatus(id, dto.status);
    return { message: 'Update delivery status — TODO', id, status: dto.status };
  }
}
