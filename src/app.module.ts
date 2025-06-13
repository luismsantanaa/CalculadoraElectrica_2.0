import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envConfig, jwtConfig, getDatabaseConfig } from './config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { TiposInstalacionesModule } from './modules/tipos-instalaciones/tipos-instalaciones.module';
import { TiposAmbientesModule } from './modules/tipos-ambientes/tipos-ambientes.module';
import { TiposArtefactosModule } from './modules/tipos-artefactos/tipos-artefactos.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ErrorInterceptor } from './common/interceptors/error.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig, jwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    TiposInstalacionesModule,
    TiposAmbientesModule,
    TiposArtefactosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorInterceptor,
    },
  ],
})
export class AppModule {}
