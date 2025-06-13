import { Test, TestingModule } from '@nestjs/testing';
import { CalculosController } from './calculos.controller';
import { CalculosService } from './calculos.service';

describe('CalculosController', () => {
  let controller: CalculosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalculosController],
      providers: [CalculosService],
    }).compile();

    controller = module.get<CalculosController>(CalculosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
