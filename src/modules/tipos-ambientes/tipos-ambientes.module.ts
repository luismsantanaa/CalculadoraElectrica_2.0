import { Module } from '@nestjs/common';
import { TiposAmbientesService } from './services/tipos-ambientes.service';
import { TiposAmbientesController } from './controllers/tipos-ambientes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoAmbiente } from './entities/tipo-ambiente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoAmbiente])],
  providers: [TiposAmbientesService],
  controllers: [TiposAmbientesController],
  exports: [TiposAmbientesService],
})
export class TiposAmbientesModule {}
