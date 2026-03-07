import base64
from datetime import timedelta
import os
import requests
from syrics.api import Spotify

def ms_to_hms(milisegundos):
    td = timedelta(milliseconds=milisegundos)
    total_seconds = int(td.total_seconds())
    horas = total_seconds // 3600
    minutos = (total_seconds % 3600) // 60
    segundos = total_seconds % 60
    return f"{horas:02d}:{minutos:02d}:{segundos:02d}"


SP_DC = os.getenv('SP_DC', 'AQBmqMyhu4JymrH1dPiVrli-eFYoFWs7gDcrEBfOWubv7oKBywsfRr3MuotOJgcQwrzhZnf-bQU2RrMJpDW35QVbfxzh3O_qTR59uzte3cgzuVGvlZXTduzXKfAkjP1EwALLMKveGi3W7ljUTbTDAtt9doU7NaC428FCQue2IFOyQ9A7ZjwUFbiwuDVugil14jTOPuiZItUVUBA8wQ')
CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID', '86b67fe673cb4132b21e190524a3368f')
CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET', '5f9f8018f46c44d3bbaa81ba9197091c')

sp = Spotify(SP_DC)

def search_and_get_lyrics(termino_busqueda, synced_lyrics=False):
    try:
        auth_str = f"{CLIENT_ID}:{CLIENT_SECRET}"
        auth_bytes = auth_str.encode('ascii')
        auth_base64 = base64.b64encode(auth_bytes).decode('ascii')
        
        token_response = requests.post(
            'https://accounts.spotify.com/api/token', # URL corregida (sin espacios)
            headers={'Authorization': f'Basic {auth_base64}'},
            data={'grant_type': 'client_credentials'}
        )
        token_response.raise_for_status()
        access_token = token_response.json()['access_token']
    except Exception as e:
        return f"Error obteniendo token de Spotify: {e}"

    try:
        search_response = requests.get(
            'https://api.spotify.com/v1/search', 
            headers={'Authorization': f'Bearer {access_token}'},
            params={'q': termino_busqueda, 'type': 'track', 'limit': 1}
        )
        search_response.raise_for_status()
        data = search_response.json()
        
        if not data['tracks']['items']:
            return "No se encontró ninguna canción con ese nombre."
        
        track = data['tracks']['items'][0]
        track_id = track['id']
        track_name = track['name']
        artist_name = track['artists'][0]['name']
        
    except Exception as e:
        return f"Error buscando la canción: {e}"

    try:
        lyrics_data = sp.get_lyrics(track_id)
        
        if not lyrics_data or 'lyrics' not in lyrics_data:
            return f"No se encontraron letras para '{track_name}' de {artist_name}."
        
        lyrics_info = lyrics_data['lyrics']
        lines = lyrics_info.get('lines', [])
        is_synced = lyrics_info.get('syncType') == 'LINE_SYNCED'
        
        contenido_letra = ""
        
        if synced_lyrics and is_synced:
            for line in lines:
                start_ms = line.get('startTimeMs', '0')
                words = line.get('words', '')
                tiempo_formateado = ms_to_hms(int(start_ms))
                contenido_letra += f"[{tiempo_formateado}] {words}\n"
        else:
            for line in lines:
                words = line.get('words', '')
                contenido_letra += f"{words}\n"
                
        return contenido_letra.strip()

    except Exception as e:
        return f"Error obteniendo las letras: {e}"
