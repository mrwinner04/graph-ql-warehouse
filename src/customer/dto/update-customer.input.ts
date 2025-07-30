import { InputType, Field } from '@nestjs/graphql';
import { CustomerType } from '../customer.entity';

@InputType()
export class UpdateCustomerInput {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => CustomerType, { nullable: true })
  type?: CustomerType;
}
