export default function handler(req, res) {
  console.log("📥 Body recebido:", JSON.stringify(req.body, null, 2)); // 👈 ADICIONE ISSO

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { variables } = req.body;
  const CEP_usuario = variables?.CEP_usuario;

  if (!CEP_usuario) {
    return res.status(400).json({ reply: "❌ CEP não fornecido." });
  }

  const prefixo = CEP_usuario.substring(0, 3);

  const representantes = [
    { nome: "Rafa", prefixos: ["227", "228", "229"], cidade: "Rio de Janeiro", whatsapp: "https://wa.me/5521999999999" },
    { nome: "Mela", prefixos: ["968", "970"], cidade: "Canoas", whatsapp: "https://wa.me/5551999999999" },
    { nome: "Guilherme", prefixos: ["880", "881"], cidade: "Joinville", whatsapp: "https://wa.me/5547999999999" }
  ];

  const representante = representantes.find(rep => rep.prefixos.includes(prefixo));

  const resposta = representante
    ? `✅ Representante encontrado para o CEP ${CEP_usuario}:\n📍 *${representante.nome}* – ${representante.cidade}\n📞 WhatsApp: ${representante.whatsapp}`
    : `⚠️ Nenhum representante encontrado para o CEP ${CEP_usuario}. Entre em contato com o atendimento.`;

  return res.status(200).json({ reply: resposta });
}
