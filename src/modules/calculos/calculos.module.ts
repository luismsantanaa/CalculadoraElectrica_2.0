import { Module } from '@nestjs/common';
import { CalculosController } from './calculos.controller';
import { CalculationAppService } from './services/calculation-app.service';
import { CalculationDomainService } from './services/calculation-domain.service';
import { RulesModule } from '../rules/rules.module';

@Module({
  imports: [RulesModule],
  controllers: [CalculosController],
  providers: [CalculationAppService, CalculationDomainService],
  exports: [CalculationAppService],
})
export class CalculosModule {}
