/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UsersService } from '../../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  User,
  UserRole,
  UserStatus,
} from '../../../users/entities/user.entity';
import { RegisterDto } from '../../dtos/register.dto';
import { UnauthorizedException } from '@nestjs/common';

interface MockUser extends Omit<User, 'validatePassword'> {
  validatePassword: jest.Mock;
}

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    const email = 'test@example.com';
    const password = 'password123';

    let mockUser: MockUser;

    beforeEach(() => {
      mockUser = {
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
        validatePassword: jest.fn(),
        toJSON: () => ({
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
          nombre: 'Test',
          apellido: 'User',
          role: UserRole.CLIENTE,
          estado: UserStatus.ACTIVO,
          fechaCreacion: expect.any(Date) as unknown as Date,
          fechaActualizacion: expect.any(Date) as unknown as Date,
        }),
      };
    });

    it('should return user when credentials are valid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUser.validatePassword.mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      const { hashPassword, validatePassword, toJSON, ...userProps } = mockUser;
      expect(result).toEqual(
        expect.objectContaining({
          id: userProps.id,
          email: userProps.email,
          username: userProps.username,
          nombre: userProps.nombre,
          apellido: userProps.apellido,
          role: userProps.role,
          estado: userProps.estado,
          fechaCreacion: expect.any(Date),
          fechaActualizacion: expect.any(Date),
        }),
      );
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockUser.validatePassword).toHaveBeenCalledWith(password);
    });

    it('should return null when user is not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should return null when password is invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUser.validatePassword.mockResolvedValue(false);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockUser.validatePassword).toHaveBeenCalledWith(password);
    });
  });

  describe('login', () => {
    const mockUser: MockUser = {
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
      validatePassword: jest.fn().mockResolvedValue(true),
      toJSON: () => ({
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        nombre: 'Test',
        apellido: 'User',
        role: UserRole.CLIENTE,
        estado: UserStatus.ACTIVO,
        fechaCreacion: expect.any(Date) as unknown as Date,
        fechaActualizacion: expect.any(Date) as unknown as Date,
      }),
    };

    it('should return JWT token', () => {
      const mockToken = 'mock-jwt-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = service.login(mockUser);

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          nombre: mockUser.nombre,
          apellido: mockUser.apellido,
          role: mockUser.role,
          username: mockUser.username,
        },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'new@example.com',
      password: 'password123',
      nombre: 'New',
      apellido: 'User',
      username: 'newuser',
    };

    const mockRegisteredUser: Partial<User> = {
      id: '2',
      email: registerDto.email,
      username: registerDto.username,
      nombre: registerDto.nombre,
      apellido: registerDto.apellido,
      role: UserRole.CLIENTE,
    };

    it('should register a new user', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockRegisteredUser);

      const result = await service.register(registerDto);

      expect(result).toEqual(mockRegisteredUser);
      expect(mockUsersService.create).toHaveBeenCalledWith({
        ...registerDto,
        password: expect.any(String),
        role: UserRole.CLIENTE,
      });
    });

    it('should throw UnauthorizedException if email is already taken', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: '1' });
      mockUsersService.create.mockClear();

      await expect(service.register(registerDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUsersService.create).not.toHaveBeenCalled();
    });
  });
});
