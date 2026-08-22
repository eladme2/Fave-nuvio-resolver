const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());

// מניפסט התוסף
const decoderManifest = {
  id: 'org.nuvio.favez.decoder',
  version: '1.0.0',
  name: 'Favez Decoder Addon',
  description: 'מפענח דפי תוצאות וממיר לקישורי צפייה (PixelDrain/Gofile)',
  types: ['movie', 'series'],
  catalogs: [],
  resources: ['stream'],
  idPrefixes: ['fv_']
};

app.get('/manifest.json', (req, res) => {
  res.json(decoderManifest);
});

// נקודת הקצה של הסטרימים עבור Nuvio
app.get('/stream/:type/:id.json', async (req, res) => {
  const encodedLink = req.params.id.replace('fv_', '');
  
  try {
    const targetPageUrl = Buffer.from(encodedLink, 'base64').toString('utf8');

    const { data: html } = await axios.get(targetPageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });

    const $ = cheerio.load(html);
    const streams = [];

    $('a').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();

      if (href) {
        if (href.includes('pixeldrain.com')) {
          const match = href.match(/\/u\/([a-zA-Z0-9]+)/);
          if (match && match[1]) {
            streams.push({
              title: `PixelDrain - ${text || 'צפייה ישירה'}`,
              url: `https://pixeldrain.com/api/file/${match[1]}`
            });
          }
        } else if (href.includes('gofile.io') || href.includes('1fichier.com') || href.includes('usersdrive.com')) {
          streams.push({
            title: text || 'שרת הורדה',
            url: href
          });
        }
      }
    });

    const uniqueStreams = Array.from(new Set(streams.map(s => s.url)))
      .map(url => streams.find(s => s.url === url));

    res.json({ streams: uniqueStreams });
  } catch (error) {
    console.error('Decoding stream error:', error.message);
    res.json({ streams: [] });
  }
});

// ייצוא עבור Vercel Serverless
module.exports = app;
