import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  UnauthorizedException,
  Request,
  Ip,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { User } from '../../users/entities/user.entity';

type UserResponse = Pick<
  User,
  | 'id'
  | 'username'
  | 'email'
  | 'nombre'
  | 'apellido'
  | 'role'
  | 'estado'
  | 'telefono'
  | 'empresa'
  | 'cedula'
  | 'ultimoAcceso'
  | 'creationDate'
  | 'updateDate'
>;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { ttl: 300, limit: 3 } }) // 3 intentos por 5 minutos
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de registro inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'El correo electrónico ya está registrado',
  })
  @ApiResponse({
    status: 429,
    description: 'Demasiados intentos de registro',
  })
  async register(
    @Body() registerDto: RegisterDto,
    @Ip() ip: string,
  ): Promise<UserResponse> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Throttle({ default: { ttl: 300, limit: 5 } }) // 5 intentos por 5 minutos
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  @ApiResponse({
    status: 429,
    description: 'Demasiados intentos de inicio de sesión',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Request() req: any,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const traceId = req.headers['x-trace-id'] || 'unknown';

    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
      ip,
      userAgent,
      traceId,
    );
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario obtenido exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  getProfile(@Request() req: { user: UserResponse }): UserResponse {
    return req.user;
  }
}
