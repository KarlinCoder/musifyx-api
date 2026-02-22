import axios from "axios";
import { Request, Response } from "express";
import { DEEZER_API_URL } from "../config";

export const searchTracks = async (req: Request, res: Response) => {
  const q = req.query.q.toString();
  const limit = parseInt(req.query.limit?.toString());

  const { data } = await axios(
    `${DEEZER_API_URL}/search?q=${encodeURIComponent(q)}&limit=${limit ? limit : 40}`,
    {
      headers: { Origin: "https://musifyx.karlincoder.com" },
    },
  );

  return res.json(data);
};

export const searchAlbums = async (req: Request, res: Response) => {
  const q = req.query.q.toString();
  const limit = parseInt(req.query.limit?.toString());

  const { data } = await axios(
    `${DEEZER_API_URL}/search/album?q=${encodeURIComponent(q)}&limit=${limit ? limit : 40}`,
    {
      headers: { Origin: "https://musifyx.karlincoder.com" },
    },
  );

  return res.json(data);
};

export const searchArtists = async (req: Request, res: Response) => {
  const q = req.query.q.toString();
  const limit = parseInt(req.query.limit?.toString());

  const { data } = await axios(
    `${DEEZER_API_URL}/search/artist?q=${encodeURIComponent(q)}&limit=${limit ? limit : 40}`,
    {
      headers: { Origin: "https://musifyx.karlincoder.com" },
    },
  );

  return res.json(data);
};

export const searchPlaylists = async (req: Request, res: Response) => {
  const q = req.query.q.toString();
  const limit = parseInt(req.query.limit?.toString());

  const { data } = await axios(
    `${DEEZER_API_URL}/search/playlist?q=${encodeURIComponent(q)}&limit=${limit ? limit : 40}`,
    {
      headers: { Origin: "https://musifyx.karlincoder.com" },
    },
  );

  return res.json(data);
};

export const getAlbum = async (req: Request, res: Response) => {
  const id = req.params.id;

  const { data } = await axios(`${DEEZER_API_URL}/album/${id}`, {
    headers: { Origin: "https://musifyx.karlincoder.com" },
  });

  return res.json(data);
};

export const getArtist = async (req: Request, res: Response) => {
  const id = req.params.id;

  const { data } = await axios(`${DEEZER_API_URL}/artist/${id}`, {
    headers: { Origin: "https://musifyx.karlincoder.com" },
  });

  return res.json(data);
};

export const getArtistTop10 = async (req: Request, res: Response) => {
  const id = req.params.id;

  const { data } = await axios(`${DEEZER_API_URL}/artist/${id}/top?limit=10`, {
    headers: { Origin: "https://musifyx.karlincoder.com" },
  });

  return res.json(data);
};

export const getPlaylist = async (req: Request, res: Response) => {
  const id = req.params.id;

  const { data } = await axios(`${DEEZER_API_URL}/playlist/${id}/`, {
    headers: { Origin: "https://musifyx.karlincoder.com" },
  });

  return res.json(data);
};

export const getPopular = async (_req: Request, res: Response) => {
  const { data } = await axios(`${DEEZER_API_URL}/chart`, {
    headers: { Origin: "https://musifyx.karlincoder.com" },
  });

  return res.json(data);
};

export const getCharts = async (_req: Request, res: Response) => {
  const chartPlaylists = [
    { label: "Top Worldwide", playlistId: 3155776842 },
    { label: "Top USA", playlistId: 1313621735 },
    { label: "Top Brasil", playlistId: 1111141961 },
    { label: "Top Reino Unido", playlistId: 1111142221 },
    { label: "Top Alemania", playlistId: 1111143121 },
    { label: "Top Francia", playlistId: 1109890291 },
    { label: "Top USA", playlistId: 1313621735 },
    { label: "Top Colombia", playlistId: 1116188451 },
    { label: "Top Canadá", playlistId: 1313621735 },
    { label: "Top México", playlistId: 1111142361 },
    { label: "Top Holanda", playlistId: 1266971851 },
    { label: "Top USA", playlistId: 1313621735 },
    { label: "Top Sudáfrica", playlistId: 1362528775 },
    { label: "Top Jamaica", playlistId: 1362508575 },
    { label: "Top Venezuela", playlistId: 1362527605 },
    { label: "Top Ucrania", playlistId: 1362526495 },
    { label: "Top Túnez", playlistId: 1362525375 },
    { label: "Top Tailaindia", playlistId: 1362524475 },
    { label: "Top El Salvador", playlistId: 1362523615 },
    { label: "Top Senegal", playlistId: 1362523075 },
    { label: "Top Eslovenia", playlistId: 1362522355 },
    { label: "Top Arabia Saudita", playlistId: 1362521285 },
    { label: "Top Paraguay", playlistId: 1362520135 },
    { label: "Top Portugal", playlistId: 1362519755 },
    { label: "Top Filipinas", playlistId: 1362518895 },
    { label: "Top Perú", playlistId: 1362518525 },
    { label: "Top Malasia", playlistId: 1362515675 },
    { label: "Top Líbano", playlistId: 1362511155 },
    { label: "Top Corea del Sur", playlistId: 1362510315 },
    { label: "Top Japón", playlistId: 1362508955 },
    { label: "Top Jordania", playlistId: 1362508765 },
    { label: "Top Israel", playlistId: 1362507345 },
    { label: "Top Hungría", playlistId: 1362506695 },
    { label: "Top Egipto", playlistId: 1362501615 },
    { label: "Top Ecuador", playlistId: 1362501235 },
    { label: "Top Algeria", playlistId: 1362501015 },
    { label: "Top Bolivia", playlistId: 1362495515 },
    { label: "Top Bulgaria", playlistId: 1362494565 },
    { label: "Top Emiratos Árabes Unidos", playlistId: 1362491345 },
    { label: "Top Singapur", playlistId: 1313620765 },
    { label: "Top Noruega", playlistId: 1313619885 },
    { label: "Top Islandia", playlistId: 1313619455 },
    { label: "Top Dinamarca", playlistId: 1313618905 },
    { label: "Top Costa Rica", playlistId: 1313618455 },
    { label: "Top Suiza", playlistId: 1313617925 },
    { label: "Top Bélgica", playlistId: 1266968331 },
    { label: "Top Australia", playlistId: 1313616925 },
    { label: "Top Turquía", playlistId: 1116189071 },
    { label: "Top Rusia", playlistId: 1116189381 },
    { label: "Top Nigeria", playlistId: 1362516565 },
    { label: "Top Austria", playlistId: 1313615765 },
    { label: "Top Argentina", playlistId: 1279119721 },
    { label: "Top Indonesia", playlistId: 1116188761 },
    { label: "Top Italia", playlistId: 1116187241 },
    { label: "Top Chile", playlistId: 1279119121 },
    { label: "Top Guatemala", playlistId: 1279118671 },
    { label: "Top Rumanía", playlistId: 1279117071 },
    { label: "Top Eslovaquia", playlistId: 1266973701 },
    { label: "Top Serbia", playlistId: 1266972981 },
    { label: "Top Kenia", playlistId: 1362509215 },
    { label: "Top Polonia", playlistId: 1266972311 },
    { label: "Top Croacia", playlistId: 1266971131 },
    { label: "Top República Checa", playlistId: 1266969571 },
    { label: "Top Letonia", playlistId: 1221037511 },
    { label: "Top Lituania", playlistId: 1221037371 },
    { label: "Top Estonia", playlistId: 1221037201 },
    { label: "Top Finlandia", playlistId: 1221034071 },
    { label: "Top Honduras", playlistId: 1116190301 },
    { label: "Top Costa de Marfil", playlistId: 1362497945 },
  ];

  const results = await Promise.all(
    chartPlaylists.map(async ({ label, playlistId }) => {
      try {
        const { data } = await axios(
          `${DEEZER_API_URL}/playlist/${playlistId}`,
          {
            headers: { Origin: "https://musifyx.karlincoder.com" },
          },
        );
        return { label, playlistId, ...data };
      } catch (error) {
        console.error(`Error fetching playlist ${playlistId}:`, error);
        return { label, playlistId, error: true };
      }
    }),
  );

  return res.json(results);
};
