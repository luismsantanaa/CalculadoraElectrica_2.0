import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1753557558030 implements MigrationInterface {
  name = 'CreateTables1753557558030';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`tipos_instalaciones\` (\`id\` uuid NOT NULL, \`nombre\` varchar(100) NOT NULL, \`descripcion\` varchar(255) NULL, \`activo\` tinyint NOT NULL DEFAULT 1, \`fechaCreacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`creadoPor\` varchar(100) NULL, \`fechaActualizacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`actualizadoPor\` varchar(100) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`tipos_ambientes\` (\`id\` uuid NOT NULL, \`nombre\` varchar(100) NOT NULL, \`activo\` tinyint NOT NULL DEFAULT 1, \`fechaCreacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`creadoPor\` varchar(255) NULL, \`fechaActualizacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`actualizadoPor\` varchar(255) NULL, \`tipoInstalacion_Id\` uuid NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`tipos_artefactos\` (\`id\` uuid NOT NULL, \`nombre\` varchar(100) NOT NULL, \`potencia\` decimal(10,2) NOT NULL, \`voltaje\` decimal(10,2) NOT NULL, \`activo\` tinyint NOT NULL DEFAULT 1, \`fechaCreacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`creadoPor\` varchar(100) NULL, \`fechaActualizacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`actualizadoPor\` varchar(100) NULL, \`tipoAmbiente_id\` uuid NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` uuid NOT NULL, \`username\` varchar(50) NOT NULL, \`email\` varchar(100) NOT NULL, \`password\` varchar(255) NOT NULL, \`nombre\` varchar(50) NOT NULL, \`apellido\` varchar(50) NOT NULL, \`role\` enum ('admin', 'ingeniero', 'tecnico', 'cliente') NOT NULL DEFAULT 'cliente', \`estado\` enum ('activo', 'inactivo', 'suspendido') NOT NULL DEFAULT 'activo', \`telefono\` varchar(15) NULL, \`empresa\` varchar(200) NULL, \`cedula\` varchar(50) NULL, \`ultimoAcceso\` datetime NULL, \`fechaCreacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`fechaActualizacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` ADD CONSTRAINT \`FK_34de0aa2c907e3c253d842d5148\` FOREIGN KEY (\`tipoInstalacion_Id\`) REFERENCES \`tipos_instalaciones\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` ADD CONSTRAINT \`FK_46d19cb1f926335efbe76890a46\` FOREIGN KEY (\`tipoAmbiente_id\`) REFERENCES \`tipos_ambientes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cargas\` ADD CONSTRAINT \`FK_2fd25202f4542073677c451d9bd\` FOREIGN KEY (\`tipo_ambiente_id\`) REFERENCES \`tipos_ambientes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cargas\` ADD CONSTRAINT \`FK_fa27c9568f9cc6a40e5d70040ba\` FOREIGN KEY (\`tipo_artefacto_id\`) REFERENCES \`tipos_artefactos\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ambiente\` ADD CONSTRAINT \`FK_e247dfac4e068b2266e787354a7\` FOREIGN KEY (\`tipo_ambiente_id\`) REFERENCES \`tipos_ambientes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`ambiente\` DROP FOREIGN KEY \`FK_e247dfac4e068b2266e787354a7\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cargas\` DROP FOREIGN KEY \`FK_fa27c9568f9cc6a40e5d70040ba\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cargas\` DROP FOREIGN KEY \`FK_2fd25202f4542073677c451d9bd\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_artefactos\` DROP FOREIGN KEY \`FK_46d19cb1f926335efbe76890a46\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tipos_ambientes\` DROP FOREIGN KEY \`FK_34de0aa2c907e3c253d842d5148\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
    await queryRunner.query(`DROP TABLE \`tipos_artefactos\``);
    await queryRunner.query(`DROP TABLE \`tipos_ambientes\``);
    await queryRunner.query(`DROP TABLE \`tipos_instalaciones\``);
  }
}
