import os

def get_file_names(directory):
    return os.listdir(directory)

# usage
file_names = get_file_names("./")
print(file_names)
