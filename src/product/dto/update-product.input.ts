import { InputType, Field } from '@nestjs/graphql';
import { ProductType } from '../product.entity';

@InputType({ description: 'Input type for updating a product' })
export class UpdateProductInput {
  @Field(() => String, { description: 'Product name', nullable: true })
  name?: string;

  @Field(() => String, { description: 'Product code', nullable: true })
  code?: string;

  @Field(() => String, { description: 'Product price', nullable: true })
  price?: string;

  @Field(() => ProductType, { description: 'Product type', nullable: true })
  type?: ProductType;
}
