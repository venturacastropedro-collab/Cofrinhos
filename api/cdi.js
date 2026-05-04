// api/cdi.js
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const r = await fetch(
      'https://api.bcb.gov.br/dados/serie/bcdata.sgs.4389/dados/ultimos/5?formato=json'
    );
    const data = await r.json();
    res.setHeader('Cache-Control', 's-maxage=14400, stale-while-revalidate');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(200).json([{ valor: '0.042191', data: new Date().toLocaleDateString('pt-BR') }]);
  }
};
