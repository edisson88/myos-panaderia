import { Injectable } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async findAll(): Promise<object> {
    await this.productsRepository.findAll();
    return { message: 'Products list — TODO' };
  }

  async findById(id: string): Promise<object> {
    await this.productsRepository.findById(id);
    return { message: 'Product detail — TODO', id };
  }

  async create(dto: CreateProductDto): Promise<object> {
    return { message: 'Create product — TODO', name: dto.name };
  }

  async update(id: string, dto: Partial<CreateProductDto>): Promise<object> {
    await this.productsRepository.update(id, dto as Record<string, unknown>);
    return { message: 'Update product — TODO', id };
  }

  async remove(id: string): Promise<object> {
    await this.productsRepository.remove(id);
    return { message: 'Delete product — TODO', id };
  }
}
