import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticatedUser } from '../common/graphql-context';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): AuthenticatedUser | undefined => {
    const gqlContext = GqlExecutionContext.create(context);
    const graphqlContext = gqlContext.getContext();
    return graphqlContext.req?.user;
  },
);
