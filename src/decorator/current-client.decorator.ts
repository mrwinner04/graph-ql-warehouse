import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentClient = createParamDecorator(
  (data: unknown, context: ExecutionContext): string | undefined => {
    const gqlContext = GqlExecutionContext.create(context);
    const graphqlContext = gqlContext.getContext();
    return graphqlContext.req?.user?.companyId;
  },
);
