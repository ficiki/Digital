const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkConstraints() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'digitalisasi_bapb'
    });

    console.log('Checking foreign key constraints...');

    const [constraints] = await connection.execute(`
      SELECT
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE REFERENCED_TABLE_SCHEMA = ?
      AND (REFERENCED_TABLE_NAME = 'bapb' OR TABLE_NAME = 'bapb')
    `, [process.env.DB_NAME || 'digitalisasi_bapb']);

    console.log('Foreign key constraints:');
    console.log(JSON.stringify(constraints, null, 2));

    // Check if document_history has records for this BAPB
    const [history] = await connection.execute(
      'SELECT COUNT(*) as count FROM document_history WHERE jenis_dokumen = ? AND id_dokumen = ?',
      ['bapb', 29]
    );

    console.log('Document history records for BAPB 29:', history[0].count);

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkConstraints();
