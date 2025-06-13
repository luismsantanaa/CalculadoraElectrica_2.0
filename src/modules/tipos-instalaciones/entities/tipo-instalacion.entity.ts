import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tipos_instalaciones')
export class TipoInstalacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 255, nullable: true })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  fechaCreacion: Date;

  @Column({ length: 100, nullable: true })
  creadoPor: string;

  @UpdateDateColumn()
  fechaActualizacion: Date;

  @Column({ length: 100, nullable: true })
  actualizadoPor: string;
}
