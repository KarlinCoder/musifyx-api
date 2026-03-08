import json
from deezspot.deezloader import DeeLogin
import uuid
from pathlib import Path
import shutil
from client import deezer_downloader
import deezer
import os
from FileFormatter import file_formatter, move_files_to_parent

deezer_client = deezer.Client()

def download_album(albumId):
    try:
        download_id = uuid.uuid4()
        deezer_album = deezer_client.get_album(albumId)
        folder_name = f"{deezer_album.artist.name} - {deezer_album.title} ({deezer_album.release_date.year})"

        album_route = f"./downloads/albums/{download_id}/{folder_name}"

        deezer_downloader.download_albumdee(
            link_album=f'https://www.deezer.com/album/{albumId}',
            output_dir=album_route,
            quality_download='MP3_128',
            recursive_quality=True,
            recursive_download=True,
        )
        archivos = Path(album_route).iterdir()

        for archivo in archivos:
            if archivo.is_file():
                file_formatter(archivo, enumerate=True)

        move_files_to_parent(album_route)

        zip_path = shutil.make_archive(
            base_name=album_route,
            format="zip",
            root_dir=album_route
        )

        # ✅ Devolver JSON con la ruta relativa para servir vía HTTP
        result = {
            "success": True,
            "download_id": download_id,
            "zip_path": zip_path,
            "download_url": f"{os.getenv("HOSTNAME", "https://musify.api.karlincoder.com")}/downloads/albums/{download_id}",
        }
        print(json.dumps(result))  # ✅ Salida JSON para que Node.js la capture
        return result
    
    except Exception as e:
        # ✅ En caso de error, devolver JSON de error
        error_result = {"success": False, "error": str(e)}
        print(json.dumps(error_result))
        return error_result

    