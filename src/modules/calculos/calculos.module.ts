import { Module } from '@nestjs/common';
import { CalculosService } from './services/calculos.service';
import { CalculosController } from './controllers/calculos.controller';

@Module({
  providers: [CalculosService],
  controllers: [CalculosController],
  exports: [CalculosService],
})
export class CalculosModule {}
