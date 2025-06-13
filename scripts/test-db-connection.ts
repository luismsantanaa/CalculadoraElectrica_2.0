import { config } from 'dotenv';
import { createConnection } from 'mysql2/promise';
import { resolve } from 'path';
import * as fs from 'fs';

async function testConnection() {
  try {
    // Mostrar la ruta del archivo .env
    const envPath = resolve(__dirname, '../.env');
    console.log('Buscando archivo .env en:', envPath);

    // Verificar si el archivo existe
    if (!fs.existsSync(envPath)) {
      throw new Error(`El archivo .env no existe en la ruta: ${envPath}`);
    }

    // Leer el contenido del archivo .env
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('\nContenido del archivo .env:');
    console.log(envContent);

    // Cargar variables de entorno
    const result = config({ path: envPath });

    if (result.error) {
      throw new Error(
        `Error al cargar el archivo .env: ${result.error.message}`,
      );
    }

    // Obtener configuración de la base de datos
    const dbConfig = {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    };

    console.log('Configuración de la base de datos:');
    console.log('Host:', dbConfig.host);
    console.log('Puerto:', dbConfig.port);
    console.log('Usuario:', dbConfig.user);
    console.log('Base de datos:', dbConfig.database);
    console.log('Contraseña:', dbConfig.password ? '******' : 'No configurada');

    // Intentar conexión
    const connection = await createConnection(dbConfig);
    console.log('✅ Conexión exitosa a la base de datos!');

    // Obtener información de la versión
    const [rows] = await connection.execute('SELECT VERSION() as version');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log('Versión de MariaDB:', (rows as any)[0].version);

    // Cerrar conexión
    await connection.end();
  } catch (error) {
    console.error('\n❌ Error al conectar a la base de datos:');
    console.error(error);
    process.exit(1);
  }
}
// Ejecutar el test
testConnection().catch((error) => {
  console.error('Error al ejecutar el test:', error);
  process.exit(1);
});
