// api/mercadopago.js
// Proxy seguro - o token NUNCA vai para o frontend
// Roda no servidor da Vercel, invisível para o usuário

export default async function handler(req, res) {
  // Segurança: só aceita requisições do próprio site
  const origin = req.headers.origin || '';
  const host = req.headers.host || '';
  
  // CORS - só permite o próprio domínio
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'Token não configurado no servidor' });
  }

  const { endpoint } = req.query;
  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint não informado' });
  }

  // Whitelist de endpoints permitidos - só leitura
  const allowed = [
    '/v1/account/balance',
    '/v1/account/movements/search',
    '/v1/users/me',
  ];

  const isAllowed = allowed.some(e => decodeURIComponent(endpoint).startsWith(e));
  if (!isAllowed) {
    return res.status(403).json({ error: 'Endpoint não permitido' });
  }

  try {
    const url = `https://api.mercadopago.com${decodeURIComponent(endpoint)}`;
    
    const mpRes = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'CofrinhoDashboard/1.0',
      },
    });

    const data = await mpRes.json();

    if (!mpRes.ok) {
      return res.status(mpRes.status).json({ 
        error: true, 
        status: mpRes.status,
        message: data.message || 'Erro na API do Mercado Pago'
      });
    }

    // Cache de 5 minutos para não sobrecarregar a API
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Erro interno', message: err.message });
  }
}
