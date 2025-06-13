import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { RegisterDto } from '../dtos/register.dto';
import { User, UserRole } from '../../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

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
  | 'fechaCreacion'
  | 'fechaActualizacion'
>;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserResponse | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await user.validatePassword(password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result as UserResponse;
    }
    return null;
  }

  login(user: UserResponse) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        nombre: user.nombre,
        apellido: user.apellido,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<UserResponse> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException(
        'El correo electrónico ya está registrado',
      );
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const newUser = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      role: UserRole.CLIENTE,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = newUser;
    return result as UserResponse;
  }
}
