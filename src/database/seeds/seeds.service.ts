import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoInstalacion } from '../../modules/tipos-instalaciones/entities/tipo-instalacion.entity';
import { TipoAmbiente } from '../../modules/tipos-ambientes/entities/tipo-ambiente.entity';
import { TipoArtefacto } from '../../modules/tipos-artefactos/entities/tipo-artefacto.entity';
import * as fs from 'fs';
import * as path from 'path';

interface TipoInstalacionSeed {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

interface TipoAmbienteSeed {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  tipoInstalacion_Id: number;
}

interface TipoArtefactoSeed {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  tipoAmbiente_Id: number;
  potencia: number;
}

function getSeedFilePath(filename: string): string {
  const distPath = path.join(
    process.cwd(),
    'dist',
    'src',
    'database',
    'seeds',
    filename,
  );
  const srcPath = path.join(
    process.cwd(),
    'src',
    'database',
    'seeds',
    filename,
  );
  return fs.existsSync(distPath) ? distPath : srcPath;
}

const tiposInstalaciones = JSON.parse(
  fs.readFileSync(getSeedFilePath('TiposInstalacion.json'), 'utf-8'),
) as TipoInstalacionSeed[];

const tiposAmbientes = JSON.parse(
  fs.readFileSync(getSeedFilePath('TiposAmbientes.json'), 'utf-8'),
) as TipoAmbienteSeed[];

const tiposArtefactos = JSON.parse(
  fs.readFileSync(getSeedFilePath('TiposArtefactos.json'), 'utf-8'),
) as TipoArtefactoSeed[];

@Injectable()
export class SeedsService {
  constructor(
    @InjectRepository(TipoInstalacion)
    private readonly tipoInstalacionRepository: Repository<TipoInstalacion>,
    @InjectRepository(TipoAmbiente)
    private readonly tipoAmbienteRepository: Repository<TipoAmbiente>,
    @InjectRepository(TipoArtefacto)
    private readonly tipoArtefactoRepository: Repository<TipoArtefacto>,
  ) {}

  async seed(): Promise<void> {
    try {
      // Verificar si ya existen datos
      const [instalacionesCount, ambientesCount, artefactosCount] =
        await Promise.all([
          this.tipoInstalacionRepository.count(),
          this.tipoAmbienteRepository.count(),
          this.tipoArtefactoRepository.count(),
        ]);

      if (instalacionesCount === 0) {
        await this.seedTiposInstalaciones();
      }

      if (ambientesCount === 0) {
        await this.seedTiposAmbientes();
      }

      if (artefactosCount === 0) {
        await this.seedTiposArtefactos();
      }
    } catch (error) {
      console.error('Error al realizar el seed:', error);
      throw error;
    }
  }

  private async seedTiposInstalaciones(): Promise<void> {
    const instalaciones = tiposInstalaciones.map((instalacion) => ({
      id: instalacion.id.toString(),
      nombre: instalacion.nombre,
      descripcion: instalacion.descripcion,
      activo: instalacion.activo,
      creadoPor: 'SEED',
      actualizadoPor: 'SEED',
    }));

    await this.tipoInstalacionRepository.save(instalaciones);
    console.log('Tipos de instalaciones sembrados correctamente');
  }

  private async seedTiposAmbientes(): Promise<void> {
    const ambientes = tiposAmbientes.map((ambiente) => ({
      id: ambiente.id.toString(),
      nombre: ambiente.nombre,
      descripcion: ambiente.descripcion,
      activo: ambiente.activo,
      tipoInstalacion: { id: ambiente.tipoInstalacion_Id.toString() },
      creadoPor: 'SEED',
      actualizadoPor: 'SEED',
    }));

    await this.tipoAmbienteRepository.save(ambientes);
    console.log('Tipos de ambientes sembrados correctamente');
  }

  private async seedTiposArtefactos(): Promise<void> {
    const artefactos = tiposArtefactos.map((artefacto) => ({
      id: artefacto.id.toString(),
      nombre: artefacto.nombre,
      descripcion: artefacto.descripcion,
      activo: artefacto.activo,
      potencia: artefacto.potencia,
      tipoAmbiente: { id: artefacto.tipoAmbiente_Id.toString() },
      creadoPor: 'SEED',
      actualizadoPor: 'SEED',
    }));

    await this.tipoArtefactoRepository.save(artefactos);
    console.log('Tipos de artefactos sembrados correctamente');
  }

  async onModuleInit() {
    try {
      console.log('Iniciando seeds...');

      // Convertir IDs numéricos a strings para tipos_instalaciones
      const tiposInstalacionesFormateados = tiposInstalaciones.map((tipo) => ({
        ...tipo,
        id: tipo.id.toString(),
      }));
      await this.tipoInstalacionRepository.save(tiposInstalacionesFormateados);
      console.log('Seeds de tipos_instalaciones completados.');

      // Convertir IDs numéricos a strings para tipos_ambientes
      const tiposAmbientesFormateados = tiposAmbientes.map((tipo) => ({
        ...tipo,
        id: tipo.id.toString(),
        tipoInstalacion: { id: tipo.tipoInstalacion_Id.toString() },
      }));
      await this.tipoAmbienteRepository.save(tiposAmbientesFormateados);
      console.log('Seeds de tipos_ambientes completados.');

      // Convertir IDs numéricos a strings para tipos_artefactos
      const tiposArtefactosFormateados = tiposArtefactos.map((tipo) => ({
        ...tipo,
        id: tipo.id.toString(),
        nombre: tipo.nombre,
        potencia: tipo.potencia,
        tipoAmbiente: { id: tipo.tipoAmbiente_Id.toString() },
      }));
      await this.tipoArtefactoRepository.save(tiposArtefactosFormateados);
      console.log('Seeds de tipos_artefactos completados.');
    } catch (error) {
      console.error('Error al ejecutar seeds:', error);
    }
  }
}
