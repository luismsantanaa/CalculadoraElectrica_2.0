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
      database: 'electridom', // Usar base de datos principal
    });

    console.log('✅ Connected to main database for testing');

    // Verificar que las tablas existen
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📊 Found ${tables.length} tables in database`);

    // Verificar tablas específicas necesarias para tests
    const requiredTables = [
      'projects',
      'project_versions',
      'users',
      'norm_rules',
      'rule_sets',
    ];
    const existingTables = tables.map((row) => Object.values(row)[0]);

    console.log('🔍 Checking required tables:');
    requiredTables.forEach((table) => {
      if (existingTables.includes(table)) {
        console.log(`  ✅ ${table}`);
      } else {
        console.log(`  ⚠️  ${table} (will be created by TypeORM)`);
      }
    });

    await connection.end();
    console.log('✅ Test database setup completed');
    console.log('💡 Using main database for tests (synchronize: true)');
  } catch (error) {
    console.error('❌ Error setting up test database:', error.message);
    console.log('💡 Make sure MariaDB is running and credentials are correct');
    console.log('💡 Using main database for tests as fallback');
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupTestDatabase();
}

module.exports = { setupTestDatabase };
