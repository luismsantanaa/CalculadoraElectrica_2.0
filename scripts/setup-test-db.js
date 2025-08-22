const mysql = require('mysql2/promise');

async function setupTestDatabase() {
  console.log('🔧 Setting up test database...');

  try {
    // Conectar a MariaDB
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'electridom',
      password: 'electridom',
    });

    // Crear base de datos de test si no existe
    await connection.execute('CREATE DATABASE IF NOT EXISTS electridom_test');
    console.log('✅ Test database created/verified');

    // Usar la base de datos de test
    await connection.execute('USE electridom_test');
    console.log('✅ Using test database');

    // Verificar que las tablas existen (se crearán automáticamente con synchronize: true)
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📊 Found ${tables.length} tables in test database`);

    await connection.end();
    console.log('✅ Test database setup completed');
  } catch (error) {
    console.error('❌ Error setting up test database:', error.message);
    console.log('💡 Make sure MariaDB is running and credentials are correct');
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupTestDatabase();
}

module.exports = { setupTestDatabase };
