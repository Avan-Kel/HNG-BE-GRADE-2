const axios = require('axios');
const countryModel = require('../models/countryModel');
const { generateSummaryImage } = require('../utils/imageGenerator');

async function refreshCountries() {
  let countriesData, exchangeData;

  try {
    // Fetch countries and exchange rates in parallel
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

    // Ensure exchange_rate is a number (0 if unavailable)
    const exchange_rate = currency_code && exchangeData[currency_code] 
      ? Number(exchangeData[currency_code]) 
      : 0;

    // Calculate estimated GDP safely
    let estimated_gdp = 0;
    if (c.population && exchange_rate > 0) {
      estimated_gdp = Number(c.population * (Math.random() * 1000 + 1000) / exchange_rate);
      if (isNaN(estimated_gdp)) estimated_gdp = 0;
    }

    const country = {
      name: c.name,
      capital: c.capital || null,
      region: c.region || null,
      population: c.population || 0,
      currency_code,
      exchange_rate,
      estimated_gdp,
      flag_url: c.flag || null
    };

    // Upsert country into database
    await countryModel.upsertCountry(country);
    processed.push(country);
  }

  // Generate summary image for all countries
  const allCountries = await countryModel.getAllCountries({}, 'gdp_desc');
  await generateSummaryImage(allCountries);

  return processed;
}

module.exports = { refreshCountries };
