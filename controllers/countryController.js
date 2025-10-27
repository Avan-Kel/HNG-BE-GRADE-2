const countryModel = require('../models/countryModel');
const { refreshCountries } = require('../services/countryService');
const fs = require('fs');

async function refresh(req, res) {
  try {
    const countries = await refreshCountries();
    res.json({ message: 'Countries refreshed', total: countries.length });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function getAll(req, res) {
  const { region, currency, sort } = req.query;
  const countries = await countryModel.getAllCountries({ region, currency }, sort);
  res.json(countries);
}

async function getByName(req, res) {
  const country = await countryModel.getCountryByName(req.params.name);
  if (!country) return res.status(404).json({ error: 'Country not found' });
  res.json(country);
}

async function deleteByName(req, res) {
  const deleted = await countryModel.deleteCountryByName(req.params.name);
  if (!deleted) return res.status(404).json({ error: 'Country not found' });
  res.json({ message: 'Country deleted' });
}

async function status(req, res) {
  const stats = await countryModel.getStatus();
  res.json({
    total_countries: stats.total,
    last_refreshed_at: stats.last_refreshed_at
  });
}

async function getImage(req, res) {
  if (!fs.existsSync('cache/summary.png')) return res.status(404).json({ error: 'Summary image not found' });
  res.sendFile(require('path').resolve('cache/summary.png'));
}

module.exports = { refresh, getAll, getByName, deleteByName, status, getImage };
