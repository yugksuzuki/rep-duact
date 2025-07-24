import fs from "fs";
import path from "path";
import axios from "axios";
import Papa from "papaparse";

// Função de Haversine para calcular distância em km
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = deg => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Carrega representantes do CSV com PapaParse
function carregarRepresentantes() {
  const filePath = path.resolve("./public", "ceps.csv");
  const csvContent = fs.readFileSync(filePath, "utf8");
  const parsed = Papa.parse(csvContent, { header: true });

  return parsed.data
    .filter(row => row.Latitude && row.Longitude)
    .map(row => ({
      nome: row.REPRESENTANTE,
      cidade: row.CIDADE,
      estado: row.ESTADO,
      celular: row.CELULAR,
      lat: parseFloat(row.Latitude),
      lon: parseFloat(row.Longitude),
    }));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ reply: "❌ Método não permitido. Use POST." });
  }

  const { variables } = req.body;
  const CEP_usuario = variables?.CEP_usuario?.replace(/\D/g, "");

  if (!CEP_usuario || CEP_usuario.length < 8) {
    return res.status(200).json({ reply: "❌ CEP inválido ou incompleto. Tente novamente." });
  }

  // 🔐 Chave fixa do OpenCage
  const OPENCAGE_KEY = "24d5173c43b74f549f4c6f5b263d52b3";
  const geoURL = `https://api.opencagedata.com/geocode/v1/json?q=${CEP_usuario}&countrycode=br&key=${OPENCAGE_KEY}`;
  let latCliente, lonCliente;

  try {
    const geoResp = await axios.get(geoURL);
    const coords = geoResp?.data?.results?.[0]?.geometry;
    if (!coords) throw new Error("Não localizado");
    latCliente = coords.lat;
    lonCliente = coords.lng;
  } catch (err) {
    return res.status(200).json({
      reply: "❌ Não foi possível localizar o CEP informado. Verifique se está correto.",
    });
  }

  const lista = carregarRepresentantes();

  let maisProximo = null;
  let menorDistancia = Infinity;

  for (const rep of lista) {
    const dist = haversine(latCliente, lonCliente, rep.lat, rep.lon);
    if (dist < menorDistancia) {
      menorDistancia = dist;
      maisProximo = { ...rep, distancia: dist };
    }
  }

  if (maisProximo && maisProximo.distancia <= 200) {
    return res.status(200).json({
      reply: `✅ Representante mais próximo do CEP ${CEP_usuario}:\n\n📍 *${maisProximo.nome}* – ${maisProximo.cidade}/${maisProximo.estado}\n📞 WhatsApp: https://wa.me/55${maisProximo.celular}\n📏 Distância: ${maisProximo.distancia.toFixed(1)} km`,
    });
  }

  return res.status(200).json({
    reply: `❗ Nenhum representante encontrado em até 200 km.\n\nPara assuntos gerais, por favor entre em contato com nosso atendimento:\n☎️ *Everson*\n+55 (48) 9211-0383`,
  });
}
