import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const dbConfig = {
  type: 'postgres' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'warehouse_nest',
  autoLoadEntities: true,
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
};
