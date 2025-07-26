import { Module } from '@nestjs/common';
import { TiposInstalacionesService } from './services/tipos-instalaciones.service';
import { TiposInstalacionesController } from './controllers/tipos-instalaciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoInstalacion } from './entities/tipo-instalacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoInstalacion])],
  providers: [TiposInstalacionesService],
  controllers: [TiposInstalacionesController],
  exports: [TiposInstalacionesService],
})
export class TiposInstalacionesModule {}
