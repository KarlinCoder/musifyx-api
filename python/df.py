import os


basename = os.path.basename("1,3 - Eyes Closed - Imagine Dragons (128).mp3")
track_number = basename.split(',')[1].split(' - ')[0]

print(track_number)