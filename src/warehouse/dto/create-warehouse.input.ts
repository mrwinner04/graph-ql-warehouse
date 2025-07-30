import { InputType, Field } from '@nestjs/graphql';
import { WarehouseType } from '../warehouse.entity';

@InputType({ description: 'Input type for creating a warehouse' })
export class CreateWarehouseInput {
  @Field(() => String, { description: 'Warehouse name' })
  name: string;

  @Field(() => String, { description: 'Warehouse address', nullable: true })
  address?: string;

  @Field(() => WarehouseType, { description: 'Warehouse type', nullable: true })
  type?: WarehouseType;
}
