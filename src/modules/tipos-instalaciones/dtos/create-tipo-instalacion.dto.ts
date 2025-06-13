import { IsString, IsOptional } from 'class-validator';

export class CreateTipoInstalacionDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}
