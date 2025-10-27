const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const countryRoutes = require('./routes/countryRoutes');
const db = require('./utils/db');

const app = express();
app.use(express.json());

// Ensure cache directory exists
const cacheDir = path.resolve('cache');
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

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
    // --- Homepage ---
    app.get('/', (req, res) => {
      res.json({
        message: 'Welcome to the Countries API!',
        info: 'Use /countries to fetch data and /status for refresh info'
      });
    });

    // --- Country routes ---
    app.use('/', countryRoutes);

    // --- Serve summary image ---
    app.get('/countries/image', (req, res) => {
      const imagePath = path.join(cacheDir, 'summary.png');
      if (!fs.existsSync(imagePath)) {
        return res.status(404).json({ error: 'Summary image not found' });
      }
      res.sendFile(imagePath);
    });

    // --- Global error handler ---
    app.use((err, req, res, next) => {
      console.error(err);
      res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Failed to create table:', err);
    process.exit(1);
  });
