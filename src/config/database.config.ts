import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Produtor } from '../modules/produtores/entities/produtor.entity';
import { SafraCultura } from '../modules/safras/entities/safra-cultura.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'nosso_agro',
  entities: [Produtor, SafraCultura],
  migrations: [__dirname + '/../database/migrations/*.{js,ts}'],
  migrationsRun: true,
  synchronize: true,
  logging: true,
}; 