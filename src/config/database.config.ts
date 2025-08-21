import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'mariadb' as const,
  host: configService.get<string>('database.host', 'localhost'),
  port: configService.get<number>('database.port', 3306),
  username: configService.get<string>('database.username', 'electridom'),
  password: configService.get<string>('database.password', 'electridom'),
  database: configService.get<string>('database.database', 'electridom'),
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: configService.get<boolean>('database.logging', false),
  autoLoadEntities: true,
});
