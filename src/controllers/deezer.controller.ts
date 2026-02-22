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

  res.json(data);
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

  res.json(data);
};
