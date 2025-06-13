import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CargasService } from './cargas.service';
import { CargasController } from './cargas.controller';
import { Carga } from './entities/cargas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Carga])],
  controllers: [CargasController],
  providers: [CargasService],
  exports: [CargasService],
})
export class CargasModule {}
