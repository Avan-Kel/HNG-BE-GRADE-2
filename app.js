const express = require('express');
const fs = require('fs');
require('dotenv').config();
const countryRoutes = require('./routes/countryRoutes');
const db = require('./utils/db');

const app = express();
app.use(express.json());

// Ensure cache directory exists
if (!fs.existsSync('cache')) fs.mkdirSync('cache');

// --- Automatically create countries table ---
async function ensureTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS countries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      capital VARCHAR(255),
      region VARCHAR(255),
      population BIGINT NOT NULL,
      currency_code VARCHAR(10),
      exchange_rate DECIMAL(15,2),
      estimated_gdp DECIMAL(20,2),
      flag_url VARCHAR(255),
      last_refreshed_at DATETIME,
      UNIQUE KEY unique_name (name)
    )
  `;
  await db.query(sql);
  console.log('✅ Countries table ready');
}

// Start server only after table exists
ensureTable()
  .then(() => {
    app.use('/', countryRoutes);

    // Global error handler
    app.use((err, req, res, next) => {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Failed to create table:', err);
    process.exit(1);
  });
