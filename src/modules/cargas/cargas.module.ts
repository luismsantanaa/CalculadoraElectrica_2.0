import { Module } from '@nestjs/common';
import { CargasService } from './services/cargas.service';
import { CargasController } from './controllers/cargas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carga } from './entities/cargas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Carga])],
  providers: [CargasService],
  controllers: [CargasController],
  exports: [CargasService],
})
export class CargasModule {}
