/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../../services/auth.service';
import { LoginDto } from '../../dtos/login.dto';
import { User, UserRole, UserStatus } from '../../../users/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
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
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return JWT token on successful login', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        nombre: 'Test',
        apellido: 'User',
        role: UserRole.CLIENTE,
        estado: UserStatus.ACTIVO,
        creationDate: new Date(),
        updateDate: new Date(),
        active: true,
        password: 'hashedPassword',
        validatePassword: jest.fn(),
        hashPassword: jest.fn(),
        hashedPassword: jest.fn(),
        toJSON: jest.fn(),
      } as User;

      const mockToken = {
        access_token: 'mock-jwt-token',
        user: mockUser,
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(mockToken);

      const result = await controller.login(loginDto, '127.0.0.1', { userAgent: 'test-agent' } as any);

      expect(result).toEqual(mockToken);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto, '127.0.0.1', { userAgent: 'test-agent' } as any)).rejects.toThrow();
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        nombre: 'Test',
        apellido: 'User',
        role: UserRole.CLIENTE,
        estado: UserStatus.ACTIVO,
        creationDate: new Date(),
        updateDate: new Date(),
        active: true,
        password: 'hashedPassword',
        validatePassword: jest.fn(),
        hashPassword: jest.fn(),
        hashedPassword: jest.fn(),
        toJSON: jest.fn(),
      } as User;

      const result = controller.getProfile({ user: mockUser });
      expect(result).toEqual(mockUser);
    });
  });
});
