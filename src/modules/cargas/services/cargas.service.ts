import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginateQuery, paginate } from 'nestjs-paginate';
import { ISpecification } from '../../../common/specifications/base.specification';
import { ActivoSpecification } from '../specifications/activo.specification';
import {
  PaginatedResultDto,
  PaginationMeta,
} from '../../../common/dtos/paginated-result.dto';
import { Carga } from '../entities/cargas.entity';
import { CreateCargaDto } from '../dtos/create-carga.dto';
import { UpdateCargaDto } from '../dtos/update-carga.dto';

@Injectable()
export class CargasService {
  constructor(
    @InjectRepository(Carga)
    private readonly cargaRepository: Repository<Carga>,
  ) {}

  async create(createDto: CreateCargaDto, usuario: string): Promise<Carga> {
    const carga = this.cargaRepository.create({
      ...createDto,
      creadoPor: usuario,
    } as unknown as Carga);
    return await this.cargaRepository.save(carga);
  }

  async findAll(
    query: PaginateQuery,
    specification?: ISpecification<Carga>,
  ): Promise<PaginatedResultDto<Carga>> {
    const queryBuilder = this.cargaRepository
      .createQueryBuilder('carga')
      .leftJoinAndSelect('carga.tipoAmbiente', 'tipoAmbiente')
      .leftJoinAndSelect('carga.tipoArtefacto', 'tipoArtefacto');

    if (specification) {
      specification.toQueryBuilder(queryBuilder);
    } else {
      new ActivoSpecification(true).toQueryBuilder(queryBuilder);
    }

    const result = (await paginate<Carga>(query, queryBuilder, {
      sortableColumns: [
        'id',
        'tipoAmbiente',
        'tipoArtefacto',
        'voltaje',
        'horasUso',
        'kwhMensual',
        'activo',
        'fechaCreacion',
        'creadoPor',
        'fechaActualizacion',
        'actualizadoPor',
      ],
      searchableColumns: ['tipoAmbiente', 'tipoArtefacto'],
      defaultSortBy: [['tipoAmbiente', 'ASC']],
      defaultLimit: 10,
      relations: ['tipoAmbiente', 'tipoArtefacto'],
    })) as { data: Carga[]; meta: PaginationMeta };

    const totalItems = result.meta.totalItems ?? 0;
    const meta: PaginationMeta = {
      ...result.meta,
      totalItems,
    };

    return PaginatedResultDto.success(result.data, totalItems, meta);
  }

  async findOne(id: string): Promise<Carga> {
    const carga = await this.cargaRepository.findOne({
      where: { id, activo: true },
      relations: ['tipoAmbiente', 'tipoArtefacto'],
    });
    if (!carga) {
      throw new NotFoundException(`Carga con ID ${id} no encontrada`);
    }
    return carga;
  }

  async update(
    id: string,
    updateDto: UpdateCargaDto,
    usuario: string,
  ): Promise<Carga> {
    const carga = await this.findOne(id);
    Object.assign(carga, {
      ...updateDto,
      actualizadoPor: usuario,
    });
    return await this.cargaRepository.save(carga);
  }

  async remove(id: string, usuario: string): Promise<void> {
    const carga = await this.findOne(id);

    carga.activo = false;

    carga.actualizadoPor = usuario;
    await this.cargaRepository.save(carga);
  }
}
