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
//
