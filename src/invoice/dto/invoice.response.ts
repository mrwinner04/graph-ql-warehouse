import { ObjectType, Field, ID } from '@nestjs/graphql';
import { InvoiceStatus } from '../invoice.entity';

@ObjectType()
export class InvoiceResponse {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  companyId: string;

  @Field(() => String)
  orderId: string;

  @Field(() => String)
  number: string;

  @Field(() => Date)
  date: Date;

  @Field(() => InvoiceStatus)
  status: InvoiceStatus;

  @Field(() => Date, {
    nullable: true,
  })
  createdAt?: Date;

  @Field(() => Date, {
    nullable: true,
  })
  updatedAt?: Date;

  @Field(() => Date, {
    nullable: true,
  })
  deletedAt?: Date;

  @Field(() => String, {
    nullable: true,
  })
  modifiedBy?: string;
}
