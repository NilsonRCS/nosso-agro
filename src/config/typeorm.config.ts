import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../modules/users/entities/user.entity';
import { Produtor } from '../modules/produtores/entities/produtor.entity';
import { Propriedade } from '../modules/propriedades/entities/propriedade.entity';
import { SafraCultura } from '../modules/safras/entities/safra-cultura.entity';

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DATABASE_HOST'),
  port: +configService.get('DATABASE_PORT'),
  username: configService.get('DATABASE_USER'),
  password: configService.get('DATABASE_PASSWORD'),
  database: configService.get('DATABASE_NAME'),
  entities: [User, Produtor, Propriedade, SafraCultura],
  migrations: ['dist/database/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  synchronize: configService.get('NODE_ENV') !== 'production',
});
