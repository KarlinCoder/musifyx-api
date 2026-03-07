from pathlib import Path
import shutil


def move_files_to_parent(folder):
    folder_path = Path(folder)
    
    # Buscamos todos los archivos (rglob('*') busca de forma recursiva)
    # que no estén ya en la raíz (folder_path)
    for file_path in folder_path.rglob('*'):
        if file_path.is_file():
            # Si el padre del archivo no es la carpeta raíz, hay que moverlo
            if file_path.parent != folder_path:
                destino = folder_path / file_path.name
                
                # Manejo simple por si hay nombres duplicados
                if destino.exists():
                    print(f"Omitiendo: {file_path.name} ya existe en la raíz.")
                else:
                    shutil.move(str(file_path), str(destino))
                    print(f"Movido: {file_path.name}")
    
    # Opcional: borrar las carpetas vacías después de mover los archivos
    for subfolder in folder_path.iterdir():
        if subfolder.is_dir():
            shutil.rmtree(subfolder)
            print(f"Carpeta eliminada: {subfolder.name}")