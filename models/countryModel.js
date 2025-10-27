const db = require('../utils/db');

async function upsertCountry(country) {
  const sql = `
    INSERT INTO countries 
    (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, last_refreshed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      capital=VALUES(capital),
      region=VALUES(region),
      population=VALUES(population),
      currency_code=VALUES(currency_code),
      exchange_rate=VALUES(exchange_rate),
      estimated_gdp=VALUES(estimated_gdp),
      flag_url=VALUES(flag_url),
      last_refreshed_at=NOW()
  `;
  const params = [
    country.name,
    country.capital || null,
    country.region || null,
    country.population,
    country.currency_code,
    country.exchange_rate,
    country.estimated_gdp,
    country.flag_url || null
  ];
  await db.query(sql, params);
}

async function getAllCountries(filters = {}, sort) {
  let sql = 'SELECT * FROM countries WHERE 1=1';
  const params = [];
  if (filters.region) {
    sql += ' AND region = ?';
    params.push(filters.region);
  }
  if (filters.currency) {
    sql += ' AND currency_code = ?';
    params.push(filters.currency);
  }
  if (sort === 'gdp_desc') sql += ' ORDER BY estimated_gdp DESC';
  return (await db.query(sql, params))[0];
}

async function getCountryByName(name) {
  const [rows] = await db.query('SELECT * FROM countries WHERE LOWER(name) = LOWER(?)', [name]);
  return rows[0];
}

async function deleteCountryByName(name) {
  const [result] = await db.query('DELETE FROM countries WHERE LOWER(name) = LOWER(?)', [name]);
  return result.affectedRows > 0;
}

async function getStatus() {
  const [rows] = await db.query('SELECT COUNT(*) AS total, MAX(last_refreshed_at) AS last_refreshed_at FROM countries');
  return rows[0];
}

module.exports = {
  upsertCountry,
  getAllCountries,
  getCountryByName,
  deleteCountryByName,
  getStatus
};
