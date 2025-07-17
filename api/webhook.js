export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  console.log("📥 Corpo completo recebido:", JSON.stringify(req.body, null, 2));

  return res.status(200).json({ reply: "✅ JSON recebido com sucesso. Veja o log no console do Vercel." });
}
