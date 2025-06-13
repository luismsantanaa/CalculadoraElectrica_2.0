import { TipoAmbiente } from '../../tipos-ambientes/entities/tipo-ambiente.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { tipoSuperficieEnum } from '../../../common/dtos/enums';

@Entity('ambiente')
export class Ambiente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ name: 'tipo_ambiente_id' })
  tipoAmbienteId: string;

  @ManyToOne(() => TipoAmbiente, { eager: true })
  @JoinColumn({ name: 'tipo_ambiente_id' })
  tipoAmbiente: TipoAmbiente;

  @Column({
    type: 'enum',
    enum: tipoSuperficieEnum,
    default: tipoSuperficieEnum.RECTANGULAR,
  })
  tipoSuperficie: tipoSuperficieEnum;

  @Column({ nullable: true, type: 'float' })
  largo?: number;

  @Column({ nullable: true, type: 'float' })
  ancho?: number;

  @Column({ nullable: true, type: 'float' })
  area?: number;

  @Column({ nullable: true, type: 'float' })
  altura?: number;

  @Column({ nullable: true })
  nivel?: string;

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

  getCalculatedArea(): number {
    if (!this.largo || !this.ancho) {
      return 0;
    }
    return this.largo * this.ancho;
  }
}
