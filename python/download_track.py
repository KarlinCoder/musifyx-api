from pathlib import Path
from client import deezer_downloader
from FileFormatter import file_formatter
import os
import shutil





downloaded_track = deezer_downloader.download_albumdee(
    link_track='https://www.deezer.com/track/613831892',
    output_dir='../downloads/raw/tracks',
    quality_download='MP3_128',
    recursive_download=True,
)

song_filename = os.path.basename(downloaded_track.song_path)

file_formatter(downloaded_track.song_path)

def move_files_to_parent(folder):
    folder = Path(folder)
    
    for dir in folder.rglob('*'):
        if dir.is_dir():
            for file in dir:
                file
                
        else:
            shutil.rmtree(file)