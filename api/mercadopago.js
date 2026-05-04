// api/mercadopago.js
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-mp-token');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });

  const { endpoint } = req.query;
  if (!endpoint) return res.status(400).json({ error: 'Endpoint não informado' });

  // Token vem no header x-mp-token (OAuth do usuário) ou variável de ambiente
  const accessToken = req.headers['x-mp-token'] || process.env.MP_ACCESS_TOKEN;
  if (!accessToken) return res.status(500).json({ error: 'Token não disponível' });

  const allowed = [
    '/v1/account/balance',
    '/v1/account/movements/search',
    '/v1/users/me',
  ];

  const decoded = decodeURIComponent(endpoint);
  const isAllowed = allowed.some(e => decoded.startsWith(e));
  if (!isAllowed) return res.status(403).json({ error: 'Endpoint não permitido' });

  try {
    const url = `https://api.mercadopago.com${decoded}`;
    const mpRes = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await mpRes.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(mpRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
