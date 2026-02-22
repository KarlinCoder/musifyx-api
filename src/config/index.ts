export const DEEZER_API_URL =
  process.env.NODE_ENV === "development"
    ? "https://cors-anywhere.com/https://api.deezer.com"
    : "https://api.deezer.com";
