import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { RegisterDto } from '../dtos/register.dto';
import { User, UserRole } from '../../users/entities/user.entity';
import { AuditService } from '../../../common/services/audit.service';
import { AuditAction } from '../../../common/types/audit.types';
import { HashService } from '../../../common/services/hash.service';

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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private auditService: AuditService,
    private hashService: HashService,
  ) {}

  async validateUser(
    email: string,
    password: string,
    ip?: string,
    userAgent?: string,
    traceId?: string,
  ): Promise<UserResponse | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      // Registrar intento de login fallido - usuario no encontrado
      await this.auditService.log({
        userId: undefined,
        action: AuditAction.LOGIN_FAILED,
        ip,
        userAgent,
        traceId,
        detail: { email, reason: 'user_not_found' },
      });
      return null;
    }

    // Validar contraseña usando el nuevo sistema
    const passwordValidation = await user.validatePassword(password);

    if (passwordValidation.hash) {
      // Contraseña válida - verificar si necesita migración
      if (passwordValidation.needsMigration) {
        this.logger.log(
          `Migrando contraseña de bcrypt a Argon2id para usuario: ${email}`,
        );

        try {
          // Migración silenciosa: actualizar hash a Argon2id
          await this.usersService.updatePasswordWithMigration(user, password);

          // Auditoría de migración exitosa
          await this.auditService.log({
            userId: user.id,
            action: AuditAction.PASSWORD_CHANGE,
            ip,
            userAgent,
            traceId,
            detail: {
              email: user.email,
              reason: 'bcrypt_to_argon2id_migration',
              success: true,
            },
          });

          this.logger.log(
            `Migración completada exitosamente para usuario: ${email}`,
          );
        } catch (error) {
          this.logger.error(`Error en migración para usuario ${email}:`, error);

          // Auditoría de migración fallida
          await this.auditService.log({
            userId: user.id,
            action: AuditAction.PASSWORD_CHANGE,
            ip,
            userAgent,
            traceId,
            detail: {
              email: user.email,
              reason: 'bcrypt_to_argon2id_migration',
              success: false,
              error: error.message,
            },
          });
        }
      }

      // Registrar login exitoso
      await this.auditService.log({
        userId: user.id,
        action: AuditAction.LOGIN_SUCCESS,
        ip,
        userAgent,
        traceId,
        detail: {
          email: user.email,
          hashType: passwordValidation.type,
          migrated: passwordValidation.needsMigration,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result as UserResponse;
    } else {
      // Contraseña inválida
      await this.auditService.log({
        userId: user.id,
        action: AuditAction.LOGIN_FAILED,
        ip,
        userAgent,
        traceId,
        detail: { email, reason: 'invalid_password' },
      });
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

    // Usar Argon2id para nuevos registros
    const hashedPassword = await this.hashService.hashPassword(
      registerDto.password,
    );
    const newUser = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      role: UserRole.CLIENTE,
    });

    this.logger.log(
      `Nuevo usuario registrado con Argon2id: ${registerDto.email}`,
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = newUser;
    return result as UserResponse;
  }
}
