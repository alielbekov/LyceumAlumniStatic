from PIL import Image
import os

directory = "./"

for filename in os.listdir(directory):
    if filename.endswith(".jpg") or filename.endswith(".png"):  # add any other image extensions if needed
        img = Image.open(os.path.join(directory, filename))
        ratio = img.width / img.height
        print(f"{filename}: {ratio}")
