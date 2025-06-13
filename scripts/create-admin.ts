import mysql, { RowDataPacket } from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { randomUUID } from 'crypto';
import {
  UserRole,
  UserStatus,
} from '../src/modules/users/entities/user.entity';

config();

interface AdminUser extends RowDataPacket {
  id: string;
}

interface DatabaseError extends Error {
  code?: string;
}

async function createAdminUser() {
  let connection: mysql.Connection | undefined;

  try {
    console.log('🔍 Conectando a la base de datos...');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USERNAME || 'lsantana',
      password: process.env.DB_PASSWORD || 'c@lculad0r@3',
      database: process.env.DB_DATABASE || 'calculadora-electrica',
    });

    console.log('✅ Conectado a MariaDB');

    // Verificar si ya existe un admin
    const [existingAdmin] = await connection.execute<AdminUser[]>(
      'SELECT id FROM users WHERE role = ? LIMIT 1',
      [UserRole.ADMIN],
    );

    if (existingAdmin.length > 0) {
      console.log('⚠️  Ya existe un usuario administrador');
      console.log('📋 Credenciales de administrador existentes:');
      console.log('   Usuario: admin');
      console.log('   Email: admin@calculadora-rd.com');
      console.log('   Contraseña: admin123');
      return;
    }

    // Generar UUID
    const uuid = randomUUID();

    // Hash de la contraseña
    console.log('🔐 Generando hash de contraseña...');
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Crear usuario administrador
    console.log('👤 Creando usuario administrador...');

    const adminData = {
      id: uuid,
      name: 'admin',
      email: 'admin@calculadora-rd.com',
      password: hashedPassword,
      nombre: 'Administrador',
      apellido: 'Sistema',
      role: UserRole.ADMIN,
      estado: UserStatus.ACTIVO,
      telefono: '+1-809-000-0000',
      empresa: 'Calculadora Eléctrica RD',
      cedula: '001-0000000-0',
    };

    await connection.execute(
      `
      INSERT INTO users (
        id, name, email, password, nombre, apellido,
        role, estado, telefono, empresa, cedula, fechaCreacion, fechaActualizacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `,
      [
        adminData.id,
        adminData.name,
        adminData.email,
        adminData.password,
        adminData.nombre,
        adminData.apellido,
        adminData.role,
        adminData.estado,
        adminData.telefono,
        adminData.empresa,
        adminData.cedula,
      ],
    );

    console.log('\n🎉 ¡Usuario administrador creado exitosamente!');
    console.log('\n📋 Credenciales de administrador:');
    console.log('   Usuario: admin');
    console.log('   Email: admin@calculadora-rd.com');
    console.log('   Contraseña: admin123');
    console.log(
      '\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login',
    );
  } catch (error) {
    const dbError = error as DatabaseError;
    console.error('❌ Error al crear usuario administrador:', dbError.message);

    if (dbError.code === 'ER_NO_SUCH_TABLE') {
      console.log('\n💡 Sugerencia: La tabla users no existe.');
      console.log(
        '   Ejecuta el backend primero para crear las tablas: npm start',
      );
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

createAdminUser().catch((error) => {
  console.error('Error en la ejecución:', error);
  process.exit(1);
});
