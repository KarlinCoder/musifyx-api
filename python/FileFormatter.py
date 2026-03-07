from pathlib import Path
from mutagen.easyid3 import EasyID3
from pathlib import Path
import os

def file_formatter(file_path, enumerate=False):
    file = EasyID3(file_path)
    new_filename = ""

    if(enumerate):
        track_number = str(str(os.path.basename(file_path)).split('|')).split(" ")
        print(track_number)
        new_filename = f"{track_number}. {file.get('artist')[0]} - {file.get('title')[0]}"
    else:
        new_filename = f"{file.get('artist')[0]} - {file.get('title')[0]}"

    new_file_path = file_path.with_name(f"{new_filename}.mp3")
    file_path.rename(new_file_path)