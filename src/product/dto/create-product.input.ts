import { InputType, Field } from '@nestjs/graphql';
import { ProductType } from '../product.entity';

@InputType({ description: 'Input type for creating a product' })
export class CreateProductInput {
  @Field(() => String, { description: 'Product name' })
  name: string;

  @Field(() => String, { description: 'Product code' })
  code: string;

  @Field(() => String, { description: 'Product price' })
  price: string;

  @Field(() => ProductType, { description: 'Product type' })
  type: ProductType;
}
