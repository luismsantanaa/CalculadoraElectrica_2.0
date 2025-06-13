export declare enum SistemaElectricoEnum {
  MONOFASICO = 'MONOFASICO',
  BIFASICO = 'BIFASICO',
  TRIFASICO = 'TRIFASICO',
}

export declare enum TipoCircuitoEnum {
  ILUMINACION = 'iluminacion',
  TOMAS = 'tomas',
  AIRE_ACONDICIONADO = 'aire_acondicionado',
  MOTOR = 'motor',
  ESPECIAL = 'especial',
  ALIMENTADOR = 'alimentador',
}

export declare enum EstadoCircuitoEnum {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  MANTENIMIENTO = 'mantenimiento',
}

export declare enum TipoProteccionEnum {
  TERMOMAGNETICO = 'TERMOMAGNETICO',
  AFCI = 'AFCI',
  GFCI = 'GFCI',
  BIPOLAR = 'BIPOLAR',
}

export declare enum CalibreAWGEnum {
  AWG14 = 14,
  AWG12 = 12,
  AWG10 = 10,
  AWG8 = 8,
  AWG6 = 6,
  AWG4 = 4,
  AWG2 = 2,
}

export declare enum TipoInstalacionEnum {
  RESIDENCIAL = 'RESIDENCIAL',
  COMERCIAL = 'COMERCIAL',
  INDUSTRIAL = 'INDUSTRIAL',
}

export declare enum VoltajePrincipalEnum {
  MONOFASICO_110V = '110V',
  BIFASICO_110_220V = '110V/220V',
}

export declare enum TipoCircuitoGeneralEnum {
  TOMACORRIENTE_GENERAL = 'TUG',
  TOMACORRIENTE_ESPECIAL = 'TUE',
  ILUMINACION_GENERAL = 'IUG',
  ILUMINACION_ESPECIAL = 'IUE',
  AIRES_ACONDICIONADO = 'CA',
  EQUIPO_ESPECIAL = 'CE',
}

export enum tipoSuperficieEnum {
  RECTANGULAR = 'Rectangular',
  CIRCULAR = 'Circular',
  TRIANGULAR = 'Triangular',
  IRREGULAR = 'Irregular',
}
