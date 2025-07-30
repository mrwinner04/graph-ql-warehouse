import { InputType, Field } from '@nestjs/graphql';
import { InvoiceStatus } from '../invoice.entity';

@InputType()
export class CreateInvoiceInput {
  @Field(() => String)
  orderId: string;

  @Field(() => String)
  number?: string;

  @Field(() => Date)
  date?: Date;

  @Field(() => InvoiceStatus)
  status?: InvoiceStatus;
}
