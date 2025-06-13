import { TipoAmbiente } from '../../tipos-ambientes/entities/tipo-ambiente.entity';
import { TipoArtefacto } from '../../tipos-artefactos/entities/tipo-artefacto.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cargas')
export class Carga {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TipoAmbiente, { eager: true })
  @JoinColumn({ name: 'tipo_ambiente_id' })
  tipoAmbiente: TipoAmbiente;

  @ManyToOne(() => TipoArtefacto, { eager: true })
  @JoinColumn({ name: 'tipo_artefacto_id' })
  tipoArtefacto: TipoArtefacto;

  @Column({ nullable: true, type: 'int' })
  voltaje: number;

  @Column({ nullable: true, type: 'int' })
  horasUso: number;

  @Column({ type: 'float' })
  @Generated()
  kwhMensual: number;

  @Column({ nullable: true })
  observaciones?: string;

  @Column({ name: 'proyecto_id' })
  proyectoId: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;

  @Column({ nullable: true })
  creadoPor: string;

  @Column({ nullable: true })
  actualizadoPor: string;

  getCalculatedkwhMensual(): number {
    if (!this.horasUso) {
      return 0;
    }
    return this.horasUso * 30;
  }
}
