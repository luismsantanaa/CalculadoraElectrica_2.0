import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from '../jwt.strategy';
import { UsersService } from '../../../modules/users/users.service';
import { ConfigService } from '@nestjs/config';
import {
  User,
  UserRole,
  UserStatus,
} from '../../../modules/users/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockUsersService = {
    findById: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const mockPayload: JwtPayload = {
      sub: 1,
      email: 'test@example.com',
      role: UserRole.CLIENTE,
    };

    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedPassword',
      username: 'testuser',
      nombre: 'Test',
      apellido: 'User',
      role: UserRole.CLIENTE,
      estado: UserStatus.ACTIVO,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      hashPassword: async () => {},
      validatePassword: async () => true,
      toJSON: () => ({
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        nombre: 'Test',
        apellido: 'User',
        role: UserRole.CLIENTE,
        estado: UserStatus.ACTIVO,
        fechaCreacion: expect.any(Date),
        fechaActualizacion: expect.any(Date),
      }),
    };

    it('should return user when token is valid', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await strategy.validate(mockPayload);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findById).toHaveBeenCalledWith(
        mockPayload.sub.toString(),
      );
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
