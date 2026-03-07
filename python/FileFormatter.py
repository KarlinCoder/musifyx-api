import os
from pathlib import Path
import shutil
from mutagen.easyid3 import EasyID3


def file_formatter(file_path, enumerate=False):
    file = EasyID3(file_path)
    new_filename = ""

    artista = file.get('artist')[0]
    titulo = file.get('title')[0]

    if enumerate:
        basename = os.path.basename(str(file_path))
        track_number = basename.split('|')[1].split(' - ')[0]
        print(f"Track number: {track_number}")
        new_filename = f"{track_number}. {artista} - {titulo}"
    else:
        new_filename = f"{artista} - {titulo}"

    new_file_path = file_path.with_name(f"{new_filename}.mp3")
    file_path.rename(new_file_path)
    
    
def move_files_to_parent(folder):
    folder_path = Path(folder)
    for file_path in folder_path.rglob('*'):
        if file_path.is_file():
            if file_path.parent != folder_path:
                destino = folder_path / file_path.name
                
                if destino.exists():
                    print(f"Omitiendo: {file_path.name} ya existe en la raíz.")
                else:
                    shutil.move(str(file_path), str(destino))
                    print(f"Movido: {file_path.name}")
    
    for subfolder in folder_path.iterdir():
        if subfolder.is_dir():
            shutil.rmtree(subfolder)
            print(f"Carpeta eliminada: {subfolder.name}")