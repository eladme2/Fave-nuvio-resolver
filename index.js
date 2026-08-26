const axios = require('axios');
const cheerio =quire('cheerio');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const urlPath = req.url || '';

  if (urlPath.includes('manifest.json')) {
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
    return res.status(200).json(decoderManifest);
  }

  if (urlPath.includes('/stream/')) {
    try {
      const parts = urlPath.split('/');
      const idWithExt = parts[parts.length - 1];
      const idClean = idWithExt.replace('.json', '');
      const encodedLink = idClean.replace('fv_', '');

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

      return res.status(200).json({ streams: uniqueStreams });
    } catch (error) {
      console.error('Error processing stream:', error.message);
      return res.status(200).json({ streams: [] });
    }
  }

  return res.status(404).json({ error: 'Not Found' });
};
