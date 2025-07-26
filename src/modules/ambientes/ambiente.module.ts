import { Module } from '@nestjs/common';
import { AmbienteService } from './services/ambiente.service';
import { AmbienteController } from './controllers/ambiente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ambiente } from './entities/ambiente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ambiente])],
  providers: [AmbienteService],
  controllers: [AmbienteController],
  exports: [AmbienteService],
})
export class AmbienteModule {}
