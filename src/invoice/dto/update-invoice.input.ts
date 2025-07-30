import { InputType, Field } from '@nestjs/graphql';
import { InvoiceStatus } from '../invoice.entity';

@InputType()
export class UpdateInvoiceInput {
  @Field(() => String, {
    nullable: true,
  })
  orderId?: string;

  @Field(() => String)
  number?: string;

  @Field(() => Date)
  date?: Date;

  @Field(() => InvoiceStatus)
  status?: InvoiceStatus;
}
