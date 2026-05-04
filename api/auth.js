// api/auth.js — troca o code OAuth pelo access_token
// Client Secret fica SOMENTE aqui, nunca exposto no frontend

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://venturacastropedro-collab.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { code, redirect_uri } = req.body;
  if (!code) return res.status(400).json({ error: 'Código não informado' });

  try {
    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.MP_CLIENT_ID,
        client_secret: process.env.MP_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.access_token) {
      return res.status(400).json({ error: data.message || 'Falha ao obter token' });
    }

    // Retorna só o necessário, nunca o client_secret
    return res.status(200).json({
      access_token: data.access_token,
      expires_in: data.expires_in,
      user_id: data.user_id,
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
