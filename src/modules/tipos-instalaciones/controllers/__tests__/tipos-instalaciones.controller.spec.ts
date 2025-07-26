/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { TiposInstalacionesController } from '../tipos-instalaciones.controller';
import { TiposInstalacionesService } from '../../services/tipos-instalaciones.service';
import { CreateTipoInstalacionDto } from '../../dtos/create-tipo-instalacion.dto';
import { UpdateTipoInstalacionDto } from '../../dtos/update-tipo-instalacion.dto';
import { PaginateQuery } from 'nestjs-paginate';
import { ActivoSpecification } from '../../specifications/activo.specification';

describe('TiposInstalacionesController', () => {
  let controller: TiposInstalacionesController;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const mockUser = {
    id: '953bb424-65c5-49f0-ad29-be1fcbb77bbf',
    username: 'testUser',
    email: 'test@example.com',
    password: 'hashedPassword',
    nombre: 'Test',
    apellido: 'User',
    role: 'user',
    status: 'active',
    estado: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    creadoPor: 'system',
    actualizadoPor: 'system',
  } as any;

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
      const expectedTipoInstalacion = {
        ...createDto,
        id: '1',
        activo: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        creadoPor: mockUser.id,
      };

      mockService.create.mockResolvedValue(expectedTipoInstalacion);

      const result = await controller.create(createDto, mockUser);

      expect(result).toEqual(expectedTipoInstalacion);
      expect(mockService.create).toHaveBeenCalledWith(createDto, mockUser.id);
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
      const expectedTipoInstalacion = {
        id,
        nombre: 'Updated Instalacion',
        descripcion: 'Test Description',
        activo: true,
        actualizadoPor: mockUser.id,
      };

      mockService.update.mockResolvedValue(expectedTipoInstalacion);

      const result = await controller.update(id, updateDto, mockUser);

      expect(result).toEqual(expectedTipoInstalacion);
      expect(mockService.update).toHaveBeenCalledWith(
        id,
        updateDto,
        mockUser.id,
      );
    });
  });

  describe('remove', () => {
    it('should remove a tipo instalacion', async () => {
      const id = '1';

      mockService.remove.mockResolvedValue(undefined);

      await controller.remove(id, mockUser);

      expect(mockService.remove).toHaveBeenCalledWith(id, mockUser.id);
    });
  });
});
