import { InputType, Field } from '@nestjs/graphql';
import { WarehouseType } from '../warehouse.entity';

@InputType({ description: 'Input type for updating a warehouse' })
export class UpdateWarehouseInput {
  @Field(() => String, { description: 'Warehouse name', nullable: true })
  name?: string;

  @Field(() => String, { description: 'Warehouse address', nullable: true })
  address?: string;

  @Field(() => WarehouseType, { description: 'Warehouse type', nullable: true })
  type?: WarehouseType;
}
