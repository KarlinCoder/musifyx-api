import axios from "axios";
import { Request, Response } from "express";
import { DEEZER_API_URL } from "../config";
import { getChatbotSystemPrompt } from "../lib/utils";

const apiKey = process.env.POLLINATIONS_API_KEY;

const SYSTEM_PROMPT = getChatbotSystemPrompt();

export const getRecomendation = async (req: Request, res: Response) => {
  try {
    const { message, username } = req.body;

    if (!message || typeof message !== "string" || message.trim().length < 3) {
      return res.status(400).json({
        error:
          "El campo 'message' es requerido y debe tener al menos 3 caracteres",
      });
    }

    if (!username || typeof username !== "string") {
      return res.status(400).json({
        error: "El campo 'username' es requerido y debe ser texto",
      });
    }

    const { data } = await axios.post(
      "https://gen.pollinations.ai/v1/chat/completions",
      {
        model: "perplexity-fast",
        messages: [
          { role: "system", content: SYSTEM_PROMPT.trim() },
          {
            role: "user",
            content: `Petición del usuario: ${message.trim()}, nombre del usuario: ${username}`,
          },
        ],
        cache_control: { type: "ephemeral" },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          // 3. Encabezados estándar para evitar caché en proxies/CDN
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          // 4. Encabezado custom (si Pollinations lo respeta) para forzar no-caché
          "X-No-Cache": "true",
        },
        // 5. (Opcional pero recomendado) Añadir timestamp a la URL como query param
        // Esto garantiza que la petición sea única a nivel de red, rompiendo cualquier caché HTTP estricta
        params: {
          _t: Date.now(),
        },
      },
    );

    const parsedJson = JSON.parse(data.choices[0].message.content);
    const result = await Promise.allSettled(
      parsedJson.recomendations.map(async (item) => {
        const { data } = await axios.get(
          `${DEEZER_API_URL}/search/${item.type}?q=${encodeURIComponent(`${item.artist} ${item.title ? item.title : ""}`)}`,
          {
            headers: {
              Origin: "https://musify.karlincoder.com",
            },
          },
        );

        return data.data[0];
      }),
    );

    const finalResult = result
      .filter((res) => res.status === "fulfilled")
      .map((res) => res.value);

    const finalResponse = {
      message: parsedJson.message,
      recomendations: [...finalResult],
    };
    return res.json(finalResponse);
  } catch (error) {
    return res.json({ status: 400, message: error.message });
  }
};
