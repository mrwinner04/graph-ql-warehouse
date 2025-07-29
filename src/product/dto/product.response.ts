import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ProductType } from '../product.entity';

@ObjectType({ description: 'Product response type' })
export class ProductResponse {
  @Field(() => ID, { description: 'Unique identifier for the product' })
  id: string;

  @Field(() => String, { description: 'Company ID the product belongs to' })
  companyId: string;

  @Field(() => String, { description: 'Product name' })
  name: string;

  @Field(() => String, { description: 'Product code', nullable: true })
  code?: string;

  @Field(() => String, { description: 'Product price' })
  price: string;

  @Field(() => ProductType, { description: 'Product type' })
  type: ProductType;

  @Field(() => Date, {
    description: 'When the product was created',
    nullable: true,
  })
  createdAt?: Date;

  @Field(() => Date, {
    description: 'When the product was last updated',
    nullable: true,
  })
  updatedAt?: Date;

  @Field(() => Date, {
    description: 'When the product was deleted',
    nullable: true,
  })
  deletedAt?: Date;

  @Field(() => String, {
    description: 'ID of user who last modified the product',
    nullable: true,
  })
  modifiedBy?: string;
}
