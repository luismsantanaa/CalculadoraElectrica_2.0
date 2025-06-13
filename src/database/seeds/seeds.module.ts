import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedsService } from './seeds.service';
import { TipoInstalacion } from '../../modules/tipos-instalaciones/entities/tipo-instalacion.entity';
import { TipoAmbiente } from '../../modules/tipos-ambientes/entities/tipo-ambiente.entity';
import { TipoArtefacto } from '../../modules/tipos-artefactos/entities/tipo-artefacto.entity';
import { AppDataSource } from '../data-source';

@Module({
  imports: [
    TypeOrmModule.forRoot(AppDataSource.options),
    TypeOrmModule.forFeature([TipoInstalacion, TipoAmbiente, TipoArtefacto]),
  ],
  providers: [SeedsService],
  exports: [SeedsService],
})
export class SeedsModule {}
