const axios = require('axios');
const countryModel = require('../models/countryModel');
const { generateSummaryImage } = require('../utils/imageGenerator');

async function refreshCountries() {
  let countriesData, exchangeData;

  try {
    const [countriesRes, exchangeRes] = await Promise.all([
      axios.get('https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies'),
      axios.get('https://open.er-api.com/v6/latest/USD')
    ]);

    countriesData = countriesRes.data;
    exchangeData = exchangeRes.data.rates;
  } catch (err) {
    const api = err.config?.url.includes('restcountries') ? 'Countries API' : 'Exchange API';
    throw { status: 503, message: `Could not fetch data from ${api}` };
  }

  const processed = [];

  for (const c of countriesData) {
    const currency_code = c.currencies?.[0]?.code || null;
    const exchange_rate = currency_code ? exchangeData[currency_code] || null : null;

    // Ensure estimated_gdp is always a number
    const estimated_gdp = (c.population && exchange_rate)
      ? Number((c.population * (Math.random() * 1000 + 1000)) / exchange_rate)
      : 0;

    const country = {
      name: c.name,
      capital: c.capital || null,
      region: c.region || null,
      population: c.population || 0,
      currency_code,
      exchange_rate: exchange_rate || 0,
      estimated_gdp,
      flag_url: c.flag || null
    };

    await countryModel.upsertCountry(country);
    processed.push(country);
  }

  // Generate summary image safely
  const allCountries = await countryModel.getAllCountries({}, 'gdp_desc');
  await generateSummaryImage(allCountries);

  return processed;
}

module.exports = { refreshCountries };
