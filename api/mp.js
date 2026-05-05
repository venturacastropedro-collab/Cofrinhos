// api/mp.js
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const { endpoint, token } = req.body || {};
  if (!endpoint) return res.status(400).json({ error: 'endpoint obrigatório' });

  const accessToken = token || process.env.MP_ACCESS_TOKEN;
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
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const data = await mpRes.json();
    return res.status(mpRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
