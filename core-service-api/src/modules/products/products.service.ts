import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository, HasuraProduct } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async findAll(): Promise<HasuraProduct[]> {
    return this.productsRepository.findAll();
  }

  async findById(id: string): Promise<HasuraProduct> {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async create(dto: CreateProductDto): Promise<HasuraProduct> {
    return this.productsRepository.create(dto);
  }

  async update(id: string, dto: UpdateProductDto): Promise<HasuraProduct> {
    await this.findById(id); // verifica que existe antes de actualizar
    return this.productsRepository.update(id, dto);
  }

  async remove(id: string): Promise<{ id: string }> {
    await this.findById(id); // verifica que existe antes de eliminar
    return this.productsRepository.remove(id);
  }
}
