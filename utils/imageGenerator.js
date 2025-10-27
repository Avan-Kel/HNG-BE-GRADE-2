const { createCanvas } = require('canvas');
const fs = require('fs');

async function generateSummaryImage(countries) {
  const top5 = countries.slice(0, 5);
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, 800, 600);

  ctx.fillStyle = '#000';
  ctx.font = '24px Arial';
  ctx.fillText(`Total countries: ${countries.length}`, 50, 50);

  ctx.fillText('Top 5 by GDP:', 50, 100);
  top5.forEach((c, i) => {
    ctx.fillText(`${i+1}. ${c.name} - ${c.estimated_gdp?.toFixed(2) || 'N/A'}`, 50, 140 + i*40);
  });

  ctx.fillText(`Last refreshed: ${new Date().toISOString()}`, 50, 350);

  fs.writeFileSync('cache/summary.png', canvas.toBuffer('image/png'));
}

module.exports = { generateSummaryImage };
