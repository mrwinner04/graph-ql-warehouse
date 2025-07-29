import { Resolver, Query } from '@nestjs/graphql';
import { Public } from './decorator/public.decorator';

@Resolver()
export class AppResolver {
  @Public()
  @Query(() => String, { description: 'Health check endpoint' })
  healthCheck(): string {
    return 'GraphQL Warehouse API is running!';
  }
}
