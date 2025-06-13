import { Test, TestingModule } from '@nestjs/testing';
import { TiposInstalacionesController } from './tipos-instalaciones.controller';
import { TiposInstalacionesService } from './tipos-instalaciones.service';
import { CreateTipoInstalacionDto } from './dtos/create-tipo-instalacion.dto';
import { UpdateTipoInstalacionDto } from './dtos/update-tipo-instalacion.dto';
import { PaginateQuery } from 'nestjs-paginate';
import { ActivoSpecification } from './specifications/activo.specification';
import { NombreSpecification } from './specifications/nombre.specification';

describe('TiposInstalacionesController', () => {
  let controller: TiposInstalacionesController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiposInstalacionesController],
      providers: [
        {
          provide: TiposInstalacionesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TiposInstalacionesController>(
      TiposInstalacionesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new tipo instalacion', async () => {
      const createDto: CreateTipoInstalacionDto = {
        nombre: 'Test Instalacion',
        descripcion: 'Test Description',
      };
      const usuario = 'testUser';
      const expectedTipoInstalacion = {
        ...createDto,
        id: '1',
        activo: true,
        creadoPor: usuario,
      };

      mockService.create.mockResolvedValue(expectedTipoInstalacion);

      const result = await controller.create(createDto, usuario);

      expect(result).toEqual(expectedTipoInstalacion);
      expect(mockService.create).toHaveBeenCalledWith(createDto, usuario);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const query: PaginateQuery = {
        page: 1,
        limit: 10,
        path: '/tipos-instalaciones',
      };
      const mockPaginatedResult = {
        success: true,
        message: 'Operación exitosa',
        data: [
          {
            id: '1',
            nombre: 'Test Instalacion',
            descripcion: 'Test Description',
            activo: true,
          },
        ],
        total: 1,
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
          sortBy: [['nombre', 'ASC']],
          searchBy: ['nombre'],
          search: '',
          select: [],
        },
      };

      mockService.findAll.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockPaginatedResult);
      expect(mockService.findAll).toHaveBeenCalledWith(
        query,
        expect.any(ActivoSpecification),
      );
    });

    it('should apply nombre specification when provided', async () => {
      const query: PaginateQuery = {
        page: 1,
        limit: 10,
        path: '/tipos-instalaciones',
      };
      const nombre = 'Test';
      const mockPaginatedResult = {
        success: true,
        message: 'Operación exitosa',
        data: [
          {
            id: '1',
            nombre: 'Test Instalacion',
            descripcion: 'Test Description',
            activo: true,
          },
        ],
        total: 1,
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
          sortBy: [['nombre', 'ASC']],
          searchBy: ['nombre'],
          search: '',
          select: [],
        },
      };

      mockService.findAll.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findAll(query, nombre);

      expect(result).toEqual(mockPaginatedResult);
      expect(mockService.findAll).toHaveBeenCalledWith(
        query,
        expect.any(ActivoSpecification),
      );
    });
  });

  describe('findOne', () => {
    it('should return a tipo instalacion by id', async () => {
      const id = '1';
      const expectedTipoInstalacion = {
        id,
        nombre: 'Test Instalacion',
        descripcion: 'Test Description',
        activo: true,
      };

      mockService.findOne.mockResolvedValue(expectedTipoInstalacion);

      const result = await controller.findOne(id);

      expect(result).toEqual(expectedTipoInstalacion);
      expect(mockService.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a tipo instalacion', async () => {
      const id = '1';
      const updateDto: UpdateTipoInstalacionDto = {
        nombre: 'Updated Instalacion',
      };
      const usuario = 'testUser';
      const expectedTipoInstalacion = {
        id,
        nombre: 'Updated Instalacion',
        descripcion: 'Test Description',
        activo: true,
        actualizadoPor: usuario,
      };

      mockService.update.mockResolvedValue(expectedTipoInstalacion);

      const result = await controller.update(id, updateDto, usuario);

      expect(result).toEqual(expectedTipoInstalacion);
      expect(mockService.update).toHaveBeenCalledWith(id, updateDto, usuario);
    });
  });

  describe('remove', () => {
    it('should remove a tipo instalacion', async () => {
      const id = '1';
      const usuario = 'testUser';

      mockService.remove.mockResolvedValue(undefined);

      await controller.remove(id, usuario);

      expect(mockService.remove).toHaveBeenCalledWith(id, usuario);
    });
  });
});
