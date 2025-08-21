import {
  Entity,
  Column,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseAuditEntity } from '../../../common/entities/base-audit.entity';

export enum UserRole {
  ADMIN = 'admin',
  INGENIERO = 'ingeniero',
  TECNICO = 'tecnico',
  CLIENTE = 'cliente',
}

export enum UserStatus {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  SUSPENDIDO = 'suspendido',
}

export type UserWithoutPassword = Omit<
  User,
  'password' | 'hashPassword' | 'validatePassword' | 'toJSON' | 'hashedPassword'
>;

@Entity('users')
export class User extends BaseAuditEntity {
  private readonly saltOrRounds = 10;

  @ApiProperty({ description: 'ID único del usuario' })
  // id ya viene de BaseAuditEntity

  @ApiProperty({ description: 'Nombre de usuario único' })
  @Column({ unique: true, length: 50 })
  username: string;

  @ApiProperty({ description: 'Correo electrónico del usuario' })
  @Column({ unique: true, length: 100 })
  email: string;

  @ApiProperty({ description: 'Contraseña del usuario' })
  @Column({ length: 255 })
  password: string;

  @ApiProperty({ description: 'Nombre del usuario' })
  @Column({ length: 50 })
  nombre: string;

  @ApiProperty({ description: 'Apellido del usuario' })
  @Column({ length: 50 })
  apellido: string;

  @ApiProperty({
    description: 'Rol del usuario',
    enum: UserRole,
    default: UserRole.CLIENTE,
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENTE,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Estado del usuario',
    enum: UserStatus,
    default: UserStatus.ACTIVO,
  })
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVO,
  })
  estado: UserStatus;

  @ApiPropertyOptional({ description: 'Número de teléfono' })
  @Column({ nullable: true, length: 15 })
  telefono?: string;

  @ApiPropertyOptional({ description: 'Empresa donde trabaja' })
  @Column({ nullable: true, length: 200 })
  empresa?: string;

  @ApiPropertyOptional({ description: 'Número de cédula' })
  @Column({ nullable: true, length: 50 })
  cedula?: string;

  @ApiPropertyOptional({ description: 'Fecha del último acceso' })
  @Column({ type: 'datetime', nullable: true })
  ultimoAcceso?: Date;

  // Los campos de auditoría ya vienen de BaseAuditEntity:
  // - creationDate (antes fechaCreacion)
  // - updateDate (antes fechaActualizacion)
  // - usrCreate (antes creadoPor)
  // - usrUpdate (antes actualizadoPor)
  // - active (antes activo)

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await this.hashedPassword(this.password);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, this.password);
    return isMatch;
  }

  async hashedPassword(password: string) {
    return await bcrypt.hash(password, this.saltOrRounds);
  }

  toJSON() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = this;
    return result;
  }
}
