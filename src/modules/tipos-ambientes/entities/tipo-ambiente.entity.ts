import { TipoInstalacion } from '../../tipos-instalaciones/entities/tipo-instalacion.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity('tipos_ambientes')
export class TipoAmbiente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @ManyToOne(() => TipoInstalacion, { eager: true })
  @JoinColumn({ name: 'tipoInstalacion_Id' })
  tipoInstalacion: TipoInstalacion;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  fechaCreacion: Date;

  @Column({ nullable: true })
  creadoPor: string;

  @UpdateDateColumn()
  fechaActualizacion: Date;

  @Column({ nullable: true })
  actualizadoPor: string;
}
