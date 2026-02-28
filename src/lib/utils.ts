import fs from "node:fs";
import path from "node:path";

export const formatSecondsToMinutes = (seconds: number): string => {
  if (seconds < 0) seconds = 0;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export function formatDateToSpanish(date: string | Date): string {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return "Fecha inválida";
  }

  const day = d.getDate();
  const year = d.getFullYear();

  const monthName = d.toLocaleDateString("es-ES", { month: "long" });

  return `${day} de ${monthName} del ${year}`;
}

export const getChatbotSystemPrompt = () => {
  const filePath = "./src/prompts/chatbot_system_prompt.txt";

  try {
    const data = fs.readFileSync(filePath, "utf8");
    return data;
  } catch (err) {
    console.error(err);
  }
};
