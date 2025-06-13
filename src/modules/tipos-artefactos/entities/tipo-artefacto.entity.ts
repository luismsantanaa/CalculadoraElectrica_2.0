import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TipoAmbiente } from '../../tipos-ambientes/entities/tipo-ambiente.entity';

@Entity('tipos_artefactos')
export class TipoArtefacto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  potencia: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  voltaje: number;

  @ManyToOne(() => TipoAmbiente, (tipoAmbiente) => tipoAmbiente.id)
  @JoinColumn({ name: 'tipoAmbiente_id' })
  tipoAmbiente: TipoAmbiente;

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
