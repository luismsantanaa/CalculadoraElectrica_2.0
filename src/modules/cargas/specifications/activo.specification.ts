import { BaseSpecification } from '../../../common/specifications/base.specification';
import { Carga } from '../entities/cargas.entity';
import { SelectQueryBuilder } from 'typeorm';

export class ActivoSpecification extends BaseSpecification<Carga> {
  constructor(private readonly activo: boolean = true) {
    super();
  }

  isSatisfiedBy(entity: Carga): boolean {
    return entity.activo === this.activo;
  }

  toQueryBuilder(
    queryBuilder: SelectQueryBuilder<Carga>,
  ): SelectQueryBuilder<Carga> {
    return queryBuilder.andWhere('carga.activo = :activo', {
      activo: this.activo,
    });
  }
}
