import os
from pathlib import Path
import shutil
from mutagen.easyid3 import EasyID3
import re

def sanitize_filename(filename: str) -> str:
    safe_name = re.sub(r'[<>:"/\\|?*]', '-', filename)
    safe_name = re.sub(r'\s+', ' ', safe_name)
    return safe_name.strip()

def file_formatter(file_path, enumerate=False):
    file = EasyID3(file_path)
    new_filename = ""

    artista = file.get('artist')[0]
    titulo = file.get('title')[0]

    if enumerate:
        basename = os.path.basename(str(file_path))
        track_number = basename.split('|')[1].split(' - ')[0]
        new_filename = f"{track_number}. {artista} - {titulo}"
    else:
        new_filename = f"{artista} - {titulo}"

    new_file_path = file_path.with_name(f"{sanitize_filename(new_filename)}.mp3")
    file_path.rename(new_file_path)
    
    
def move_files_to_parent(folder):
    folder_path = Path(folder)
    for file_path in folder_path.rglob('*'):
        if file_path.is_file():
            if file_path.parent != folder_path:
                destino = folder_path / file_path.name
                
                if destino.exists():
                    pass
                else:
                    shutil.move(str(file_path), str(destino))
    
    for subfolder in folder_path.iterdir():
        if subfolder.is_dir():
            shutil.rmtree(subfolder)
            
