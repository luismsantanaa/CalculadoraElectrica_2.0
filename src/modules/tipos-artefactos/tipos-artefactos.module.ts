import { Module } from '@nestjs/common';
import { TiposArtefactosService } from './services/tipos-artefactos.service';
import { TiposArtefactosController } from './controllers/tipos-artefactos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoArtefacto } from './entities/tipo-artefacto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoArtefacto])],
  providers: [TiposArtefactosService],
  controllers: [TiposArtefactosController],
  exports: [TiposArtefactosService],
})
export class TiposArtefactosModule {}
