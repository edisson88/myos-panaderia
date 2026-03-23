import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /** GET /api/products */
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  /** GET /api/products/:id */
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  /** POST /api/products */
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  /** PATCH /api/products/:id */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateProductDto>,
  ) {
    return this.productsService.update(id, dto);
  }

  /** DELETE /api/products/:id */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
