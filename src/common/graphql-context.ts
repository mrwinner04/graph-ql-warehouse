import { UserRole } from './types';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  companyId: string;
}

export interface GraphQLContext {
  req: {
    user?: AuthenticatedUser;
  };
}

export interface GraphQLError {
  message: string;
  extensions?: {
    originalError?: {
      message?: string;
      statusCode?: number;
      error?: string;
    };
  };
}
