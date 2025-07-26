import { Controller } from '@nestjs/common';
import { CalculosService } from '../services/calculos.service';

@Controller('calculos')
export class CalculosController {
  constructor(private readonly calculosService: CalculosService) {}
}
