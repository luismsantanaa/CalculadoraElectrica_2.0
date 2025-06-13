import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  'password' | 'hashPassword' | 'validatePassword' | 'toJSON'
>;

@Entity('users')
export class User {
  @ApiProperty({ description: 'ID único del usuario' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @ApiProperty({ description: 'Fecha de creación del usuario' })
  @CreateDateColumn()
  fechaCreacion: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn()
  fechaActualizacion: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  toJSON() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = this;
    return result;
  }
}
