const countryModel = require('../models/countryModel');
const { refreshCountries } = require('../services/countryService');
const fs = require('fs');
const path = require('path');

async function refresh(req, res) {
  try {
    const countries = await refreshCountries();
    res.json({ 
      message: 'Countries refreshed successfully', 
      total_countries: countries.length 
    });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Failed to refresh countries'
    });
  }
}

async function getAll(req, res) {
  try {
    const { region, currency, sort } = req.query;
    const countries = await countryModel.getAllCountries({ region, currency }, sort);
    res.json(countries || []);
  } catch (err) {
    console.error('Get all error:', err);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
}

async function getByName(req, res) {
  try {
    const country = await countryModel.getCountryByName(req.params.name);
    if (!country) return res.status(404).json({ error: 'Country not found' });
    res.json(country);
  } catch (err) {
    console.error('Get by name error:', err);
    res.status(500).json({ error: 'Failed to fetch country' });
  }
}

async function deleteByName(req, res) {
  try {
    const deleted = await countryModel.deleteCountryByName(req.params.name);
    if (!deleted) return res.status(404).json({ error: 'Country not found' });
    res.json({ message: 'Country deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete country' });
  }
}

async function status(req, res) {
  try {
    const stats = await countryModel.getStatus();
    res.json({
      total_countries: stats?.total || 0,
      last_refreshed_at: stats?.last_refreshed_at || null
    });
  } catch (err) {
    console.error('Status error:', err);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
}

async function getImage(req, res) {
  try {
    const imagePath = path.resolve('cache/summary.png');

    // Generate image if missing
    if (!fs.existsSync(imagePath)) {
      const countries = await countryModel.getAllCountries({}, 'gdp_desc');
      if (!countries || countries.length === 0) {
        return res.status(404).json({ error: 'No country data available to generate image' });
      }

      const { generateSummaryImage } = require('../utils/imageGenerator');
      await generateSummaryImage(countries);
    }

    res.setHeader('Content-Type', 'image/png');
    res.sendFile(imagePath);
  } catch (err) {
    console.error('Get image error:', err);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
}

module.exports = { refresh, getAll, getByName, deleteByName, status, getImage };
