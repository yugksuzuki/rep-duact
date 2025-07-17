export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { CEP_usuario } = req.body.variables || {};
  if (!CEP_usuario) {
    return res.status(400).json({ reply: "CEP não fornecido." });
  }

  const prefixo = CEP_usuario.substring(0, 3);

  const representantes = [
    { nome: "Rafa", prefixos: ["227", "228", "229"], cidade: "Rio de Janeiro", whatsapp: "https://wa.me/5521999999999" },
    { nome: "Mela", prefixos: ["968", "970"], cidade: "Canoas", whatsapp: "https://wa.me/5551999999999" },
    { nome: "Guilherme", prefixos: ["880", "881"], cidade: "Joinville", whatsapp: "https://wa.me/5547999999999" }
  ];

  const representante = representantes.find(rep => rep.prefixos.includes(prefixo));

  if (representante) {
    return res.status(200).json({
      reply: `✅ Representante encontrado para o CEP ${CEP_usuario}:
📍 *${representante.nome}* – ${representante.cidade}
📞 WhatsApp: ${representante.whatsapp}`
    });
  } else {
    return res.status(200).json({ reply: `⚠️ Nenhum representante encontrado para o CEP ${CEP_usuario}. Entre em contato com o atendimento.` });
  }
}