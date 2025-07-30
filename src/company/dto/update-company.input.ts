import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateCompanyInput {
  @Field(() => String)
  name: string;
}
