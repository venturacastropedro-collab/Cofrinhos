// api/mercadopago.js
// Aceita POST com token no body — resolve CORS definitivamente

module.exports = async function handler(req, res) {
  // CORS completo — permite GitHub Pages chamar a Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Preflight — browser sempre faz isso antes de POST com JSON
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Só aceita POST
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  // Lê endpoint e token do body JSON
  const { endpoint, token } = req.body || {};

  if (!endpoint) return res.status(400).json({ error: 'endpoint obrigatório' });

  // Token do usuário OAuth tem prioridade, fallback para variável de ambiente
  const accessToken = token || process.env.MP_ACCESS_TOKEN;
  if (!accessToken) return res.status(500).json({ error: 'Token não disponível' });

  // Whitelist de endpoints permitidos — somente leitura
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
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await mpRes.json();

    // Cache curto para não sobrecarregar a API do MP
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return res.status(mpRes.status).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
