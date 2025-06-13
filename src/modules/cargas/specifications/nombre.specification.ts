import { BaseSpecification } from '../../../common/specifications/base.specification';
import { Carga } from '../entities/cargas.entity';
import { SelectQueryBuilder } from 'typeorm';

export class NombreSpecification extends BaseSpecification<Carga> {
  constructor(private readonly nombre: string) {
    super();
  }

  isSatisfiedBy(entity: Carga): boolean {
    return entity.tipoArtefacto.nombre
      .toLowerCase()
      .includes(this.nombre.toLowerCase());
  }

  toQueryBuilder(
    queryBuilder: SelectQueryBuilder<Carga>,
  ): SelectQueryBuilder<Carga> {
    return queryBuilder.andWhere('tipoArtefacto.nombre ILIKE :nombre', {
      nombre: `%${this.nombre}%`,
    });
  }
}
