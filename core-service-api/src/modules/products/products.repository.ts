import { Injectable } from '@nestjs/common';
import { HasuraService } from '../../shared/hasura/hasura.service';
import {
  GET_ALL_PRODUCTS,
  GET_PRODUCT_BY_ID,
  INSERT_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
} from './products.queries';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

export interface HasuraProduct {
  id: string;
  name: string;
  description: string | null;
  unit_price: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface GetAllProductsResponse {
  products: HasuraProduct[];
}

interface GetProductByIdResponse {
  products_by_pk: HasuraProduct | null;
}

interface InsertProductResponse {
  insert_products_one: HasuraProduct;
}

interface UpdateProductResponse {
  update_products_by_pk: HasuraProduct;
}

interface DeleteProductResponse {
  delete_products_by_pk: { id: string };
}

@Injectable()
export class ProductsRepository {
  constructor(private readonly hasuraService: HasuraService) {}

  async findAll(): Promise<HasuraProduct[]> {
    const result =
      await this.hasuraService.query<GetAllProductsResponse>(GET_ALL_PRODUCTS);
    return result.products;
  }

  async findById(id: string): Promise<HasuraProduct | null> {
    const result =
      await this.hasuraService.query<GetProductByIdResponse>(
        GET_PRODUCT_BY_ID,
        { id },
      );
    return result.products_by_pk ?? null;
  }

  async create(dto: CreateProductDto): Promise<HasuraProduct> {
    const result =
      await this.hasuraService.query<InsertProductResponse>(INSERT_PRODUCT, {
        name: dto.name,
        description: dto.description ?? null,
        unit_price: dto.unit_price,
        active: dto.active ?? true,
      });
    return result.insert_products_one;
  }

  async update(id: string, dto: UpdateProductDto): Promise<HasuraProduct> {
    const result =
      await this.hasuraService.query<UpdateProductResponse>(UPDATE_PRODUCT, {
        id,
        name: dto.name ?? undefined,
        description: dto.description ?? undefined,
        unit_price: dto.unit_price ?? undefined,
        active: dto.active ?? undefined,
      });
    return result.update_products_by_pk;
  }

  async remove(id: string): Promise<{ id: string }> {
    const result =
      await this.hasuraService.query<DeleteProductResponse>(DELETE_PRODUCT, {
        id,
      });
    return result.delete_products_by_pk;
  }
}
