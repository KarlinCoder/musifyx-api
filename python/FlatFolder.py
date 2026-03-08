from pathlib import Path
import shutil


def move_files_to_parent(folder):
    folder_path = Path(folder)
    
    for file_path in folder_path.rglob('*'):
        if file_path.is_file():
            # Si el padre del archivo no es la carpeta raíz, hay que moverlo
            if file_path.parent != folder_path:
                destino = folder_path / file_path.name
                
                # Manejo simple por si hay nombres duplicados
                if destino.exists():
                    pass
                else:
                    shutil.move(str(file_path), str(destino))
    
    # Opcional: borrar las carpetas vacías después de mover los archivos
    for subfolder in folder_path.iterdir():
        if subfolder.is_dir():
            shutil.rmtree(subfolder)