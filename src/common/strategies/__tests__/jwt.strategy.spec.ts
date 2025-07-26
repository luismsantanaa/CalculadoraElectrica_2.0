import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../modules/users/services/users.service';
import { JwtStrategy } from '../jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: UsersService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get<UsersService>(UsersService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user when valid payload is provided', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const payload = { sub: 1, email: 'test@example.com', role: 'user' };

      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser as any);

      const result = await strategy.validate(payload);

      expect(result).toEqual(mockUser);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.findById).toHaveBeenCalledWith('1');
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      const payload = { sub: 1, email: 'test@example.com', role: 'user' };

      jest.spyOn(usersService, 'findById').mockResolvedValue(null as any);

      await expect(strategy.validate(payload)).rejects.toThrow(
        'Usuario no encontrado',
      );
    });
  });
});
