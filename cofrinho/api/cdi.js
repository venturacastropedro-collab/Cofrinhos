// api/cdi.js
// Busca o CDI do Banco Central do Brasil
// API pública, mas proxy aqui garante cache e disponibilidade

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const bcbRes = await fetch(
      'https://api.bcb.gov.br/dados/serie/bcdata.sgs.4389/dados/ultimos/5?formato=json'
    );
    const data = await bcbRes.json();

    // Cache de 4 horas - CDI não muda dentro do dia
    res.setHeader('Cache-Control', 's-maxage=14400, stale-while-revalidate');
    return res.status(200).json(data);
  } catch (err) {
    // Fallback com CDI médio recente caso BCB esteja fora
    return res.status(200).json([{ valor: '0.042191', data: new Date().toLocaleDateString('pt-BR') }]);
  }
}
