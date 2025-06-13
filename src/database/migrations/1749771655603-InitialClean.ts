import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialClean1749771655603 implements MigrationInterface {
  name = 'InitialClean1749771655603';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`ambiente\` (\`id\` uuid NOT NULL, \`nombre\` varchar(100) NOT NULL, \`descripcion\` varchar(255) NULL, \`tipo_ambiente_id\` uuid NOT NULL, \`tipoSuperficie\` enum ('Rectangular', 'Circular', 'Triangular', 'Irregular') NOT NULL DEFAULT 'Rectangular', \`largo\` float NULL, \`ancho\` float NULL, \`area\` float NULL, \`altura\` float NULL, \`nivel\` varchar(255) NULL, \`proyecto_id\` varchar(255) NOT NULL, \`activo\` tinyint NOT NULL DEFAULT 1, \`fechaCreacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`fechaActualizacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`creadoPor\` varchar(255) NULL, \`actualizadoPor\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`cargas\` (\`id\` uuid NOT NULL, \`voltaje\` int NULL, \`horasUso\` int NULL, \`kwhMensual\` float NOT NULL, \`observaciones\` varchar(255) NULL, \`proyecto_id\` varchar(255) NOT NULL, \`activo\` tinyint NOT NULL DEFAULT 1, \`fechaCreacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`fechaActualizacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`creadoPor\` varchar(255) NULL, \`actualizadoPor\` varchar(255) NULL, \`tipo_ambiente_id\` uuid NULL, \`tipo_artefacto_id\` uuid NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_instalaciones\` DROP COLUMN \`fecha_creacion\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_instalaciones\` DROP COLUMN \`fecha_actualizacion\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_instalaciones\` DROP COLUMN \`creado_por\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_instalaciones\` DROP COLUMN \`actualizado_por\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` DROP COLUMN \`descripcion\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` DROP COLUMN \`fecha_creacion\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` DROP COLUMN \`fecha_actualizacion\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` DROP COLUMN \`creado_por\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` DROP COLUMN \`actualizado_por\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` DROP COLUMN \`tipo_instalacion_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` DROP COLUMN \`descripcion\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` DROP COLUMN \`fecha_creacion\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` DROP COLUMN \`fecha_actualizacion\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` DROP COLUMN \`creado_por\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` DROP COLUMN \`actualizado_por\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` DROP COLUMN \`tipo_ambiente_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_instalaciones\` ADD \`fechaCreacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_instalaciones\` ADD \`creadoPor\` varchar(100) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_instalaciones\` ADD \`fechaActualizacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_instalaciones\` ADD \`actualizadoPor\` varchar(100) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` ADD \`fechaCreacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` ADD \`creadoPor\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` ADD \`fechaActualizacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` ADD \`actualizadoPor\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` ADD \`tipoInstalacion_Id\` uuid NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` ADD \`voltaje\` decimal(10,2) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` ADD \`fechaCreacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` ADD \`creadoPor\` varchar(100) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` ADD \`fechaActualizacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` ADD \`actualizadoPor\` varchar(100) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` ADD \`tipoAmbiente_id\` uuid NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_instalaciones\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_instalaciones\` DROP COLUMN \`id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_instalaciones\` ADD \`id\` uuid NOT NULL PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_instalaciones\` CHANGE \`activo\` \`activo\` tinyint NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(`ALTER TABLE \`tipos_ambientes\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` DROP COLUMN \`id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` ADD \`id\` uuid NOT NULL PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` CHANGE \`activo\` \`activo\` tinyint NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` DROP COLUMN \`id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` ADD \`id\` uuid NOT NULL PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` CHANGE \`activo\` \`activo\` tinyint NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` ADD CONSTRAINT \`FK_34de0aa2c907e3c253d842d5148\` FOREIGN KEY (\`tipoInstalacion_Id\`) REFERENCES \`tipos_instalaciones\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` ADD CONSTRAINT \`FK_46d19cb1f926335efbe76890a46\` FOREIGN KEY (\`tipoAmbiente_id\`) REFERENCES \`tipos_ambientes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ambiente\` ADD CONSTRAINT \`FK_e247dfac4e068b2266e787354a7\` FOREIGN KEY (\`tipo_ambiente_id\`) REFERENCES \`tipos_ambientes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cargas\` ADD CONSTRAINT \`FK_2fd25202f4542073677c451d9bd\` FOREIGN KEY (\`tipo_ambiente_id\`) REFERENCES \`tipos_ambientes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cargas\` ADD CONSTRAINT \`FK_fa27c9568f9cc6a40e5d70040ba\` FOREIGN KEY (\`tipo_artefacto_id\`) REFERENCES \`tipos_artefactos\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`cargas\` DROP FOREIGN KEY \`FK_fa27c9568f9cc6a40e5d70040ba\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cargas\` DROP FOREIGN KEY \`FK_2fd25202f4542073677c451d9bd\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ambiente\` DROP FOREIGN KEY \`FK_e247dfac4e068b2266e787354a7\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` DROP FOREIGN KEY \`FK_46d19cb1f926335efbe76890a46\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` DROP FOREIGN KEY \`FK_34de0aa2c907e3c253d842d5148\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` CHANGE \`activo\` \`activo\` tinyint(1) NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` DROP COLUMN \`id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` ADD \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` ADD PRIMARY KEY (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` CHANGE \`activo\` \`activo\` tinyint(1) NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` DROP COLUMN \`id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` ADD \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` ADD PRIMARY KEY (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_instalaciones\` CHANGE \`activo\` \`activo\` tinyint(1) NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_instalaciones\` DROP COLUMN \`id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_instalaciones\` ADD \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_instalaciones\` ADD PRIMARY KEY (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` DROP COLUMN \`tipoAmbiente_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` DROP COLUMN \`actualizadoPor\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` DROP COLUMN \`fechaActualizacion\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` DROP COLUMN \`creadoPor\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` DROP COLUMN \`fechaCreacion\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` DROP COLUMN \`voltaje\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` DROP COLUMN \`tipoInstalacion_Id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` DROP COLUMN \`actualizadoPor\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` DROP COLUMN \`fechaActualizacion\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` DROP COLUMN \`creadoPor\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` DROP COLUMN \`fechaCreacion\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_instalaciones\` DROP COLUMN \`actualizadoPor\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_instalaciones\` DROP COLUMN \`fechaActualizacion\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_instalaciones\` DROP COLUMN \`creadoPor\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_instalaciones\` DROP COLUMN \`fechaCreacion\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` ADD \`tipo_ambiente_id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` ADD \`actualizado_por\` varchar(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` ADD \`creado_por\` varchar(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` ADD \`fecha_actualizacion\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` ADD \`fecha_creacion\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` ADD \`descripcion\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` ADD \`tipo_instalacion_id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` ADD \`actualizado_por\` varchar(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` ADD \`creado_por\` varchar(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` ADD \`fecha_actualizacion\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` ADD \`fecha_creacion\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` ADD \`descripcion\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_instalaciones\` ADD \`actualizado_por\` varchar(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_instalaciones\` ADD \`creado_por\` varchar(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_instalaciones\` ADD \`fecha_actualizacion\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_instalaciones\` ADD \`fecha_creacion\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP()`,
    );
    await queryRunner.query(`DROP TABLE \`cargas\``);
    await queryRunner.query(`DROP TABLE \`ambiente\``);
  }
}
