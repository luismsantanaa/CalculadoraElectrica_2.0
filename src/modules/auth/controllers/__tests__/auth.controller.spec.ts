/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../../services/auth.service';
import { LoginDto } from '../../dtos/login.dto';
import { RegisterDto } from '../../dtos/register.dto';
import {
  User,
  UserRole,
  UserStatus,
} from '../../../users/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
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
      validatePassword: () => Promise.resolve(true),
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

    const mockToken = {
      access_token: 'mock-jwt-token',
    };

    it('should return JWT token on successful login', async () => {
      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(mockToken);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockToken);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
      nombre: 'New',
      apellido: 'User',
    };

    const mockRegisteredUser: Partial<User> = {
      id: '2',
      email: registerDto.email,
      nombre: registerDto.nombre,
      apellido: registerDto.apellido,
      role: UserRole.CLIENTE,
    };

    it('should register a new user successfully', async () => {
      mockAuthService.register.mockResolvedValue(mockRegisteredUser);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockRegisteredUser);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('getProfile', () => {
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
      validatePassword: () => Promise.resolve(true),
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

    it('should return user profile', () => {
      const result = controller.getProfile({ user: mockUser });
      expect(result).toEqual(mockUser);
    });
  });
});
