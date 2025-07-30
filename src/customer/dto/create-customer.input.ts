import { InputType, Field } from '@nestjs/graphql';
import { CustomerType } from '../customer.entity';

@InputType()
export class CreateCustomerInput {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => CustomerType)
  type: CustomerType;
}
