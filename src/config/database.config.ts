import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'mariadb' as const,
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
  logging: configService.get<boolean>('DB_LOGGING'),
  autoLoadEntities: true,
});
